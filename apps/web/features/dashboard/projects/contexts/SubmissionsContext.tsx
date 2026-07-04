/**
 * @file SubmissionsContext.tsx
 * @description Local state hub for the Stage "Submissions" surface. Hydrates seed
 * data into signals and exposes the mutations the freelancer/client surfaces drive.
 * Islands stay dumb — no direct data access — matching the app's architecture rules.
 */

import { ComponentChildren, createContext } from 'preact';
import { useContext, useMemo } from 'preact/hooks';
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
	children,
}: SubmissionsProviderProps) {
	const workspace = useSignal<SubmissionsWorkspace>({
		role,
		multiFreelancer,
		freelancers: SEED_FREELANCERS,
		currentFreelancerId,
		tickets: SEED_TICKETS,
		submissions: SEED_SUBMISSIONS,
		revisionPolicy: SEED_REVISION_POLICY,
	});

	const activeSubmissionId = useSignal<string | null>(null);

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
			return submission;
		};

		const patchSubmission = (id: string, patch: Partial<Submission>) => {
			const ws = workspace.value;
			workspace.value = {
				...ws,
				submissions: ws.submissions.map((s) => (s.id === id ? { ...s, ...patch } : s)),
			};
		};

		const acceptSubmission = (id: string) => patchSubmission(id, { status: 'accepted' });

		const requestRevision = (id: string, feedback: SubmissionFeedback) => {
			const ws = workspace.value;
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
