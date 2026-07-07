/**
 * @file approve.ts
 * @description API controller for the "Final Approval" action (US-007 AC1-AC3): releases the
 * stage's held escrow to the payee(s) with the 5% platform fee and team smart-splits applied.
 * Delegates to `projects.approve_stage` via {@link StagesServiceBackend.approveStage}.
 */

// #region IMPORTS
// deno-lint-ignore-file no-explicit-any
import { define } from '@utils';
import { StagesServiceBackend } from '@features/dashboard/projects/services/StagesServiceBackend.ts';
// #endregion

export const handler = define.handlers({
	async POST(ctx) {
		const { projectid, stageid } = ctx.params;

		try {
			const result = await StagesServiceBackend.approveStage(projectid, stageid, ctx.req);
			return new Response(JSON.stringify(result), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err: any) {
			console.error('[API] POST Approve Stage Error:', err);
			return new Response(
				JSON.stringify({ error: err.message || 'Failed to approve stage' }),
				{ status: 500 },
			);
		}
	},
});
