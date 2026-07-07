/**
 * @file SubmissionsContext.tsx
 * @description Local state hub for the Stage "Submissions" surface. Hydrates seed
 * data into signals and exposes the mutations the freelancer/client surfaces drive.
 * Islands stay dumb — no direct data access — matching the app's architecture rules.
 */

import { ComponentChildren, createContext } from 'preact';
import { useContext, useEffect, useMemo } from 'preact/hooks';
import { computed, Signal, useSignal } from '@preact/signals';
import type { FileWithMeta } from '@projective/types';
import {
	buildSubmissionTree,
	computeRevisionCost,
	type RevisionCostBreakdown,
	type StageTicket,
	type Submission,
	type SubmissionFeedback,
	type SubmissionFile,
	type SubmissionsWorkspace,
	type SubmissionTreeNode,
	type SubmissionViewerRole,
} from '../contracts/Submissions.ts';
import {
	SEED_FREELANCERS,
	SEED_REVISION_POLICY,
	SEED_SUBMISSIONS,
	SEED_TICKETS,
} from './submissionsSeed.ts';
import { type SubmissionDTO, SubmissionsService } from '../services/SubmissionsService.ts';

/** Maps a persisted submission DTO onto the local Submission model the surfaces render. */
function fromDTO(dto: SubmissionDTO): Submission {
	return {
		id: dto.id,
		number: dto.number ?? 0,
		title: dto.title,
		ticketId: dto.ticketId ?? null,
		description: typeof dto.description === 'string' ? dto.description : '',
		files: (dto.files ?? []).map((f) => ({
			id: f.id,
			name: f.name,
			url: f.url || '',
			mimeType: f.mimeType,
			size: f.size,
		})),
		checkedItemIds: dto.checkedItemIds ?? [],
		status: dto.status,
		submittedAt: dto.submittedAt,
		authorId: dto.authorId,
		authorName: dto.authorName,
		feedback: dto.feedback
			? {
				global: dto.feedback.global ?? '',
				perFile: dto.feedback.perFile ?? {},
				createdAt: dto.feedback.createdAt ?? new Date().toISOString(),
			}
			: undefined,
	};
}

export interface CreateSubmissionInput {
	title: string;
	ticketId: string | null;
	description: string;
	files: FileWithMeta[];
	checkedItemIds: string[];
}

export interface SubmissionsState {
	role: SubmissionViewerRole;
	workspace: Signal<SubmissionsWorkspace>;
	/** Submission currently focused in a review/detail surface. */
	activeSubmissionId: Signal<string | null>;
	activeSubmission: Signal<Submission | null>;
	tickets: Signal<StageTicket[]>;
	tree: Signal<SubmissionTreeNode[]>;
	nextSubmissionNumber: Signal<number>;
	revisionCost: Signal<RevisionCostBreakdown>;

	createSubmission: (input: CreateSubmissionInput) => Submission;
	acceptSubmission: (id: string) => void;
	requestRevision: (id: string, feedback: SubmissionFeedback) => void;
	setActiveSubmission: (id: string | null) => void;
}

const SubmissionsContext = createContext<SubmissionsState | null>(null);

export interface SubmissionsProviderProps {
	role: SubmissionViewerRole;
	multiFreelancer: boolean;
	currentFreelancerId: string | null;
	/** Author identity stamped on submissions the current user creates. */
	author: { id: string; name: string };
	/**
	 * When provided, the surface is wired to the live backend: submissions hydrate from
	 * `/stages/:id/submissions`, and create/accept/revise persist through the submission RPCs.
	 * Omitted (e.g. in isolated stories) → the surface stays purely local against seed data.
	 */
	projectId?: string;
	stageId?: string;
	children: ComponentChildren;
}

/** Converts a picker payload into a stored submission file (mock URL for previews). */
function toSubmissionFile(f: FileWithMeta): SubmissionFile {
	let url = '';
	try {
		url = URL.createObjectURL(f.file);
	} catch {
		url = '';
	}
	return {
		id: f.id ?? crypto.randomUUID(),
		name: f.file.name,
		url,
		mimeType: f.file.type || 'application/octet-stream',
		size: f.file.size,
	};
}

export function SubmissionsProvider({
	role,
	multiFreelancer,
	currentFreelancerId,
	author,
	projectId,
	stageId,
	children,
}: SubmissionsProviderProps) {
	const isLive = Boolean(projectId && stageId);

	const workspace = useSignal<SubmissionsWorkspace>({
		role,
		multiFreelancer,
		freelancers: SEED_FREELANCERS,
		currentFreelancerId,
		tickets: SEED_TICKETS,
		// Live mode starts empty and hydrates from the backend; seed only backs isolated stories.
		submissions: isLive ? [] : SEED_SUBMISSIONS,
		revisionPolicy: SEED_REVISION_POLICY,
	});

	const activeSubmissionId = useSignal<string | null>(null);

	// Hydrate the deliverable ledger from the backend (spec §4 one-way hydration). Client-side error
	// boundary: any failure is logged via the telemetry tags and leaves the surface empty rather than
	// crashing the island.
	useEffect(() => {
		if (!isLive) return;
		let cancelled = false;
		(async () => {
			try {
				console.log(`[SUBMISSION_CLIENT] hydrate begin project=${projectId} stage=${stageId}`);
				const rows = await SubmissionsService.list(projectId!, stageId!);
				if (cancelled) return;
				workspace.value = { ...workspace.value, submissions: rows.map(fromDTO) };
				console.log(`[SUBMISSION_CLIENT] hydrate ok count=${rows.length}`);
			} catch (err) {
				console.error(
					`[SUBMISSION_CLIENT] hydrate FAILED project=${projectId} stage=${stageId}`,
					err,
				);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [projectId, stageId]);

	const state = useMemo<SubmissionsState>(() => {
		const tickets = computed(() => workspace.value.tickets);
		const tree = computed(() => buildSubmissionTree(workspace.value));
		const revisionCost = computed(() => computeRevisionCost(workspace.value.revisionPolicy));

		const activeSubmission = computed(() =>
			workspace.value.submissions.find((s) => s.id === activeSubmissionId.value) ?? null
		);

		const nextSubmissionNumber = computed(() => {
			const max = workspace.value.submissions.reduce((m, s) => Math.max(m, s.number), 0);
			return max + 1;
		});

		const patchSubmission = (id: string, patch: Partial<Submission>) => {
			const ws = workspace.value;
			workspace.value = {
				...ws,
				submissions: ws.submissions.map((s) => (s.id === id ? { ...s, ...patch } : s)),
			};
		};

		const replaceSubmission = (id: string, next: Submission) => {
			const ws = workspace.value;
			workspace.value = {
				...ws,
				submissions: ws.submissions.map((s) => (s.id === id ? next : s)),
			};
		};

		/**
		 * Files a deliverable. Optimistically prepends it, then (live mode) persists via the submission
		 * RPC and reconciles the row with the server copy. On failure the optimistic row is flagged
		 * "(unsaved)" and the error logged — the surface never crashes.
		 */
		const createSubmission = (input: CreateSubmissionInput): Submission => {
			const ws = workspace.value;
			const submission: Submission = {
				id: crypto.randomUUID(),
				number: nextSubmissionNumber.value,
				title: input.title.trim() || `New Submission #${nextSubmissionNumber.value}`,
				ticketId: input.ticketId,
				description: input.description,
				files: input.files.map(toSubmissionFile),
				checkedItemIds: input.checkedItemIds,
				status: 'pending_review',
				submittedAt: new Date().toISOString(),
				authorId: author.id,
				authorName: author.name,
			};
			workspace.value = { ...ws, submissions: [submission, ...ws.submissions] };

			if (isLive && input.ticketId) {
				// Only file ids already persisted via the files API are attached; the RPC ignores
				// ids with no backing files.items row (see submit_deliverable).
				const fileIds = input.files
					.map((f) => f.id)
					.filter((x): x is string => Boolean(x));
				SubmissionsService.submit(projectId!, {
					ticketId: input.ticketId,
					stageId: stageId!,
					title: submission.title,
					description: input.description,
					checkedItemIds: input.checkedItemIds,
					fileIds,
				})
					.then((dto) => replaceSubmission(submission.id, fromDTO(dto)))
					.catch((err) => {
						console.error('[SUBMISSION_CLIENT] create persist FAILED', err);
						patchSubmission(submission.id, { title: `${submission.title} (unsaved)` });
					});
			} else if (isLive) {
				console.warn('[SUBMISSION_CLIENT] create not persisted: no ticket selected');
			}

			return submission;
		};

		/** Accepts a submission (client/owner). Optimistic → persist → reconcile / revert. */
		const acceptSubmission = (id: string) => {
			const prev = workspace.value.submissions.find((s) => s.id === id) ?? null;
			patchSubmission(id, { status: 'accepted' });
			if (!isLive) return;
			SubmissionsService.review(projectId!, stageId!, id, 'accept')
				.then((dto) => replaceSubmission(id, fromDTO(dto)))
				.catch((err) => {
					console.error('[SUBMISSION_CLIENT] accept FAILED — reverting', err);
					if (prev) replaceSubmission(id, prev);
				});
		};

		/** Requests a revision (client/owner). Optimistic → persist → reconcile / revert. */
		const requestRevision = (id: string, feedback: SubmissionFeedback) => {
			const ws = workspace.value;
			const prev = ws.submissions.find((s) => s.id === id) ?? null;
			workspace.value = {
				...ws,
				revisionPolicy: {
					...ws.revisionPolicy,
					usedRevisions: ws.revisionPolicy.usedRevisions + 1,
				},
				submissions: ws.submissions.map((s) =>
					s.id === id ? { ...s, status: 'revisions_requested', feedback } : s
				),
			};
			if (!isLive) return;
			SubmissionsService.review(projectId!, stageId!, id, 'request_revision', {
				global: feedback.global,
				perFile: feedback.perFile,
			})
				.then((dto) => replaceSubmission(id, fromDTO(dto)))
				.catch((err) => {
					console.error('[SUBMISSION_CLIENT] request revision FAILED — reverting', err);
					if (prev) replaceSubmission(id, prev);
				});
		};

		return {
			role,
			workspace,
			activeSubmissionId,
			activeSubmission,
			tickets,
			tree,
			nextSubmissionNumber,
			revisionCost,
			createSubmission,
			acceptSubmission,
			requestRevision,
			setActiveSubmission: (id) => (activeSubmissionId.value = id),
		};
	}, []);

	return (
		<SubmissionsContext.Provider value={state}>
			{children}
		</SubmissionsContext.Provider>
	);
}

export function useSubmissionsContext(): SubmissionsState {
	const ctx = useContext(SubmissionsContext);
	if (!ctx) throw new Error('useSubmissionsContext must be used within SubmissionsProvider');
	return ctx;
}
