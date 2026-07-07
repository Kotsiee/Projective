/**
 * @file status.ts
 * @description API Controller for Project Lifecycle transitions (spec §3 "Project Mutations
 * Handler"). Thin route: parse + validate + delegate to the lifecycle service, which wraps the
 * guarded `projects.set_project_status` RPC (rigid activation/completion assertions live in SQL).
 */

// #region 1. IMPORTS
// deno-lint-ignore-file no-explicit-any
import { define } from '@utils';
import { z } from 'zod';
import { ProjectLifecycleServiceBackend } from '@features/dashboard/projects/services/ProjectLifecycleServiceBackend.ts';
// #endregion

const SetStatusSchema = z.object({
	status: z.enum(['draft', 'active', 'on_hold', 'completed', 'cancelled']),
	reason: z.string().max(2000).optional().nullable(),
});

/**
 * Shared transition path for POST and its PATCH alias. Parses + validates + delegates to the guarded
 * lifecycle service; illegal transitions are rejected by the RPC with a descriptive error.
 */
async function transition(ctx: any): Promise<Response> {
	const { projectid } = ctx.params;
	const startedAt = Date.now();

	try {
		const body = await ctx.req.json();
		const validation = SetStatusSchema.safeParse(body);
		if (!validation.success) {
			console.warn(
				`[PROJECT_LIFECYCLE_API] status validation failed project=${projectid} issues=${
					JSON.stringify(validation.error.flatten())
				}`,
			);
			return new Response(
				JSON.stringify({ error: 'Validation failed', details: validation.error.format() }),
				{ status: 400, headers: { 'Content-Type': 'application/json' } },
			);
		}

		console.log(
			`[PROJECT_LIFECYCLE_API] status begin ts=${
				new Date().toISOString()
			} project=${projectid} to=${validation.data.status}`,
		);

		const result = await ProjectLifecycleServiceBackend.setStatus(
			projectid,
			validation.data.status,
			validation.data.reason ?? null,
			ctx.req,
		);

		console.log(
			`[PROJECT_LIFECYCLE_API] status ok project=${projectid} to=${result.status} duration_ms=${
				Date.now() - startedAt
			}`,
		);
		return new Response(JSON.stringify(result), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err: any) {
		console.error(
			`[PROJECT_LIFECYCLE_API] status ERROR project=${projectid} msg=${err?.message} duration_ms=${
				Date.now() - startedAt
			}`,
		);
		// Validation/authorization failures raised by the RPC map to 422; unknown -> 500.
		const isGuard = err?.code === 'P0001' || err?.code === '42501' || err?.code === '23514';
		return new Response(
			JSON.stringify({ error: err.message || 'Failed to change project status' }),
			{ status: isGuard ? 422 : 500, headers: { 'Content-Type': 'application/json' } },
		);
	}
}

export const handler = define.handlers({
	/**
	 * @description Transitions the project to a new lifecycle status (draft/active/on_hold/completed/
	 * cancelled).
	 */
	POST(ctx) {
		return transition(ctx);
	},

	/**
	 * @description PATCH alias for the transition (kept for backward-compatible callers).
	 */
	PATCH(ctx) {
		return transition(ctx);
	},

	/**
	 * @description Returns the project's lifecycle transition history (closure/audit surface).
	 */
	async GET(ctx) {
		const { projectid } = ctx.params;

		try {
			const history = await ProjectLifecycleServiceBackend.getStatusHistory(projectid, ctx.req);
			return new Response(JSON.stringify(history), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err: any) {
			console.error(
				`[PROJECT_LIFECYCLE_API] GET status history ERROR project=${projectid} msg=${err?.message}`,
			);
			return new Response(
				JSON.stringify({ error: err.message || 'Failed to load status history' }),
				{
					status: 500,
				},
			);
		}
	},
});
