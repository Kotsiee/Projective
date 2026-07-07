/**
 * @file summary.ts
 * @description API Controller for the project Quick-Inspector summary (spec §4). Returns high-density
 * metadata — Kanban column counts, next milestone deadline, pending-submission warnings, unsettled
 * escrow — for the split-pane inspection canvas. Thin route over ProjectsBackendService.getCardSummary.
 */

// #region 1. IMPORTS
// deno-lint-ignore-file no-explicit-any
import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import { ProjectsBackendService } from '@features/dashboard/projects/services/ProjectsServiceBackend.ts';
// #endregion

export const handler = define.handlers({
	/**
	 * @description Fetches the high-density inspector summary for a project card.
	 */
	async GET(ctx) {
		const project_id = ctx.params.projectid;
		const startedAt = Date.now();

		if (!project_id) {
			return new Response(JSON.stringify({ error: 'Project ID is required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		try {
			const getClient = () =>
				Promise.resolve((ctx.state as any).supabaseClient ?? supabaseClient(ctx.req));

			console.log(`[PROJECT_INSPECTOR_API] GET summary begin project=${project_id}`);
			const res = await ProjectsBackendService.getCardSummary(project_id, { getClient });

			if (!res.ok) {
				console.warn(
					`[PROJECT_INSPECTOR_API] GET summary not-ok project=${project_id} msg=${res.error?.message}`,
				);
				return new Response(JSON.stringify({ error: res.error }), {
					status: res.error.status ?? 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			console.log(
				`[PROJECT_INSPECTOR_API] GET summary ok project=${project_id} duration_ms=${
					Date.now() - startedAt
				}`,
			);
			return new Response(JSON.stringify(res.data), {
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err: any) {
			console.error(
				`[PROJECT_INSPECTOR_API] GET summary ERROR project=${project_id} msg=${err?.message} duration_ms=${
					Date.now() - startedAt
				}`,
			);
			return new Response(JSON.stringify({ error: 'Failed to fetch project summary' }), {
				status: 500,
			});
		}
	},
});
