/**
 * @file finance.ts
 * @description API Controller returning the per-ticket escrow breakdown (Installment Monitor) for
 * the ticket modal. Delegates to the backend service, which reads the unexposed `finance.*` engine
 * through the `projects.get_ticket_finance` SECURITY DEFINER wrapper.
 */

// #region 1. IMPORTS
// deno-lint-ignore-file no-explicit-any
import { define } from '@utils';
import { TicketsServiceBackend } from '@features/dashboard/projects/services/TicketsServiceBackend.ts';
// #endregion

export const handler = define.handlers({
	/**
	 * @description Returns `{ total_cost_cents, paid_to_date_cents, locked_escrow_cents,
	 * remaining_cents, currency, installments }` for the ticket.
	 */
	async GET(ctx) {
		const { projectid, ticketid } = ctx.params;

		try {
			const finance = await TicketsServiceBackend.getFinance(projectid, ticketid, ctx.req);
			return new Response(JSON.stringify(finance), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err: any) {
			console.error('[API] GET Ticket Finance Error:', err);
			return new Response(
				JSON.stringify({ error: err.message || 'Failed to load ticket finance' }),
				{ status: 500 },
			);
		}
	},
});
