/**
 * @file SubmissionsService.ts
 * @description Frontend Service layer for Submissions & Deliverables (spec §3). Islands call this
 * over `fetch`; it hits the stage submissions routes which delegate to the `projects.*` submission
 * RPCs. Backend telemetry errors are surfaced verbatim for client-side error boundaries.
 */
// deno-lint-ignore-file no-explicit-any
import { getCsrfToken } from '@projective/utils';

/** A submission as serialized by projects.fn_serialize_submission. */
export interface SubmissionDTO {
	id: string;
	number: number;
	title: string;
	ticketId: string | null;
	stageId: string;
	description: any;
	checkedItemIds: string[];
	status: 'draft' | 'pending_review' | 'accepted' | 'revisions_requested';
	submittedAt: string;
	reviewedAt: string | null;
	authorId: string;
	authorName: string;
	feedback: { global?: string; perFile?: Record<string, string>; createdAt?: string } | null;
	revisionOf: string | null;
	files: { id: string; name: string; mimeType: string; size: number; url: string }[];
}

export interface SubmitDeliverablePayload {
	ticketId: string;
	stageId?: string;
	title: string;
	description?: any;
	checkedItemIds?: string[];
	/** Ids of files already uploaded via the files API (`/api/v1/files/upload`). */
	fileIds?: string[];
}

export class SubmissionsService {
	/** Loads the deliverable ledger for a stage. */
	static async list(projectId: string, stageId: string): Promise<SubmissionDTO[]> {
		console.log(`[SUBMISSION_CLIENT] list project=${projectId} stage=${stageId}`);
		const res = await fetch(
			`/api/v1/dashboard/projects/${projectId}/stages/${stageId}/submissions`,
		);
		if (!res.ok) {
			const err = await res.json().catch(() => ({} as any));
			throw new Error(err?.error?.message || err?.error || `Failed to load submissions`);
		}
		return await res.json();
	}

	/** Files a deliverable and moves the ticket into "Review". */
	static async submit(
		projectId: string,
		payload: SubmitDeliverablePayload,
	): Promise<SubmissionDTO> {
		console.log(
			`[SUBMISSION_CLIENT] submit project=${projectId} stage=${payload.stageId} ticket=${payload.ticketId}`,
		);
		const stageId = payload.stageId!;
		const res = await fetch(
			`/api/v1/dashboard/projects/${projectId}/stages/${stageId}/submissions`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'X-CSRF': getCsrfToken() || '' },
				body: JSON.stringify(payload),
			},
		);
		if (!res.ok) {
			const err = await res.json().catch(() => ({} as any));
			const msg = err?.error?.message || err?.error || `Failed to submit deliverable`;
			console.error(`[SUBMISSION_CLIENT] submit FAILED project=${projectId} msg=${msg}`);
			throw new Error(msg);
		}
		return await res.json();
	}

	/** Accepts or requests a revision on a submission (client/owner only). */
	static async review(
		projectId: string,
		stageId: string,
		submissionId: string,
		decision: 'accept' | 'request_revision',
		feedback: { global?: string; perFile?: Record<string, string> } | null = null,
	): Promise<SubmissionDTO> {
		console.log(
			`[SUBMISSION_CLIENT] review project=${projectId} submission=${submissionId} decision=${decision}`,
		);
		const res = await fetch(
			`/api/v1/dashboard/projects/${projectId}/stages/${stageId}/submissions/${submissionId}/review`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'X-CSRF': getCsrfToken() || '' },
				body: JSON.stringify({ decision, feedback }),
			},
		);
		if (!res.ok) {
			const err = await res.json().catch(() => ({} as any));
			const msg = err?.error?.message || err?.error || `Failed to review submission`;
			console.error(
				`[SUBMISSION_CLIENT] review FAILED project=${projectId} submission=${submissionId} msg=${msg}`,
			);
			throw new Error(msg);
		}
		return await res.json();
	}
}
