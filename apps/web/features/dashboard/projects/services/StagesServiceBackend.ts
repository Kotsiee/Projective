/**
 * @file StagesServiceBackend.ts
 * @description Backend service layer for Stage operations. Clients can create, rename, edit,
 * reorder and delete stages natively (spec §2D). Reorders preserve each column's internal ticket
 * array/order; deletions release escrow for running tickets and clear dependency references via
 * the `projects.delete_stage` RPC (0115_ticket_lifecycle_rpcs.sql).
 *
 * A request is threaded through so writes run under the caller's identity (RLS + auth.uid()).
 */
import { supabaseClient } from '@projective/backend';

export class StagesServiceBackend {
	// #region Create / Update
	/**
	 * Creates a stage, appended to the end of the pipeline.
	 *
	 * @param projectId - Owning project id.
	 * @param data - Stage payload (at minimum `name`).
	 * @param req - Caller request, for user-scoped RLS.
	 * @returns The newly created stage row.
	 */
	// deno-lint-ignore no-explicit-any
	static async createStage(projectId: string, data: any, req?: Request) {
		const supabase = await supabaseClient(req);

		const { data: stages } = await supabase
			.schema('projects')
			.from('project_stages')
			.select('sort_order')
			.eq('project_id', projectId)
			.order('sort_order', { ascending: false })
			.limit(1);

		const nextSortOrder = (stages?.[0]?.sort_order ?? -1) + 1;

		// deno-lint-ignore no-explicit-any
		const insertRow: Record<string, any> = {
			project_id: projectId,
			name: data.name,
			sort_order: nextSortOrder,
			description: data.description ?? {},
			description_text: data.description_text ?? '',
			skills: data.skills ?? [],
			file_upload_required: data.file_upload_required ?? false,
		};

		// AC4: per-stage IP override (null = inherit the project's global IP mode).
		if (data.ip_ownership_override) {
			insertRow.ip_ownership_override = data.ip_ownership_override;
			insertRow.ip_mode = data.ip_ownership_override;
		}

		// AC5: timeline sequencing — a stage either anchors at project start or waits on a
		// predecessor (dependent_on_stage).
		if (data.start_trigger_type) insertRow.start_trigger_type = data.start_trigger_type;
		if (data.start_dependency_stage_id) {
			insertRow.start_dependency_stage_id = data.start_dependency_stage_id;
		}
		if (data.start_dependency_lag_days != null) {
			insertRow.start_dependency_lag_days = data.start_dependency_lag_days;
		}

		const { data: newStage, error } = await supabase
			.schema('projects')
			.from('project_stages')
			.insert(insertRow)
			.select()
			.single();

		if (error) throw error;
		return newStage;
	}

	/**
	 * Renames or edits a stage's attributes in place.
	 *
	 * @param projectId - Owning project id.
	 * @param stageId - Stage to update.
	 * @param data - Partial stage patch (e.g. `{ name }`).
	 * @param req - Caller request, for user-scoped RLS.
	 * @returns The updated stage row.
	 */
	// deno-lint-ignore no-explicit-any
	static async updateStage(projectId: string, stageId: string, data: any, req?: Request) {
		const supabase = await supabaseClient(req);
		const { data: updated, error } = await supabase
			.schema('projects')
			.from('project_stages')
			.update(data)
			.eq('id', stageId)
			.eq('project_id', projectId)
			.select()
			.single();

		if (error) throw error;
		return updated;
	}
	// #endregion

	// #region Assignment routing (spec §"Assignment Modes")
	/**
	 * Sets how a stage distributes work via `projects.set_stage_assignment_mode` (0310). Owner-only
	 * (SQL-enforced by `can_review_project`). Modes: `open_pull` (freelancers self-claim), `round_robin`
	 * (system routes to the lowest-$W_i$ member), `manual` (owner pins), `parallel_stream` (one-off
	 * fan-out).
	 *
	 * @param _projectId - Owning project id (route scoping; the RPC is keyed on the stage).
	 * @param stageId - Stage to configure.
	 * @param mode - Target routing mode.
	 * @param req - Caller request, for user-scoped RLS.
	 */
	static async setAssignmentMode(
		_projectId: string,
		stageId: string,
		mode: 'open_pull' | 'round_robin' | 'manual' | 'parallel_stream',
		req?: Request,
	) {
		const supabase = await supabaseClient(req);
		const { error } = await supabase
			.schema('projects')
			.rpc('set_stage_assignment_mode', { p_stage_id: stageId, p_mode: mode });
		if (error) throw error;
		return { success: true, mode };
	}

	/**
	 * Runs the stage's automatic routing pass (owner-triggered). `round_robin` assigns the next ready
	 * ticket to the lowest-loaded eligible member (`projects.auto_assign_round_robin`); `parallel_stream`
	 * fans every ready ticket across the roster for concurrent execution (`projects.assign_parallel_stream`).
	 * Both enforce the concurrency caps. A no-op for the pull/manual modes.
	 *
	 * @param _projectId - Owning project id (route scoping; the RPCs are keyed on the stage).
	 * @param stageId - Stage to auto-assign within.
	 * @param mode - The stage's current routing mode (drives which RPC runs).
	 * @param req - Caller request, for user-scoped RLS.
	 * @returns `{ mode, assigned }` — for round-robin, `assigned` is the RPC verdict object; for
	 *          parallel-stream it is the count of tickets distributed.
	 */
	static async autoAssign(
		_projectId: string,
		stageId: string,
		mode: 'open_pull' | 'round_robin' | 'manual' | 'parallel_stream',
		req?: Request,
	) {
		const supabase = await supabaseClient(req);

		if (mode === 'round_robin') {
			const { data, error } = await supabase
				.schema('projects')
				.rpc('auto_assign_round_robin', { p_stage_id: stageId });
			if (error) throw error;
			return { mode, assigned: data };
		}
		if (mode === 'parallel_stream') {
			const { data, error } = await supabase
				.schema('projects')
				.rpc('assign_parallel_stream', { p_stage_id: stageId });
			if (error) throw error;
			return { mode, assigned: data as number };
		}
		throw new Error('Auto-assign is only available in round-robin or parallel-stream mode.');
	}
	// #endregion

	// #region Reorder
	/**
	 * Reorders stages atomically via `projects.reorder_stages`. Ticket sort order is independent
	 * of stage order, so each column's internal ticket array/order is preserved (spec §2D).
	 *
	 * @param projectId - Owning project id.
	 * @param orderedIds - Stage ids in their new left-to-right order.
	 * @param req - Caller request, for user-scoped RLS.
	 */
	static async reorderStages(projectId: string, orderedIds: string[], req?: Request) {
		const supabase = await supabaseClient(req);
		const { error } = await supabase
			.schema('projects')
			.rpc('reorder_stages', { p_project_id: projectId, p_ordered_ids: orderedIds });
		if (error) throw error;
		return { success: true };
	}
	// #endregion

	// #region Delete
	/**
	 * Deletes a stage via `projects.delete_stage` (spec §2D):
	 *   • Releases escrow for every actively-claimed ticket in the stage.
	 *   • Returns those tickets to the backlog pool.
	 *   • Clears the stage from all tickets' `required_stages` dependency arrays and from any
	 *     sibling stage's start-dependency reference.
	 *
	 * A stage that carries escrow history cannot be hard-deleted (finance audit trail is
	 * `ON DELETE RESTRICT`); the RPC releases funds and raises a clear error asking the caller to
	 * archive it instead.
	 *
	 * @param projectId - Owning project id.
	 * @param stageId - Stage to delete.
	 * @param req - Caller request, for user-scoped RLS.
	 */
	static async deleteStage(projectId: string, stageId: string, req?: Request) {
		const supabase = await supabaseClient(req);
		const { error } = await supabase
			.schema('projects')
			.rpc('delete_stage', { p_project_id: projectId, p_stage_id: stageId });
		if (error) throw error;
		return { success: true };
	}
	// #endregion

	// #region Finance — fund / approve / fair-exit / read (US-005, US-007)
	/**
	 * Reads the stage escrow/settlement summary via `projects.get_stage_finance` (0305):
	 * escrowed/released totals, platform fee, per-ticket rows, team payout splits and a `fundable`
	 * flag. Powers the stage Finance tab. All money runs against pre-loaded wallet balances.
	 */
	static async getStageFinance(projectId: string, stageId: string, req?: Request) {
		const supabase = await supabaseClient(req);
		const { data, error } = await supabase
			.schema('projects')
			.rpc('get_stage_finance', { p_project_id: projectId, p_stage_id: stageId });
		if (error) throw error;
		return data;
	}

	/**
	 * Funds an assigned stage's escrow via `projects.fund_stage` (US-005): holds escrow for each
	 * assigned ticket (spending-limit checked, isolated to the stage, ledgered), moves the stage
	 * `assigned → in_progress`, and notifies assignees.
	 */
	static async fundStage(projectId: string, stageId: string, req?: Request) {
		const supabase = await supabaseClient(req);
		const { data, error } = await supabase
			.schema('projects')
			.rpc('fund_stage', { p_project_id: projectId, p_stage_id: stageId });
		if (error) throw error;
		return data;
	}

	/**
	 * Final approval via `projects.approve_stage` (US-007 AC1-AC3): releases the stage's held
	 * escrow with the 5% platform fee and team smart-splits, then marks the stage `paid`.
	 */
	static async approveStage(projectId: string, stageId: string, req?: Request) {
		const supabase = await supabaseClient(req);
		const { data, error } = await supabase
			.schema('projects')
			.rpc('approve_stage', { p_project_id: projectId, p_stage_id: stageId });
		if (error) throw error;
		return data;
	}

	/**
	 * Fair-exit cancellation via `projects.cancel_stage_fair_exit` (US-007 AC4): pays the payee the
	 * 25/50/75% tier of the principal (net of fee) and refunds the remainder to the client wallet.
	 */
	static async cancelStageFairExit(
		projectId: string,
		stageId: string,
		tier: number,
		req?: Request,
	) {
		const supabase = await supabaseClient(req);
		const { data, error } = await supabase
			.schema('projects')
			.rpc('cancel_stage_fair_exit', {
				p_project_id: projectId,
				p_stage_id: stageId,
				p_tier: tier,
			});
		if (error) throw error;
		return data;
	}
	// #endregion
}
