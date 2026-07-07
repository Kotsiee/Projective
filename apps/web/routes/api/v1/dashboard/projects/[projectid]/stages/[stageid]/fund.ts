/**
 * @file fund.ts
 * @description API controller for the "Fund Stage" action (US-005): secures escrow for an assigned
 * stage's tickets against the client's pre-loaded wallet and moves the stage assigned → active.
 * Delegates to `projects.fund_stage` via {@link StagesServiceBackend.fundStage}.
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
			const result = await StagesServiceBackend.fundStage(projectid, stageid, ctx.req);
			return new Response(JSON.stringify(result), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err: any) {
			console.error('[API] POST Fund Stage Error:', err);
			return new Response(
				JSON.stringify({ error: err.message || 'Failed to fund stage' }),
				{ status: 500 },
			);
		}
	},
});
