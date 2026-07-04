/**
 * @file complete.ts
 * @description API Controller for the "Force complete ticket" action (spec §3d): marks all stages
 * resolved and releases the final balances. Delegates to `projects.complete_ticket` via the service.
 */

// #region 1. IMPORTS
// deno-lint-ignore-file no-explicit-any
import { define } from '@utils';
import { TicketsServiceBackend } from '@features/dashboard/projects/services/TicketsServiceBackend.ts';
// #endregion

export const handler = define.handlers({
	/**
	 * @description Completes the entire ticket, releasing any remaining held escrow to the payee.
	 */
	async POST(ctx) {
		const { projectid, ticketid } = ctx.params;

		try {
			const result = await TicketsServiceBackend.completeTicket(projectid, ticketid, ctx.req);
			return new Response(JSON.stringify(result), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err: any) {
			console.error('[API] POST Complete Ticket Error:', err);
			return new Response(
				JSON.stringify({ error: err.message || 'Failed to complete ticket' }),
				{ status: 500 },
			);
		}
	},
});
