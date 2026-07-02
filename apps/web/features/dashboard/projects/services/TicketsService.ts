/**
 * @file TicketsService.ts
 * @description Frontend Service layer for Tickets.
 */
// deno-lint-ignore-file no-explicit-any
import { getCsrfToken } from '@projective/utils';

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
			const err = await res.json();
			throw new Error(err.error || `Failed to update ticket`);
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
}
