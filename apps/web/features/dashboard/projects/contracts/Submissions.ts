/**
 * @file Submissions.ts
 * @description Frontend contracts + pure logic for the Stage "Submissions" workflow.
 *
 * The backend for submissions / ticket checklists / revision-cost rules does not
 * exist yet, so these types are the app-side source of truth. They are driven by
 * seed data (see contexts/submissionsSeed.ts) and hydrated into local signal state
 * by SubmissionsContext — islands stay dumb, exactly like the packaged UploadFile
 * library does with its own seed.
 *
 * All the branching business rules the UI depends on (deliverable gatekeeping,
 * revision costing, the role-based tree shape) live here as pure functions so they
 * can be unit-reasoned about and reused by every surface.
 */

import type { FileWithMeta } from '@projective/types';

/* #region Tickets & checklists */

export interface ChecklistItem {
	id: string;
	label: string;
	/** Whether the freelancer has ticked this item on the current draft. */
	done: boolean;
}

/**
 * A unit of work inside a stage that a submission can be filed against.
 * `requiresFiles` + the presence of a checklist together determine the ticket's
 * deliverable "kind" (see {@link ticketKind}).
 */
export interface StageTicket {
	id: string;
	title: string;
	/** Whether a file deliverable is part of the definition of done. */
	requiresFiles: boolean;
	/** Empty array => this ticket has no checklist. */
	checklist: ChecklistItem[];
}

export type TicketKind = 'file' | 'checklist' | 'hybrid';

/** Classifies a ticket by what it demands to be considered delivered. */
export function ticketKind(ticket: StageTicket): TicketKind {
	const hasChecklist = ticket.checklist.length > 0;
	if (hasChecklist && ticket.requiresFiles) return 'hybrid';
	if (hasChecklist) return 'checklist';
	return 'file';
}

/* #endregion */

/* #region Submissions */

export type SubmissionStatus =
	| 'draft'
	| 'pending_review'
	| 'accepted'
	| 'revisions_requested';

export interface SubmissionFile {
	id: string;
	name: string;
	url: string;
	mimeType: string;
	size: number;
	/** Optional custom directory this file was filed under, for the client tree. */
	directory?: string;
}

export interface SubmissionFeedback {
	/** Overall comment on the submission. */
	global: string;
	/** fileId -> reviewer note. */
	perFile: Record<string, string>;
	createdAt: string;
}

export interface Submission {
	id: string;
	/** Sequential number used for the default "New Submission #N" title. */
	number: number;
	title: string;
	ticketId: string | null;
	/** Rich-text work description (stored as HTML). */
	description: string;
	files: SubmissionFile[];
	/** Checklist item ids ticked at submit time. */
	checkedItemIds: string[];
	status: SubmissionStatus;
	submittedAt: string;
	authorId: string;
	authorName: string;
	feedback?: SubmissionFeedback;
}

/** Distinct custom directories referenced by a submission's files, in order. */
export function submissionDirectories(submission: Submission): string[] {
	const seen: string[] = [];
	for (const f of submission.files) {
		if (f.directory && !seen.includes(f.directory)) seen.push(f.directory);
	}
	return seen;
}

/* #endregion */

/* #region Workspace (roster / role / policy) */

export interface StageFreelancer {
	id: string;
	name: string;
	avatarUrl: string | null;
}

/** Which perspective the current viewer takes on the Submissions surface. */
export type SubmissionViewerRole = 'freelancer' | 'client';

/**
 * Everything the Submissions surface needs, assembled from seed + the live stage.
 */
export interface SubmissionsWorkspace {
	role: SubmissionViewerRole;
	/** True when the stage has more than one freelancer contributing. */
	multiFreelancer: boolean;
	freelancers: StageFreelancer[];
	/** For the freelancer role: which roster member the viewer is. */
	currentFreelancerId: string | null;
	tickets: StageTicket[];
	submissions: Submission[];
	revisionPolicy: RevisionPolicy;
}

/* #endregion */

/* #region Revision costing */

export interface RevisionPolicy {
	/** Revision iterations included in the stage contract at no extra charge. */
	freeRevisions: number;
	/** How many have already been consumed on this stage. */
	usedRevisions: number;
	/** Charge for each iteration beyond the free allowance. */
	perRevisionCents: number;
	currency: string;
}

export interface RevisionCostBreakdown {
	/** True when the next revision is still covered by the free allowance. */
	isFree: boolean;
	/** Free iterations left after this one is counted. */
	remainingFree: number;
	feeCents: number;
	totalCents: number;
	currency: string;
}

/** Costs out the *next* revision iteration against the stage's policy. */
export function computeRevisionCost(policy: RevisionPolicy): RevisionCostBreakdown {
	const willBeFree = policy.usedRevisions < policy.freeRevisions;
	const remainingFree = Math.max(0, policy.freeRevisions - policy.usedRevisions - 1);
	const feeCents = willBeFree ? 0 : policy.perRevisionCents;
	return {
		isFree: willBeFree,
		remainingFree,
		feeCents,
		totalCents: feeCents,
		currency: policy.currency,
	};
}

/* #endregion */

/* #region Validation engine (freelancer submission gatekeeper) */

export type SubmissionField = 'checklist' | 'description' | 'files';

export interface SubmissionDraft {
	ticket: StageTicket | null;
	description: string;
	files: FileWithMeta[];
	checkedItemIds: string[];
}

export interface SubmissionValidation {
	ok: boolean;
	errors: Partial<Record<SubmissionField, string>>;
	/** True when the checklist exists but isn't fully ticked (partial delivery). */
	partialDelivery: boolean;
}

/**
 * The conditional gatekeeper from the spec. Enforces, per ticket kind:
 *  - Checklist tickets: ≥1 item checked; a partial tick-set forces a description.
 *  - File tickets: ≥1 uploaded file.
 *  - Hybrid tickets: ≥1 checked item (with the description rule) AND ≥1 file.
 */
export function validateSubmission(draft: SubmissionDraft): SubmissionValidation {
	const errors: Partial<Record<SubmissionField, string>> = {};
	const ticket = draft.ticket;

	if (!ticket) {
		return {
			ok: false,
			errors: { checklist: 'Select a ticket to submit against.' },
			partialDelivery: false,
		};
	}

	const kind = ticketKind(ticket);
	const hasChecklist = ticket.checklist.length > 0;
	const checkedCount = draft.checkedItemIds.length;
	const allChecked = hasChecklist && checkedCount === ticket.checklist.length;
	const partialDelivery = hasChecklist && !allChecked;
	const descProvided = stripHtml(draft.description).length > 0;

	// Checklist gate.
	if (hasChecklist && checkedCount < 1) {
		errors.checklist = 'Check at least one item to record what you completed.';
	}

	// Forced-description gate: partial delivery must be explained.
	if (partialDelivery && checkedCount >= 1 && !descProvided) {
		errors.description = 'Not all checklist items are done — describe what was delivered and why.';
	}

	// Deliverable gate.
	const needsFile = kind === 'file' || kind === 'hybrid';
	if (needsFile && draft.files.length < 1) {
		errors.files = kind === 'hybrid'
			? 'Hybrid tickets need at least one file and one checked item.'
			: 'Upload at least one file to submit this deliverable.';
	}

	return { ok: Object.keys(errors).length === 0, errors, partialDelivery };
}

/** Cheap HTML → text used only to test for "is the description empty". */
export function stripHtml(html: string): string {
	return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

/* #endregion */

/* #region Client review tree */

export type SubmissionTreeKind = 'freelancer' | 'submission' | 'directory';

export interface SubmissionTreeNode {
	id: string;
	label: string;
	kind: SubmissionTreeKind;
	children: SubmissionTreeNode[];
	/** The submission this node resolves to when selected (freelancer nodes have none). */
	submissionId?: string;
	/** For directory nodes: the custom directory name to scope files to. */
	directory?: string;
	/** Count badge (submissions under a freelancer, files under a submission/dir). */
	count?: number;
}

/**
 * Builds the far-left directory hierarchy for the client review workspace.
 *  - Multi-freelancer: `Freelancers > Submissions > Custom Directories`.
 *  - Single-freelancer: the user node is bypassed → `Submissions > Custom Directories`.
 */
export function buildSubmissionTree(workspace: SubmissionsWorkspace): SubmissionTreeNode[] {
	const submissionNode = (s: Submission): SubmissionTreeNode => {
		const dirs = submissionDirectories(s).map<SubmissionTreeNode>((dir) => ({
			id: `${s.id}::${dir}`,
			label: dir,
			kind: 'directory',
			children: [],
			submissionId: s.id,
			directory: dir,
			count: s.files.filter((f) => f.directory === dir).length,
		}));
		return {
			id: s.id,
			label: s.title,
			kind: 'submission',
			children: dirs,
			submissionId: s.id,
			count: s.files.length,
		};
	};

	if (!workspace.multiFreelancer) {
		return workspace.submissions.map(submissionNode);
	}

	return workspace.freelancers.map<SubmissionTreeNode>((f) => {
		const owned = workspace.submissions.filter((s) => s.authorId === f.id);
		return {
			id: f.id,
			label: f.name,
			kind: 'freelancer',
			children: owned.map(submissionNode),
			count: owned.length,
		};
	});
}

/* #endregion */

/* #region Money formatting */

/** Formats integer cents as a localized currency string (e.g. 4500 → "$45.00"). */
export function formatMoney(cents: number, currency: string): string {
	try {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
			cents / 100,
		);
	} catch {
		return `${(cents / 100).toFixed(2)} ${currency}`;
	}
}

/* #endregion */
