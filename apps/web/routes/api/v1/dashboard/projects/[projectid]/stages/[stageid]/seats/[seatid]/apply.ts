/**
 * @file apply.ts
 * @description API Controller for US-004 AC2/AC3 · submitting an application to an open seat. A
 * freelancer applies for themselves; a team application is gated to team leads inside the RPC. Thin
 * route — authority lives in StaffingServiceBackend / projects.apply_to_seat (0307).
 */

// #region 1. IMPORTS
// deno-lint-ignore-file no-explicit-any
import { define } from '@utils';
import { z } from 'zod';
import { StaffingServiceBackend } from '@features/dashboard/projects/services/StaffingServiceBackend.ts';
// #endregion

const ApplySchema = z.object({
	applicantType: z.enum(['freelancer', 'team']),
	applicantProfileId: z.string().uuid(),
	message: z.string().max(2000).nullish(),
});

export const handler = define.handlers({
	/** @description Files an application (freelancer or team) against the seat. */
	async POST(ctx) {
		const { projectid, seatid } = ctx.params;
		const startedAt = Date.now();

		try {
			const body = await ctx.req.json();
			const validation = ApplySchema.safeParse(body);
			if (!validation.success) {
				return new Response(
					JSON.stringify({ error: 'Validation failed', details: validation.error.format() }),
					{ status: 400, headers: { 'Content-Type': 'application/json' } },
				);
			}

			console.log(
				`[STAFFING_API] POST apply begin project=${projectid} seat=${seatid} type=${validation.data.applicantType}`,
			);
			const application = await StaffingServiceBackend.apply(
				projectid,
				{
					seatId: seatid,
					applicantType: validation.data.applicantType,
					applicantProfileId: validation.data.applicantProfileId,
					message: validation.data.message ?? null,
				},
				ctx.req,
			);
			console.log(
				`[STAFFING_API] POST apply ok project=${projectid} seat=${seatid} duration_ms=${
					Date.now() - startedAt
				}`,
			);
			return new Response(JSON.stringify(application), {
				status: 201,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err: any) {
			console.error(
				`[STAFFING_API] POST apply ERROR project=${projectid} seat=${seatid} msg=${err?.message}`,
			);
			const isGuard = err?.code === 'P0001' || err?.code === '42501' || err?.code === '23505' ||
				err?.code === '23514';
			return new Response(JSON.stringify({ error: err.message || 'Failed to apply' }), {
				status: isGuard ? 422 : 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	},
});
