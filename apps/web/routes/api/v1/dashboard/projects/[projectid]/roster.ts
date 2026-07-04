/**
 * @file roster.ts
 * @description API Controller returning the project roster (freelancers eligible for ticket
 * assignment) for the ticket modal's "Reassign" picker (spec §3b). Delegates to the backend service,
 * which reads through the `projects.get_project_roster` SECURITY DEFINER wrapper.
 */

// #region 1. IMPORTS
// deno-lint-ignore-file no-explicit-any
import { define } from '@utils';
import { TicketsServiceBackend } from '@features/dashboard/projects/services/TicketsServiceBackend.ts';
// #endregion

export const handler = define.handlers({
	/**
	 * @description Returns `[{ profile_id, name, avatar, role }]` for the project's assignable
	 * freelancers.
	 */
	async GET(ctx) {
		const { projectid } = ctx.params;

		try {
			const roster = await TicketsServiceBackend.getProjectRoster(projectid, ctx.req);
			return new Response(JSON.stringify(roster), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err: any) {
			console.error('[API] GET Project Roster Error:', err);
			return new Response(
				JSON.stringify({ error: err.message || 'Failed to load project roster' }),
				{ status: 500 },
			);
		}
	},
});
