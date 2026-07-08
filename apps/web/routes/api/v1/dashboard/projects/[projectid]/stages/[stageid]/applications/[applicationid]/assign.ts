/**
 * @file assign.ts
 * @description API Controller for US-004 AC4/AC5/AC6 · accepting an application and atomically binding
 * the applicant to the seat's stage. Owner-only; the RPC rejects double-booking of overlapping active
 * slots. Thin route — all logic lives in StaffingServiceBackend / projects.assign_from_application.
 */

// #region 1. IMPORTS
// deno-lint-ignore-file no-explicit-any
import { define } from '@utils';
import { StaffingServiceBackend } from '@features/dashboard/projects/services/StaffingServiceBackend.ts';
// #endregion

export const handler = define.handlers({
	/** @description Accepts the application → creates the stage assignment (conflict-guarded). */
	async POST(ctx) {
		const { projectid, applicationid } = ctx.params;
		const startedAt = Date.now();

		try {
			console.log(
				`[STAFFING_API] POST assign begin project=${projectid} application=${applicationid}`,
			);
			const result = await StaffingServiceBackend.assignFromApplication(
				projectid,
				applicationid,
				ctx.req,
			);
			console.log(
				`[STAFFING_API] POST assign ok project=${projectid} application=${applicationid} duration_ms=${
					Date.now() - startedAt
				}`,
			);
			return new Response(JSON.stringify(result), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err: any) {
			console.error(
				`[STAFFING_API] POST assign ERROR project=${projectid} application=${applicationid} msg=${err?.message}`,
			);
			// 409 for a double-booking / already-assigned conflict; 403 for authority; 422 otherwise.
			const conflict = err?.code === '23505' || err?.code === '23P01';
			const forbidden = err?.code === '42501';
			return new Response(JSON.stringify({ error: err.message || 'Failed to assign' }), {
				status: conflict ? 409 : forbidden ? 403 : 422,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	},
});
