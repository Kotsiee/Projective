/**
 * @file auto-assign.ts
 * @description API Controller that runs a stage's automatic routing pass (spec §"Assignment Modes").
 * Owner-triggered; dispatches to `projects.auto_assign_round_robin` or `projects.assign_parallel_stream`
 * based on the stage's current mode. Both enforce the concurrency caps.
 */

// #region 1. IMPORTS
// deno-lint-ignore-file no-explicit-any
import { define } from '@utils';
import { StagesServiceBackend } from '@features/dashboard/projects/services/StagesServiceBackend.ts';
// #endregion

export const handler = define.handlers({
	/**
	 * @description Runs auto-assignment for the stage in `{ mode }`.
	 */
	async POST(ctx) {
		const { projectid, stageid } = ctx.params;

		try {
			const body = await ctx.req.json();
			const mode = body.mode;

			if (mode !== 'round_robin' && mode !== 'parallel_stream') {
				return new Response(
					JSON.stringify({ error: 'Auto-assign requires round-robin or parallel-stream mode' }),
					{ status: 400, headers: { 'Content-Type': 'application/json' } },
				);
			}

			const result = await StagesServiceBackend.autoAssign(projectid, stageid, mode, ctx.req);
			return new Response(JSON.stringify(result), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err: any) {
			console.error('[API] POST Auto-Assign Error:', err);
			return new Response(
				JSON.stringify({ error: err.message || 'Failed to auto-assign' }),
				{ status: 500 },
			);
		}
	},
});
