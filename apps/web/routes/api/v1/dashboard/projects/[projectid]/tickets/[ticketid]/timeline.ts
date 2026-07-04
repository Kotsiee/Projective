/**
 * @file timeline.ts
 * @description API Controller returning the ordered ticket history for the modal's Timeline tab.
 */

// #region 1. IMPORTS
// deno-lint-ignore-file no-explicit-any
import { define } from '@utils';
import { TicketsServiceBackend } from '@features/dashboard/projects/services/TicketsServiceBackend.ts';
// #endregion

export const handler = define.handlers({
	/**
	 * @description Returns the ticket's history rows (most-recent first) with actor name/avatar.
	 */
	async GET(ctx) {
		const { projectid, ticketid } = ctx.params;

		try {
			const timeline = await TicketsServiceBackend.getTimeline(projectid, ticketid, ctx.req);
			return new Response(JSON.stringify(timeline), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err: any) {
			console.error('[API] GET Ticket Timeline Error:', err);
			return new Response(
				JSON.stringify({ error: err.message || 'Failed to load ticket timeline' }),
				{ status: 500 },
			);
		}
	},
});
