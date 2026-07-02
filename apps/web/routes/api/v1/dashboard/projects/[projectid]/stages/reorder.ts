/**
 * @file reorder.ts
 * @description API Controller for bulk-updating the sort_order of project stages.
 */

// #region 1. IMPORTS
import { define } from '@utils';
import { StagesServiceBackend } from '@features/dashboard/projects/services/StagesServiceBackend.ts';
// #endregion

export const handler = define.handlers({
	/**
	 * @description Updates the sequence of stages in the DB.
	 */
	async PUT(ctx) {
		const project_id = ctx.params.projectid;

		try {
			const body = await ctx.req.json();
			const orderedIds: string[] = body.orderedIds;

			if (!orderedIds || !Array.isArray(orderedIds)) {
				return new Response(JSON.stringify({ error: 'orderedIds array is required' }), {
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			const result = await StagesServiceBackend.reorderStages(project_id, orderedIds);

			return new Response(JSON.stringify(result), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
			// deno-lint-ignore no-explicit-any
		} catch (err: any) {
			console.error('[API] PUT Stage Reorder Error:', err);
			return new Response(JSON.stringify({ error: err.message || 'Failed to reorder stages' }), {
				status: 500,
			});
		}
	},
});
