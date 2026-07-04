/**
 * @file force-complete-stage.ts
 * @description API Controller for the client "Approve phase" / force-complete-current-stage action
 * (spec §3c). Releases the current stage's installment and advances the ticket to (and funds) the
 * next required stage — or completes the ticket on the final stage — via the backend service.
 */

// #region 1. IMPORTS
// deno-lint-ignore-file no-explicit-any
import { define } from '@utils';
import { TicketsServiceBackend } from '@features/dashboard/projects/services/TicketsServiceBackend.ts';
// #endregion

export const handler = define.handlers({
	/**
	 * @description Force-completes the ticket's current stage; returns `{ nextStageId }` (null once
	 * the ticket itself is completed).
	 */
	async POST(ctx) {
		const { projectid, ticketid } = ctx.params;

		try {
			const result = await TicketsServiceBackend.forceCompleteStage(projectid, ticketid, ctx.req);
			return new Response(JSON.stringify(result), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err: any) {
			console.error('[API] POST Force Complete Stage Error:', err);
			return new Response(
				JSON.stringify({ error: err.message || 'Failed to complete stage' }),
				{ status: 500 },
			);
		}
	},
});
