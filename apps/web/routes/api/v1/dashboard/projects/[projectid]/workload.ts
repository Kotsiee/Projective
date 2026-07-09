/**
 * @file workload.ts
 * @description API Controller returning the caller's live Workload Intensity (W_i) vs. their
 * concurrency cap (spec §3), feeding the Workload Capacity Gauge in the staffing interface. Delegates
 * to the backend service, which reads through the `projects.get_workload_capacity` wrapper (mig 0310).
 */

// #region 1. IMPORTS
// deno-lint-ignore-file no-explicit-any
import { define } from '@utils';
import { TicketsServiceBackend } from '@features/dashboard/projects/services/TicketsServiceBackend.ts';
// #endregion

export const handler = define.handlers({
	/**
	 * @description Returns `{ current, cap, ratio, ticket_count, project_current }` for the caller,
	 * scoped to this project.
	 */
	async GET(ctx) {
		const { projectid } = ctx.params;

		try {
			const capacity = await TicketsServiceBackend.getWorkloadCapacity(projectid, ctx.req);
			return new Response(JSON.stringify(capacity), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err: any) {
			console.error('[API] GET Workload Capacity Error:', err);
			return new Response(
				JSON.stringify({ error: err.message || 'Failed to load workload capacity' }),
				{ status: 500 },
			);
		}
	},
});
