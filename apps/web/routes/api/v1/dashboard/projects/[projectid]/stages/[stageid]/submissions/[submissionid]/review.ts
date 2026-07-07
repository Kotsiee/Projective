/**
 * @file review.ts
 * @description API Controller for reviewing a deliverable (spec §3 "verify the reviewer is
 * authorized via Project Role permissions before approving/rejecting"). Thin route: parse + validate
 * + delegate to `review_submission`, whose RBAC guard (projects.can_review_project) enforces that
 * only the owner / paying client business may adjudicate.
 */

// #region 1. IMPORTS
// deno-lint-ignore-file no-explicit-any
import { define } from '@utils';
import { z } from 'zod';
import { SubmissionsServiceBackend } from '@features/dashboard/projects/services/SubmissionsServiceBackend.ts';
// #endregion

const ReviewSchema = z.object({
	decision: z.enum(['accept', 'request_revision']),
	feedback: z.object({
		global: z.string().optional(),
		perFile: z.record(z.string(), z.string()).optional(),
	}).optional().nullable(),
});

export const handler = define.handlers({
	/**
	 * @description Accepts or requests a revision on a submission.
	 */
	async POST(ctx) {
		const { projectid, submissionid } = ctx.params;
		const startedAt = Date.now();

		try {
			const body = await ctx.req.json();
			const validation = ReviewSchema.safeParse(body);
			if (!validation.success) {
				console.warn(
					`[SUBMISSION_API] POST review validation failed project=${projectid} submission=${submissionid} issues=${
						JSON.stringify(validation.error.flatten())
					}`,
				);
				return new Response(
					JSON.stringify({ error: 'Validation failed', details: validation.error.format() }),
					{ status: 400, headers: { 'Content-Type': 'application/json' } },
				);
			}

			console.log(
				`[SUBMISSION_API] POST review begin ts=${
					new Date().toISOString()
				} project=${projectid} submission=${submissionid} decision=${validation.data.decision}`,
			);

			const submission = await SubmissionsServiceBackend.review(
				projectid,
				submissionid,
				validation.data.decision,
				validation.data.feedback ?? null,
				ctx.req,
			);

			console.log(
				`[SUBMISSION_API] POST review ok project=${projectid} submission=${submissionid} decision=${validation.data.decision} duration_ms=${
					Date.now() - startedAt
				}`,
			);
			return new Response(JSON.stringify(submission), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err: any) {
			console.error(
				`[SUBMISSION_API] POST review ERROR project=${projectid} submission=${submissionid} msg=${err?.message} duration_ms=${
					Date.now() - startedAt
				}`,
			);
			const isGuard = err?.code === 'P0001' || err?.code === '42501' || err?.code === '23514';
			return new Response(JSON.stringify({ error: err.message || 'Failed to review submission' }), {
				status: isGuard ? 422 : 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	},
});
