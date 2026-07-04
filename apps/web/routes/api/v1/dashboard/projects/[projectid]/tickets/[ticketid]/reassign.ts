/**
 * @file reassign.ts
 * @description API Controller for the "Reassign" action (spec §3b): hands a ticket from its current
 * freelancer to another (or unassigns). The backend service composes release + claim so escrow stays
 * consistent.
 */

// #region 1. IMPORTS
// deno-lint-ignore-file no-explicit-any
import { define } from '@utils';
import { TicketsServiceBackend } from '@features/dashboard/projects/services/TicketsServiceBackend.ts';
// #endregion

export const handler = define.handlers({
	/**
	 * @description Reassigns the ticket to `assignee_id` (or null to unassign).
	 */
	async POST(ctx) {
		const { projectid, ticketid } = ctx.params;

		try {
			const body = await ctx.req.json().catch(() => ({}));
			const newAssigneeId: string | null = body.assignee_id ?? null;

			const result = await TicketsServiceBackend.reassign(
				projectid,
				ticketid,
				newAssigneeId,
				ctx.req,
			);

			return new Response(JSON.stringify(result), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err: any) {
			console.error('[API] POST Reassign Ticket Error:', err);
			return new Response(
				JSON.stringify({ error: err.message || 'Failed to reassign ticket' }),
				{ status: 500 },
			);
		}
	},
});
