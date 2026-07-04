/**
 * @file TicketsServiceBackend.ts
 * @description Backend service layer for Ticket operations. Enforces the ticket lifecycle,
 * purchase-eligibility, claim, force-majeure deletion and workload-dispute rules (spec §2).
 *
 * Escrow/finance side effects are delegated to SECURITY DEFINER RPCs in the `projects` schema
 * (0115_ticket_lifecycle_rpcs.sql), which in turn drive the internal `finance.*` engine
 * (0009_finance_tables.sql). The `finance` schema is not exposed to the API, so services never
 * touch it directly. A request is threaded through so writes run under the caller's identity
 * (RLS + auth.uid()); omit it only for trusted server-internal callers.
 *
 * @see documentation/business/brain2.md — Islands / thin-routes-fat-services architecture.
 */
import { supabaseClient } from '@projective/backend';

// #region Types
/** Purchase/checkout initialization pathways (spec §2A). */
export type PurchaseMethod = 'buy_now' | 'basket' | 'invoice';

/** Fields a workload-intensity report carries when filed by a freelancer (spec §2C). */
export interface WorkloadReportInput {
	reason: string;
	reported_intensity?: number;
}
// #endregion

export class TicketsServiceBackend {
	// #region Creation & Editing
	/**
	 * Creates a ticket in the project backlog.
	 *
	 * A ticket only requires a `title` to be initialized (spec §2A). A comprehensive
	 * `description` is NOT required at creation — it gates *purchasing/claiming* later, so
	 * `payment_status` stays `unpaid` and the ticket is non-purchasable until described.
	 *
	 * @param projectId - Owning project id.
	 * @param data - Validated ticket payload (title required; stage/intensity/etc. optional).
	 * @param req - Caller request, for user-scoped RLS.
	 * @returns The newly created ticket row.
	 */
	static async createTicket(
		projectId: string,
		// deno-lint-ignore no-explicit-any
		data: { title: string; description?: any; [key: string]: any },
		req?: Request,
	) {
		const supabase = await supabaseClient(req);

		const { description, text_description, ...rest } = data;

		const { data: newTicket, error } = await supabase
			.schema('projects')
			.from('tickets')
			.insert({
				...rest,
				project_id: projectId,
				title: data.title,
				description: description ?? {},
				text_description: text_description ?? '',
				status: rest.status ?? 'backlog',
			})
			.select()
			.single();

		if (error) throw error;
		return newTicket;
	}

	/**
	 * Updates a ticket's attributes.
	 *
	 * Claim restriction (spec §2B): while unclaimed, any attribute may change. Once a freelancer
	 * has claimed the ticket, the client may only re-sequence stages that have not yet been
	 * started/claimed — content fields (title, description, workload, due date, unit price) are
	 * frozen. We enforce this by restricting the mutable field-set post-claim to the safe subset
	 * (stage re-sequencing + board movement).
	 *
	 * @param projectId - Owning project id.
	 * @param ticketId - Ticket to update.
	 * @param data - Partial ticket patch.
	 * @param req - Caller request, for user-scoped RLS.
	 * @returns The updated ticket row.
	 */
	static async updateTicket(
		projectId: string,
		ticketId: string,
		// deno-lint-ignore no-explicit-any
		data: any,
		req?: Request,
	) {
		const supabase = await supabaseClient(req);

		const { data: current } = await supabase
			.schema('projects')
			.from('tickets')
			.select('current_assignee_id')
			.eq('id', ticketId)
			.single();

		let patch = data;
		if (current?.current_assignee_id) {
			// Post-claim: only stage sequencing / board movement is permitted.
			const allowed = ['required_stages', 'sort_order', 'current_stage_id', 'status'];
			patch = Object.fromEntries(
				Object.entries(data).filter(([k]) => allowed.includes(k)),
			);
			const rejected = Object.keys(data).filter((k) => !allowed.includes(k));
			if (rejected.length > 0) {
				throw new Error(
					`Ticket is claimed: cannot edit ${
						rejected.join(', ')
					}. Only unstarted stage sequencing may change.`,
				);
			}
		}

		const { data: updated, error } = await supabase
			.schema('projects')
			.from('tickets')
			.update({ ...patch, updated_at: new Date().toISOString() })
			.eq('id', ticketId)
			.eq('project_id', projectId)
			.select()
			.single();

		if (error) throw error;
		return updated;
	}
	// #endregion

	// #region Claim / Complete / Escrow lifecycle
	/**
	 * A freelancer claims a ticket. Delegates to `projects.claim_ticket`, which validates
	 * purchase eligibility (a comprehensive description must exist), stamps the claim, and moves
	 * escrow into the `held` state immediately (spec §2A escrow lifecycle).
	 *
	 * @param projectId - Owning project id.
	 * @param ticketId - Ticket being claimed.
	 * @param assigneeId - Freelancer user id claiming the ticket.
	 * @param req - Caller request, for user-scoped RLS.
	 * @returns `{ escrowId }` — null when escrow prerequisites are absent (legitimate no-op).
	 */
	static async claimTicket(projectId: string, ticketId: string, assigneeId: string, req?: Request) {
		const supabase = await supabaseClient(req);
		const { data, error } = await supabase
			.schema('projects')
			.rpc('claim_ticket', { p_ticket_id: ticketId, p_assignee_id: assigneeId });
		if (error) throw error;
		return { escrowId: data as string | null };
	}

	/**
	 * Marks a ticket complete and releases its held escrow to the assigned payee
	 * (fees/bonuses/team splits applied inside the finance engine).
	 *
	 * @param projectId - Owning project id.
	 * @param ticketId - Ticket to complete.
	 * @param req - Caller request, for user-scoped RLS.
	 */
	static async completeTicket(projectId: string, ticketId: string, req?: Request) {
		const supabase = await supabaseClient(req);
		const { error } = await supabase
			.schema('projects')
			.rpc('complete_ticket', { p_ticket_id: ticketId });
		if (error) throw error;
		return { success: true };
	}

	/**
	 * Returns a ticket to the open backlog after its freelancer is removed mid-work: locked
	 * escrow is released to the freelancer and the ticket is reset to "New" (spec §2B force majeure).
	 *
	 * @param projectId - Owning project id.
	 * @param ticketId - Ticket to reset.
	 * @param req - Caller request, for user-scoped RLS.
	 */
	static async releaseToBacklog(projectId: string, ticketId: string, req?: Request) {
		const supabase = await supabaseClient(req);
		const { error } = await supabase
			.schema('projects')
			.rpc('release_ticket_to_backlog', { p_ticket_id: ticketId });
		if (error) throw error;
		return { success: true };
	}
	/**
	 * Force-completes the ticket's *current* stage (client override / "Approve phase"). Delegates to
	 * `projects.force_complete_stage`, which releases the current installment's escrow and either
	 * advances the ticket to (and funds) the next required stage, or completes the whole ticket on the
	 * final stage. Distinct from {@link completeTicket}, which terminates the ticket outright.
	 *
	 * @param projectId - Owning project id.
	 * @param ticketId - Ticket whose current stage is being approved.
	 * @param req - Caller request, for user-scoped RLS.
	 * @returns `{ nextStageId }` — the newly-current stage, or null once the ticket is completed.
	 */
	static async forceCompleteStage(projectId: string, ticketId: string, req?: Request) {
		const supabase = await supabaseClient(req);
		const { data, error } = await supabase
			.schema('projects')
			.rpc('force_complete_stage', { p_ticket_id: ticketId });
		if (error) throw error;
		return { nextStageId: (data as string | null) ?? null };
	}

	/**
	 * Reassigns a ticket to a different freelancer (owner override from the `…` menu). Composed from
	 * the existing lifecycle RPCs so escrow stays consistent: the outgoing assignee (if any) is paid
	 * out and the ticket reset to backlog via `release_ticket_to_backlog`, then the incoming assignee
	 * claims it via `claim_ticket` (which re-holds escrow). Passing `null` simply releases to backlog.
	 *
	 * @param projectId - Owning project id.
	 * @param ticketId - Ticket to reassign.
	 * @param newAssigneeId - Incoming freelancer user id, or null to unassign.
	 * @param req - Caller request, for user-scoped RLS.
	 * @returns `{ escrowId }` for the new claim (null when unassigning or no escrow prerequisites).
	 */
	static async reassign(
		projectId: string,
		ticketId: string,
		newAssigneeId: string | null,
		req?: Request,
	) {
		const supabase = await supabaseClient(req);

		const { data: current } = await supabase
			.schema('projects')
			.from('tickets')
			.select('current_assignee_id')
			.eq('id', ticketId)
			.single();

		// Pay out + release the outgoing assignee before handing the ticket over.
		if (current?.current_assignee_id) {
			const { error: relErr } = await supabase
				.schema('projects')
				.rpc('release_ticket_to_backlog', { p_ticket_id: ticketId });
			if (relErr) throw relErr;
		}

		if (!newAssigneeId) return { escrowId: null };

		const { data, error } = await supabase
			.schema('projects')
			.rpc('claim_ticket', { p_ticket_id: ticketId, p_assignee_id: newAssigneeId });
		if (error) throw error;
		return { escrowId: (data as string | null) ?? null };
	}
	// #endregion

	// #region Read models — finance breakdown & timeline (spec §2 modal)
	/**
	 * Returns the per-ticket escrow breakdown powering the modal's Installment Monitor, via
	 * `projects.get_ticket_finance`: total cost, paid-to-date, locked-in-escrow, remaining balance,
	 * currency, and a per-stage installment list. Reads the unexposed `finance.*` engine through the
	 * SECURITY DEFINER wrapper (guarded by `projects.has_project_access`).
	 *
	 * @param projectId - Owning project id (for symmetry / route scoping).
	 * @param ticketId - Ticket to summarize.
	 * @param req - Caller request, for user-scoped RLS.
	 */
	static async getFinance(projectId: string, ticketId: string, req?: Request) {
		const supabase = await supabaseClient(req);
		const { data, error } = await supabase
			.schema('projects')
			.rpc('get_ticket_finance', { p_ticket_id: ticketId })
			.single();
		if (error) throw error;
		return data;
	}

	/**
	 * Returns the ordered ticket history for the modal's Timeline tab (actor name/avatar joined), via
	 * `projects.get_ticket_timeline`.
	 *
	 * @param projectId - Owning project id (for route scoping).
	 * @param ticketId - Ticket whose history is requested.
	 * @param req - Caller request, for user-scoped RLS.
	 */
	static async getTimeline(projectId: string, ticketId: string, req?: Request) {
		const supabase = await supabaseClient(req);
		const { data, error } = await supabase
			.schema('projects')
			.rpc('get_ticket_timeline', { p_ticket_id: ticketId });
		if (error) throw error;
		return data ?? [];
	}

	/**
	 * Project roster for the "Reassign" picker (spec §3b): the freelancers eligible to take a ticket
	 * (project participants + current stage assignees), with display name/avatar. Project-scoped, but
	 * co-located with the modal read-models it feeds. Reads via `projects.get_project_roster`, guarded
	 * by has_project_access.
	 *
	 * @param projectId - Project whose roster is requested.
	 * @param req - Caller request, for user-scoped RLS.
	 */
	static async getProjectRoster(projectId: string, req?: Request) {
		const supabase = await supabaseClient(req);
		const { data, error } = await supabase
			.schema('projects')
			.rpc('get_project_roster', { p_project_id: projectId });
		if (error) throw error;
		return data ?? [];
	}
	// #endregion

	// #region Deletion (Force Majeure)
	/**
	 * Deletes a ticket under the force-majeure protocol (spec §2B), via `projects.delete_ticket`:
	 *   • Unclaimed  -> purged immediately.
	 *   • Claimed    -> escrow released in full to the freelancer as compensation, then purged.
	 *
	 * @param projectId - Owning project id.
	 * @param ticketId - Ticket to delete.
	 * @param req - Caller request, for user-scoped RLS.
	 */
	static async deleteTicket(projectId: string, ticketId: string, req?: Request) {
		const supabase = await supabaseClient(req);
		const { error } = await supabase
			.schema('projects')
			.rpc('delete_ticket', { p_ticket_id: ticketId });
		if (error) throw error;
		return { success: true };
	}
	// #endregion

	// #region Workload-Intensity Dispute (spec §2C)
	/**
	 * Files a workload-intensity report on a ticket. Inserting the report row fires
	 * `projects.fn_open_workload_report`, which hides the ticket from public backlogs and
	 * suspends work for the configured window (48h default). The expiry sweep
	 * (`projects.fn_resolve_expired_workload_reports`) applies penalties if the client never
	 * adjusts the terms.
	 *
	 * @param projectId - Owning project id.
	 * @param ticketId - Ticket being reported.
	 * @param input - Reason and (optional) the freelancer's assessed intensity.
	 * @param req - Caller request, for user-scoped RLS (reporter identity via auth.uid()).
	 */
	static async reportTicket(
		projectId: string,
		ticketId: string,
		input: WorkloadReportInput,
		req?: Request,
	) {
		const supabase = await supabaseClient(req);

		const { data: { user } } = await supabase.auth.getUser();
		if (!user) throw new Error('Authentication required to file a workload report.');

		const { data: ticket } = await supabase
			.schema('projects')
			.from('tickets')
			.select('workload_intensity')
			.eq('id', ticketId)
			.single();

		const { data: report, error } = await supabase
			.schema('projects')
			.from('ticket_workload_reports')
			.insert({
				ticket_id: ticketId,
				reporter_user_id: user.id,
				claimed_intensity: ticket?.workload_intensity ?? null,
				reported_intensity: input.reported_intensity ?? null,
				reason: input.reason,
			})
			.select()
			.single();

		if (error) throw error;
		return report;
	}
	// #endregion

	// #region Purchasing / Checkout (spec §2A)
	/**
	 * Initializes a ticket purchase. Enforces purchase eligibility — a ticket cannot be funded
	 * until it has a comprehensive `description` — then routes to the requested checkout pathway:
	 * "Buy Now", basket checkout, or intervaled invoicing (verified corporate business profiles).
	 *
	 * Escrow itself is held on *claim*, not here; this endpoint drives checkout initialization.
	 *
	 * @param projectId - Owning project id.
	 * @param ticketId - Ticket being purchased.
	 * @param method - Checkout pathway.
	 * @param req - Caller request, for user-scoped RLS.
	 * @returns `{ method, checkoutUrl }` describing where to route the client next.
	 */
	static async purchaseTicket(
		projectId: string,
		ticketId: string,
		method: PurchaseMethod,
		req?: Request,
	) {
		const supabase = await supabaseClient(req);

		const { data: ticket } = await supabase
			.schema('projects')
			.from('tickets')
			.select('description')
			.eq('id', ticketId)
			.single();

		if (!ticket?.description || Object.keys(ticket.description).length === 0) {
			throw new Error('A comprehensive description is required before purchasing a ticket.');
		}

		// Route to the appropriate checkout initialization pathway.
		switch (method) {
			case 'buy_now':
				return { method, checkoutUrl: `/checkout?ticket=${ticketId}&mode=buy_now` };
			case 'basket':
				return { method, checkoutUrl: `/checkout?project=${projectId}` };
			case 'invoice':
				return { method, checkoutUrl: `/checkout?ticket=${ticketId}&mode=invoice` };
			default:
				throw new Error(`Unsupported purchase method: ${method}`);
		}
	}
	// #endregion
}
