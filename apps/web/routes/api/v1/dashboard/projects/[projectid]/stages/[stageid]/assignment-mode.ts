/**
 * @file assignment-mode.ts
 * @description API Controller for configuring a stage's assignment routing mode (spec §"Assignment
 * Modes"). Delegates to the backend service → `projects.set_stage_assignment_mode` (owner-only).
 */

// #region 1. IMPORTS
// deno-lint-ignore-file no-explicit-any
import { define } from '@utils';
import { StagesServiceBackend } from '@features/dashboard/projects/services/StagesServiceBackend.ts';
// #endregion

const MODES = ['open_pull', 'round_robin', 'manual', 'parallel_stream'] as const;

export const handler = define.handlers({
	/**
	 * @description Sets `{ mode }` on the stage.
	 */
	async POST(ctx) {
		const { projectid, stageid } = ctx.params;

		try {
			const body = await ctx.req.json();
			const mode = body.mode;

			if (!MODES.includes(mode)) {
				return new Response(JSON.stringify({ error: 'A valid assignment mode is required' }), {
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			const result = await StagesServiceBackend.setAssignmentMode(
				projectid,
				stageid,
				mode,
				ctx.req,
			);
			return new Response(JSON.stringify(result), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err: any) {
			console.error('[API] POST Assignment Mode Error:', err);
			return new Response(
				JSON.stringify({ error: err.message || 'Failed to set assignment mode' }),
				{ status: 500 },
			);
		}
	},
});
