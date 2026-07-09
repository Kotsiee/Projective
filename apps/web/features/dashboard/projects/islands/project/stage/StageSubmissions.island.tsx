/* #region Imports */
import '../../../styles/components/project/stage/submissions/submissions.css';
import { JSX } from 'preact';
import { useComputed, useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { Button } from '@projective/ui';
import { IconPlus, IconRotateClockwise } from '@tabler/icons-preact';
import { useNavigationContext } from '@features/navigation/contexts/NavigationContext.tsx';
import { useStageContext } from '../../../contexts/StageContext.tsx';
import {
	SubmissionsProvider,
	useSubmissionsContext,
} from '../../../contexts/SubmissionsContext.tsx';
import { validateSubmission } from '../../../contracts/Submissions.ts';
import { SEED_FREELANCERS } from '../../../contexts/submissionsSeed.ts';
import type { SubmissionDTO } from '../../../services/SubmissionsService.ts';
import {
	SubmissionForm,
	type SubmissionFormModel,
} from '../../../components/project/stage/submissions/SubmissionForm.tsx';
import { SubmissionsHistory } from '../../../components/project/stage/submissions/SubmissionsHistory.tsx';
import { SubmissionReviewWorkspace } from '../../../components/project/stage/submissions/SubmissionReviewWorkspace.tsx';
import { AcceptSubmissionModal } from '../../../components/project/stage/submissions/AcceptSubmissionModal.tsx';
import { RequestRevisionModal } from '../../../components/project/stage/submissions/RequestRevisionModal.tsx';
/* #endregion */

/* #region Freelancer surface */
/**
 * The assignee's Submissions canvas: a history list that swaps to the compilation
 * form on "Create New Submission". Primary actions are dispatched to the stage's
 * global nav footer via setMiddleNav (never a local isolated footer).
 */
function FreelancerSurface() {
	const ctx = useSubmissionsContext();
	const { setMiddleNav } = useNavigationContext();

	const mode = useSignal<'history' | 'create'>('history');

	// Draft state lives here so the nav-footer Submit reads the same signals.
	const model: SubmissionFormModel = {
		title: useSignal(''),
		ticketId: useSignal<string | null>(null),
		description: useSignal(''),
		files: useSignal([]),
		checked: useSignal<string[]>([]),
		submitAttempted: useSignal(false),
	};

	const tickets = ctx.tickets.value;
	const selectedTicket = useComputed(() =>
		tickets.find((t) => t.id === model.ticketId.value) ?? null
	);
	const validation = useComputed(() =>
		validateSubmission({
			ticket: selectedTicket.value,
			description: model.description.value,
			files: model.files.value,
			checkedItemIds: model.checked.value,
		})
	);

	const startCreate = () => {
		model.title.value = `New Submission #${ctx.nextSubmissionNumber.value}`;
		// Auto-select when the stage has exactly one active ticket.
		model.ticketId.value = tickets.length === 1 ? tickets[0].id : null;
		model.description.value = '';
		model.files.value = [];
		model.checked.value = [];
		model.submitAttempted.value = false;
		mode.value = 'create';
	};

	const submit = () => {
		model.submitAttempted.value = true;
		if (!validation.value.ok) return;
		ctx.createSubmission({
			title: model.title.value,
			ticketId: model.ticketId.value,
			description: model.description.value,
			files: model.files.value,
			checkedItemIds: model.checked.value,
		});
		mode.value = 'history';
	};

	// Dispatch footer actions to the global stage navigation layout.
	useEffect(() => {
		if (mode.value === 'create') {
			setMiddleNav({
				footerHeight: '72px',
				footerContent: (
					<div class='submission-navbar'>
						<Button variant='secondary' onClick={() => (mode.value = 'history')}>
							Cancel
						</Button>
						<Button variant='primary' onClick={submit}>Submit for review</Button>
					</div>
				),
			});
		} else {
			setMiddleNav({
				footerHeight: '72px',
				footerContent: (
					<div class='submission-navbar submission-navbar--end'>
						<Button
							variant='primary'
							startIcon={<IconPlus size={18} />}
							onClick={startCreate}
						>
							Create New Submission
						</Button>
					</div>
				),
			});
		}
		return () => setMiddleNav({ footerHeight: '0px', footerContent: null });
	}, [mode.value]);

	if (mode.value === 'create') {
		return (
			<SubmissionForm
				tickets={tickets}
				model={model}
				validation={validation}
				selectedTicket={selectedTicket}
			/>
		);
	}

	return (
		<SubmissionsHistory
			submissions={ctx.workspace.value.submissions}
			tickets={tickets}
			onCreate={startCreate}
			onOpen={(s) => {
				// Reading a past submission simply focuses it (feedback is shown inline).
				ctx.setActiveSubmission(s.id);
			}}
		/>
	);
}
/* #endregion */

/* #region Client surface */
/**
 * The client's review workspace: role-based tree + adaptive center, with the
 * Accept / Request Revision CTAs mounted through the setMiddleNav framework.
 */
function ClientSurface() {
	const ctx = useSubmissionsContext();
	const { setMiddleNav } = useNavigationContext();

	const acceptOpen = useSignal(false);
	const reviseOpen = useSignal(false);

	const active = ctx.activeSubmission;
	const policy = ctx.workspace.value.revisionPolicy;

	useEffect(() => {
		setMiddleNav({
			footerHeight: '72px',
			footerContent: (
				<div class='submission-navbar submission-navbar--end'>
					<Button
						variant='secondary'
						startIcon={<IconRotateClockwise size={18} />}
						onClick={() => (reviseOpen.value = true)}
						disabled={!active.value}
					>
						Request Revision
					</Button>
					<Button
						variant='primary'
						onClick={() => (acceptOpen.value = true)}
						disabled={!active.value || active.value.status === 'accepted'}
					>
						Accept Submission
					</Button>
				</div>
			),
		});
		return () => setMiddleNav({ footerHeight: '0px', footerContent: null });
	}, []);

	return (
		<>
			<SubmissionReviewWorkspace
				tree={ctx.tree.value}
				submissions={ctx.workspace.value.submissions}
				tickets={ctx.tickets.value}
				activeSubmissionId={ctx.activeSubmissionId}
			/>

			<AcceptSubmissionModal
				isOpen={acceptOpen.value}
				submission={active.value}
				tickets={ctx.tickets.value}
				onConfirm={() => {
					if (active.value) ctx.acceptSubmission(active.value.id);
					acceptOpen.value = false;
				}}
				onClose={() => (acceptOpen.value = false)}
			/>

			<RequestRevisionModal
				isOpen={reviseOpen.value}
				submission={active.value}
				tickets={ctx.tickets.value}
				policy={policy}
				onSubmit={(feedback) => {
					if (active.value) ctx.requestRevision(active.value.id, feedback);
					reviseOpen.value = false;
				}}
				onClose={() => (reviseOpen.value = false)}
			/>
		</>
	);
}
/* #endregion */

/* #region Surface switch */
function SubmissionsSurface() {
	const ctx = useSubmissionsContext();
	return (
		<div class='submissions-surface'>
			{ctx.role === 'freelancer' ? <FreelancerSurface /> : <ClientSurface />}
		</div>
	);
}
/* #endregion */

/* #region Island */
export interface StageSubmissionsIslandProps {
	/**
	 * Server-hydrated deliverable ledger from the route (Route → Service → props, one-way; see
	 * apps/web/CLAUDE.md), threaded into the SubmissionsProvider so the surface paints without a
	 * client hydration fetch on mount.
	 */
	initialSubmissions?: SubmissionDTO[] | null;
}

export default function StageSubmissionsIsland(
	{ initialSubmissions = null }: StageSubmissionsIslandProps = {},
): JSX.Element {
	const { stage } = useStageContext();
	const s = stage?.value;

	if (!s) {
		return (
			<div class='submissions-surface submissions-surface--loading'>
				<p>Loading submissions…</p>
			</div>
		);
	}

	// Derive perspective from the live stage; fall back to the seed roster for the
	// bits the backend does not model yet (multi-freelancer flag / current user).
	const role = s.viewer_context?.role === 'assignee' ? 'freelancer' : 'client';
	const multiFreelancer = s.assignee?.type !== 'freelancer';
	const me = SEED_FREELANCERS[0];

	return (
		<SubmissionsProvider
			role={role}
			multiFreelancer={multiFreelancer}
			currentFreelancerId={me.id}
			author={{ id: me.id, name: me.name }}
			projectId={s.project_id}
			stageId={s.stage_id}
			initialSubmissions={initialSubmissions}
		>
			<SubmissionsSurface />
		</SubmissionsProvider>
	);
}
/* #endregion */
