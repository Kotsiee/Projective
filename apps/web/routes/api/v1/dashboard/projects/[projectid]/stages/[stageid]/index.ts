/**
 * @file index.ts
 * @description API route controller for fetching and managing an existing project stage.
 */

// #region IMPORTS
// deno-lint-ignore-file no-explicit-any
import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import { ProjectsBackendService } from '@features/dashboard/projects/services/ProjectsServiceBackend.ts';
import { StagesServiceBackend } from '@features/dashboard/projects/services/StagesServiceBackend.ts';
// #endregion

export const handler = define.handlers({
	/**
	 * @description Fetches the details of a specific stage.
	 */
	async GET(ctx) {
		const project_id = ctx.params.projectid;
		const stage_id = ctx.params.stageid;

		if (!project_id || !stage_id) {
			return new Response(JSON.stringify({ error: 'Project ID and Stage ID are required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		try {
			const getClient = () =>
				Promise.resolve((ctx.state as any).supabaseClient ?? supabaseClient(ctx.req));

			const res = await ProjectsBackendService.getStage(project_id, stage_id, {
				getClient,
			});

			if (!res.ok) {
				return new Response(JSON.stringify({ error: res.error }), {
					status: res.error.status ?? 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			return new Response(JSON.stringify(res.data), {
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err) {
			console.error('API Error:', err);
			return new Response(JSON.stringify({ error: 'Failed to fetch stage' }), {
				status: 500,
			});
		}
	},

	/**
	 * @description Deletes a project stage and handles related ticket escrow dependencies.
	 */
	async DELETE(ctx) {
		const { projectid, stageid } = ctx.params;

		try {
			await StagesServiceBackend.deleteStage(projectid, stageid, ctx.req);
			return new Response(null, { status: 204 });
		} catch (err: any) {
			console.error('[API] DELETE Stage Error:', err);
			return new Response(JSON.stringify({ error: err.message || 'Failed to delete stage' }), {
				status: 500,
			});
		}
	},
});
