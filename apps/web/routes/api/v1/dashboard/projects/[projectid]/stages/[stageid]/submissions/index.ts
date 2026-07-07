/**
 * @file index.ts
 * @description API Controller for the Submissions & Deliverables ledger of a stage (spec §3
 * "Submissions State Machine"). GET lists the stage's submissions; POST files a new deliverable
 * (freelancer surface) and pushes the ticket into "Review". Thin route — persistence + state machine
 * live in the SubmissionsServiceBackend / `projects.*` submission RPCs.
 */

// #region 1. IMPORTS
// deno-lint-ignore-file no-explicit-any
import { define } from '@utils';
import { z } from 'zod';
import { SubmissionsServiceBackend } from '@features/dashboard/projects/services/SubmissionsServiceBackend.ts';
// #endregion

const SubmitSchema = z.object({
	ticketId: z.string().uuid(),
	// The route already scopes the stage; accept an explicit override but default to the path param.
	stageId: z.string().uuid().optional(),
	title: z.string().max(300).optional().default(''),
	description: z.any().optional(),
	checkedItemIds: z.array(z.string()).optional(),
	fileIds: z.array(z.string().uuid()).optional(),
});

export const handler = define.handlers({
	/**
	 * @description Lists the deliverable ledger for the stage (newest first).
	 */
	async GET(ctx) {
		const { projectid, stageid } = ctx.params;
		const startedAt = Date.now();

		try {
			console.log(`[SUBMISSION_API] GET list begin project=${projectid} stage=${stageid}`);
			const rows = await SubmissionsServiceBackend.listForStage(projectid, stageid, ctx.req);
			console.log(
				`[SUBMISSION_API] GET list ok project=${projectid} stage=${stageid} count=${
					Array.isArray(rows) ? rows.length : 0
				} duration_ms=${Date.now() - startedAt}`,
			);
			return new Response(JSON.stringify(rows), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err: any) {
			console.error(
				`[SUBMISSION_API] GET list ERROR project=${projectid} stage=${stageid} msg=${err?.message} duration_ms=${
					Date.now() - startedAt
				}`,
			);
			const isGuard = err?.code === 'P0001' || err?.code === '42501';
			return new Response(JSON.stringify({ error: err.message || 'Failed to load submissions' }), {
				status: isGuard ? 403 : 500,
			});
		}
	},

	/**
	 * @description Files a new deliverable against a ticket and moves it into the Review column.
	 */
	async POST(ctx) {
		const { projectid, stageid } = ctx.params;
		const startedAt = Date.now();

		try {
			const body = await ctx.req.json();
			const validation = SubmitSchema.safeParse(body);
			if (!validation.success) {
				console.warn(
					`[SUBMISSION_API] POST submit validation failed project=${projectid} stage=${stageid} issues=${
						JSON.stringify(validation.error.flatten())
					}`,
				);
				return new Response(
					JSON.stringify({ error: 'Validation failed', details: validation.error.format() }),
					{ status: 400, headers: { 'Content-Type': 'application/json' } },
				);
			}

			console.log(
				`[SUBMISSION_API] POST submit begin ts=${
					new Date().toISOString()
				} project=${projectid} stage=${stageid} ticket=${validation.data.ticketId} files=${
					validation.data.fileIds?.length ?? 0
				}`,
			);

			const submission = await SubmissionsServiceBackend.submit(
				projectid,
				{
					ticketId: validation.data.ticketId,
					stageId: validation.data.stageId ?? stageid,
					title: validation.data.title,
					description: validation.data.description,
					checkedItemIds: validation.data.checkedItemIds,
					fileIds: validation.data.fileIds,
				},
				ctx.req,
			);

			console.log(
				`[SUBMISSION_API] POST submit ok project=${projectid} stage=${stageid} duration_ms=${
					Date.now() - startedAt
				}`,
			);
			return new Response(JSON.stringify(submission), {
				status: 201,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err: any) {
			console.error(
				`[SUBMISSION_API] POST submit ERROR project=${projectid} stage=${stageid} msg=${err?.message} duration_ms=${
					Date.now() - startedAt
				}`,
			);
			const isGuard = err?.code === 'P0001' || err?.code === '42501' || err?.code === '23514';
			return new Response(
				JSON.stringify({ error: err.message || 'Failed to submit deliverable' }),
				{
					status: isGuard ? 422 : 500,
					headers: { 'Content-Type': 'application/json' },
				},
			);
		}
	},
});
