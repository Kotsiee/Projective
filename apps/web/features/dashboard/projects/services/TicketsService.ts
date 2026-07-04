/**
 * @file TicketsService.ts
 * @description Frontend Service layer for Tickets.
 */
// deno-lint-ignore-file no-explicit-any
import { getCsrfToken } from '@projective/utils';

/** A freelancer eligible for ticket assignment, as surfaced by the reassign roster picker. */
export interface RosterMember {
	profile_id: string;
	name: string;
	/** Image variants blob (may be null); the picker falls back to an initials avatar. */
	avatar: unknown | null;
	role: string;
}

export class TicketsService {
	static async createTicket(
		projectId: string,
		data: any,
	): Promise<any> {
		const res = await fetch(`/api/v1/dashboard/projects/${projectId}/tickets`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'X-CSRF': getCsrfToken() || '' },
			body: JSON.stringify(data),
		});

		if (!res.ok) {
			const errData = await res.json().catch(() => ({}));
			const msg = errData.details
				? JSON.stringify(errData.details)
				: (errData.error?.message || errData.error || res.statusText);

			throw new Error(msg);
		}

		return await res.json();
	}

	static async updateTicket(projectId: string, ticketId: string, data: any): Promise<any> {
		const res = await fetch(`/api/v1/dashboard/projects/${projectId}/tickets/${ticketId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json', 'X-CSRF': getCsrfToken() || '' },
			body: JSON.stringify(data),
		});
		if (!res.ok) {
			const err = await res.json().catch(() => ({} as any));
			// Route errors are `{ error: "message" }`; middleware errors (auth/CSRF) are
			// `{ error: { code, message } }`. Handle both so the message is never `[object Object]`.
			throw new Error(err?.error?.message || err?.error || `Failed to update ticket`);
		}
		return await res.json();
	}

	static async deleteTicket(projectId: string, ticketId: string): Promise<void> {
		const res = await fetch(`/api/v1/dashboard/projects/${projectId}/tickets/${ticketId}`, {
			method: 'DELETE',
			headers: { 'X-CSRF': getCsrfToken() || '' },
		});
		if (!res.ok) throw new Error(`Failed to delete ticket`);
	}

	static async reportTicketWorkload(
		projectId: string,
		ticketId: string,
		reason: string,
	): Promise<void> {
		const res = await fetch(`/api/v1/dashboard/projects/${projectId}/tickets/${ticketId}/report`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'X-CSRF': getCsrfToken() || '' },
			body: JSON.stringify({ reason }),
		});
		if (!res.ok) throw new Error(`Failed to report ticket`);
	}

	static async purchaseTicket(
		projectId: string,
		ticketId: string,
		method: 'buy_now' | 'basket' | 'invoice',
	): Promise<any> {
		const res = await fetch(
			`/api/v1/dashboard/projects/${projectId}/tickets/${ticketId}/purchase`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'X-CSRF': getCsrfToken() || '' },
				body: JSON.stringify({ method }),
			},
		);
		if (!res.ok) throw new Error(`Failed to purchase ticket. Ensure description is provided.`);
		return await res.json();
	}

	// #region Modal read models — finance breakdown & timeline
	/** Loads the ticket's escrow breakdown (Installment Monitor sidebar). */
	static async getFinance(projectId: string, ticketId: string): Promise<any> {
		const res = await fetch(
			`/api/v1/dashboard/projects/${projectId}/tickets/${ticketId}/finance`,
		);
		if (!res.ok) {
			const err = await res.json().catch(() => ({} as any));
			throw new Error(err?.error?.message || err?.error || 'Failed to load finance breakdown');
		}
		return await res.json();
	}

	/** Loads the ticket's history (Timeline tab). */
	static async getTimeline(projectId: string, ticketId: string): Promise<any[]> {
		const res = await fetch(
			`/api/v1/dashboard/projects/${projectId}/tickets/${ticketId}/timeline`,
		);
		if (!res.ok) {
			const err = await res.json().catch(() => ({} as any));
			throw new Error(err?.error?.message || err?.error || 'Failed to load timeline');
		}
		return await res.json();
	}

	/** Loads the project roster for the reassign picker (spec §3b). */
	static async getProjectRoster(projectId: string): Promise<RosterMember[]> {
		const res = await fetch(`/api/v1/dashboard/projects/${projectId}/roster`);
		if (!res.ok) {
			const err = await res.json().catch(() => ({} as any));
			throw new Error(err?.error?.message || err?.error || 'Failed to load roster');
		}
		return (await res.json()) as RosterMember[];
	}
	// #endregion

	// #region `…` menu lifecycle actions
	/** Force-completes the ticket's current stage ("Approve phase" / spec §3c). */
	static async forceCompleteStage(projectId: string, ticketId: string): Promise<any> {
		const res = await fetch(
			`/api/v1/dashboard/projects/${projectId}/tickets/${ticketId}/force-complete-stage`,
			{ method: 'POST', headers: { 'X-CSRF': getCsrfToken() || '' } },
		);
		if (!res.ok) {
			const err = await res.json().catch(() => ({} as any));
			throw new Error(err?.error?.message || err?.error || 'Failed to complete stage');
		}
		return await res.json();
	}

	/** Force-completes the whole ticket, releasing final balances (spec §3d). */
	static async forceCompleteTicket(projectId: string, ticketId: string): Promise<any> {
		const res = await fetch(
			`/api/v1/dashboard/projects/${projectId}/tickets/${ticketId}/complete`,
			{ method: 'POST', headers: { 'X-CSRF': getCsrfToken() || '' } },
		);
		if (!res.ok) {
			const err = await res.json().catch(() => ({} as any));
			throw new Error(err?.error?.message || err?.error || 'Failed to complete ticket');
		}
		return await res.json();
	}

	/** Reassigns the ticket to another freelancer, or unassigns when `assigneeId` is null (spec §3b). */
	static async reassign(
		projectId: string,
		ticketId: string,
		assigneeId: string | null,
	): Promise<any> {
		const res = await fetch(
			`/api/v1/dashboard/projects/${projectId}/tickets/${ticketId}/reassign`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'X-CSRF': getCsrfToken() || '' },
				body: JSON.stringify({ assignee_id: assigneeId }),
			},
		);
		if (!res.ok) {
			const err = await res.json().catch(() => ({} as any));
			throw new Error(err?.error?.message || err?.error || 'Failed to reassign ticket');
		}
		return await res.json();
	}
	// #endregion
}
