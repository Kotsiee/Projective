/**
 * @file finance.ts
 * @description GET the stage escrow/settlement summary (US-005 / US-007). Thin controller that
 * delegates to `projects.get_stage_finance` via {@link StagesServiceBackend.getStageFinance}.
 */

// #region IMPORTS
// deno-lint-ignore-file no-explicit-any
import { define } from '@utils';
import { StagesServiceBackend } from '@features/dashboard/projects/services/StagesServiceBackend.ts';
// #endregion

export const handler = define.handlers({
	async GET(ctx) {
		const { projectid, stageid } = ctx.params;

		try {
			const finance = await StagesServiceBackend.getStageFinance(projectid, stageid, ctx.req);
			return new Response(JSON.stringify(finance), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err: any) {
			console.error('[API] GET Stage Finance Error:', err);
			return new Response(
				JSON.stringify({ error: err.message || 'Failed to load stage finance' }),
				{ status: 500 },
			);
		}
	},
});
