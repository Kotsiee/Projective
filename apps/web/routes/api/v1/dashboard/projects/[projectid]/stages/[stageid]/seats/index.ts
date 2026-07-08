/**
 * @file index.ts
 * @description API Controller for US-004 · Stage Staffing. GET returns the staffing surface for a
 * stage (open seats + required skills + applicants, and current assignments); POST defines a new open
 * seat (client/owner surface). Thin route — authority + persistence live in StaffingServiceBackend /
 * the `projects.*` staffing RPCs (0307).
 */

// #region 1. IMPORTS
// deno-lint-ignore-file no-explicit-any
import { define } from '@utils';
import { z } from 'zod';
import { StaffingServiceBackend } from '@features/dashboard/projects/services/StaffingServiceBackend.ts';
// #endregion

const CreateSeatSchema = z.object({
	description: z.string().min(1).max(2000),
	budgetMinCents: z.number().int().nonnegative().nullish(),
	budgetMaxCents: z.number().int().nonnegative().nullish(),
	requireProposals: z.boolean().optional().default(true),
	skillIds: z.array(z.string().uuid()).optional().default([]),
});

export const handler = define.handlers({
	/** @description Reads the staffing surface (seats, applicants, assignments) for the stage. */
	async GET(ctx) {
		const { projectid, stageid } = ctx.params;
		const startedAt = Date.now();

		try {
			console.log(`[STAFFING_API] GET begin project=${projectid} stage=${stageid}`);
			const staffing = await StaffingServiceBackend.getStageStaffing(projectid, stageid, ctx.req);
			console.log(
				`[STAFFING_API] GET ok project=${projectid} stage=${stageid} duration_ms=${
					Date.now() - startedAt
				}`,
			);
			return new Response(JSON.stringify(staffing), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err: any) {
			console.error(
				`[STAFFING_API] GET ERROR project=${projectid} stage=${stageid} msg=${err?.message}`,
			);
			const isGuard = err?.code === 'P0001' || err?.code === '42501';
			return new Response(JSON.stringify({ error: err.message || 'Failed to load staffing' }), {
				status: isGuard ? 403 : 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	},

	/** @description Defines a new open seat (+ required skills) on the stage. Owner-only (SQL-enforced). */
	async POST(ctx) {
		const { projectid, stageid } = ctx.params;
		const startedAt = Date.now();

		try {
			const body = await ctx.req.json();
			const validation = CreateSeatSchema.safeParse(body);
			if (!validation.success) {
				return new Response(
					JSON.stringify({ error: 'Validation failed', details: validation.error.format() }),
					{ status: 400, headers: { 'Content-Type': 'application/json' } },
				);
			}

			console.log(`[STAFFING_API] POST seat begin project=${projectid} stage=${stageid}`);
			const seat = await StaffingServiceBackend.createSeat(
				projectid,
				{
					stageId: stageid,
					description: validation.data.description,
					budgetMinCents: validation.data.budgetMinCents ?? null,
					budgetMaxCents: validation.data.budgetMaxCents ?? null,
					requireProposals: validation.data.requireProposals,
					skillIds: validation.data.skillIds,
				},
				ctx.req,
			);
			console.log(
				`[STAFFING_API] POST seat ok project=${projectid} stage=${stageid} duration_ms=${
					Date.now() - startedAt
				}`,
			);
			return new Response(JSON.stringify(seat), {
				status: 201,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err: any) {
			console.error(
				`[STAFFING_API] POST seat ERROR project=${projectid} stage=${stageid} msg=${err?.message}`,
			);
			const isGuard = err?.code === 'P0001' || err?.code === '42501' || err?.code === '23514';
			return new Response(JSON.stringify({ error: err.message || 'Failed to create seat' }), {
				status: isGuard ? 422 : 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	},
});
