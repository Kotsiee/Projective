/**
 * @file cancel.ts
 * @description API controller for the fair-exit cancellation action (US-007 AC4): pays the payee
 * the 25/50/75% progress tier of the principal (net of the platform fee) and refunds the remainder
 * to the client wallet. Delegates to `projects.cancel_stage_fair_exit` via the service.
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
			const body = await ctx.req.json().catch(() => ({}));
			const tier = Number(body?.tier);
			if (![25, 50, 75].includes(tier)) {
				return new Response(
					JSON.stringify({ error: 'Fair-exit tier must be 25, 50, or 75.' }),
					{ status: 400, headers: { 'Content-Type': 'application/json' } },
				);
			}

			const result = await StagesServiceBackend.cancelStageFairExit(
				projectid,
				stageid,
				tier,
				ctx.req,
			);
			return new Response(JSON.stringify(result), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err: any) {
			console.error('[API] POST Cancel Stage (fair exit) Error:', err);
			return new Response(
				JSON.stringify({ error: err.message || 'Failed to cancel stage' }),
				{ status: 500 },
			);
		}
	},
});
