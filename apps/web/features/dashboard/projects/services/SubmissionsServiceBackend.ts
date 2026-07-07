/**
 * @file SubmissionsServiceBackend.ts
 * @description Backend service layer for the Submissions & Deliverables workflow (spec §3
 * "Submissions State Machine"). Replaces the former frontend-only mock with real persistence via the
 * `projects.*` submission RPCs (0120):
 *   • get_stage_submissions  — read the deliverable ledger for a stage.
 *   • submit_deliverable      — a freelancer files work + attaches (already-uploaded) file ids and
 *                               the ticket moves into the "Review" column.
 *   • review_submission       — the client/owner accepts or requests a revision (RBAC-guarded in SQL
 *                               by projects.can_review_project).
 *
 * File bytes are uploaded ahead of time through the files API (`/api/v1/files/upload`), mirroring how
 * project creation references pre-uploaded `global_attachments` ids — this service only links ids.
 * Per the telemetry mandate every path emits structured `[SUBMISSION_SVC]` checkpoints.
 */
import { supabaseClient } from '@projective/backend';

// #region Types
/** Payload a freelancer submits when filing a deliverable against a ticket. */
export interface SubmitDeliverableInput {
	ticketId: string;
	stageId: string;
	title: string;
	// deno-lint-ignore no-explicit-any
	description?: any;
	checkedItemIds?: string[];
	/** Ids of files already uploaded via the files API. */
	fileIds?: string[];
}

/** A client/owner review decision on a submission. */
export type ReviewDecision = 'accept' | 'request_revision';

export interface ReviewFeedback {
	global?: string;
	perFile?: Record<string, string>;
}
// #endregion

export class SubmissionsServiceBackend {
	/**
	 * Lists the deliverable ledger for a stage (guarded by has_project_access inside the RPC).
	 *
	 * @param projectId - Owning project id.
	 * @param stageId - Stage whose submissions are requested.
	 * @param req - Caller request, for user-scoped RLS.
	 * @returns Array of serialized submissions (newest first).
	 */
	static async listForStage(projectId: string, stageId: string, req?: Request) {
		const startedAt = Date.now();
		const supabase = await supabaseClient(req);

		console.log(`[SUBMISSION_SVC] listForStage begin project=${projectId} stage=${stageId}`);

		const { data, error } = await supabase
			.schema('projects')
			.rpc('get_stage_submissions', { p_project_id: projectId, p_stage_id: stageId });

		if (error) {
			console.error(
				`[SUBMISSION_SVC] listForStage FAILED project=${projectId} stage=${stageId} msg=${error.message} duration_ms=${
					Date.now() - startedAt
				}`,
			);
			throw error;
		}

		const rows = (data as unknown[]) ?? [];
		console.log(
			`[SUBMISSION_SVC] listForStage ok project=${projectId} stage=${stageId} count=${rows.length} duration_ms=${
				Date.now() - startedAt
			}`,
		);
		return rows;
	}

	/**
	 * Files a deliverable and pushes the ticket into "Review". Delegates to `submit_deliverable`.
	 *
	 * @param projectId - Owning project id (route scoping).
	 * @param input - Deliverable payload (ticket, stage, title, description, checklist, file ids).
	 * @param req - Caller request, for user-scoped RLS (submitter identity via auth.uid()).
	 * @returns The created submission (serialized, with its files).
	 */
	static async submit(projectId: string, input: SubmitDeliverableInput, req?: Request) {
		const startedAt = Date.now();
		const supabase = await supabaseClient(req);

		console.log(
			`[SUBMISSION_SVC] submit begin ts=${
				new Date().toISOString()
			} project=${projectId} ticket=${input.ticketId} stage=${input.stageId} files=${
				input.fileIds?.length ?? 0
			}`,
		);

		const { data, error } = await supabase
			.schema('projects')
			.rpc('submit_deliverable', {
				p_ticket_id: input.ticketId,
				p_stage_id: input.stageId,
				p_title: input.title,
				p_description: input.description ?? {},
				p_checked_item_ids: input.checkedItemIds ?? [],
				p_file_ids: input.fileIds ?? [],
			});

		if (error) {
			console.error(
				`[SUBMISSION_SVC] submit FAILED project=${projectId} ticket=${input.ticketId} code=${
					error.code ?? '-'
				} msg=${error.message} duration_ms=${Date.now() - startedAt}`,
			);
			throw error;
		}

		console.log(
			`[SUBMISSION_SVC] submit ok project=${projectId} ticket=${input.ticketId} submission=${
				(data as { id?: string })?.id ?? '-'
			} duration_ms=${Date.now() - startedAt}`,
		);
		return data;
	}

	/**
	 * Adjudicates a submission (accept / request revision). RBAC is enforced in SQL: only the owner or
	 * the paying client business may review (projects.can_review_project).
	 *
	 * @param projectId - Owning project id (route scoping).
	 * @param submissionId - Submission being reviewed.
	 * @param decision - `accept` | `request_revision`.
	 * @param feedback - Optional structured feedback (global + per-file notes).
	 * @param req - Caller request, for user-scoped RLS.
	 * @returns The updated submission (serialized).
	 */
	static async review(
		projectId: string,
		submissionId: string,
		decision: ReviewDecision,
		feedback: ReviewFeedback | null,
		req?: Request,
	) {
		const startedAt = Date.now();
		const supabase = await supabaseClient(req);

		console.log(
			`[SUBMISSION_SVC] review begin ts=${
				new Date().toISOString()
			} project=${projectId} submission=${submissionId} decision=${decision}`,
		);

		const feedbackPayload = feedback
			? {
				global: feedback.global ?? '',
				perFile: feedback.perFile ?? {},
				createdAt: new Date().toISOString(),
			}
			: null;

		const { data, error } = await supabase
			.schema('projects')
			.rpc('review_submission', {
				p_submission_id: submissionId,
				p_decision: decision,
				p_feedback: feedbackPayload,
			});

		if (error) {
			console.error(
				`[SUBMISSION_SVC] review FAILED project=${projectId} submission=${submissionId} decision=${decision} code=${
					error.code ?? '-'
				} msg=${error.message} duration_ms=${Date.now() - startedAt}`,
			);
			throw error;
		}

		console.log(
			`[SUBMISSION_SVC] review ok project=${projectId} submission=${submissionId} decision=${decision} duration_ms=${
				Date.now() - startedAt
			}`,
		);
		return data;
	}
}
