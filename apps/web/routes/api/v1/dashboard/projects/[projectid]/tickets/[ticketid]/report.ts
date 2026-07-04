/**
 * @file report.ts
 * @description API Controller for filing a workload-intensity dispute on a ticket. Inserting the
 * report suspends work and hides the ticket for the configured window via a DB trigger (spec §2C).
 */

// #region 1. IMPORTS
// deno-lint-ignore-file no-explicit-any
import { define } from '@utils';
import { TicketsServiceBackend } from '@features/dashboard/projects/services/TicketsServiceBackend.ts';
// #endregion

export const handler = define.handlers({
	/**
	 * @description Files a workload-intensity report against a ticket.
	 */
	async POST(ctx) {
		const { projectid, ticketid } = ctx.params;

		try {
			const body = await ctx.req.json();
			const reason: string = body.reason;

			if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
				return new Response(JSON.stringify({ error: 'A report reason is required' }), {
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			const report = await TicketsServiceBackend.reportTicket(
				projectid,
				ticketid,
				{ reason, reported_intensity: body.reported_intensity },
				ctx.req,
			);

			return new Response(JSON.stringify(report), {
				status: 201,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err: any) {
			console.error('[API] POST Ticket Report Error:', err);
			return new Response(JSON.stringify({ error: err.message || 'Failed to report ticket' }), {
				status: 500,
			});
		}
	},
});
