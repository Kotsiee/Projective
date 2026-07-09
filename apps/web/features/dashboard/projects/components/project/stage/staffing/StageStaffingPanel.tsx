/* #region Imports */
import { JSX } from 'preact';
import { Signal } from '@preact/signals';
import { Button, type RosterApplicant, RosterCard } from '@projective/ui';
import { Checkbox, StatusSlider, type StatusStep, TextField } from '@projective/fields';
import { WorkloadCapacityGauge } from '@projective/charts';
import { IconBriefcase, IconRoute } from '@tabler/icons-preact';
import type {
	OpenSeatDTO,
	StageStaffingDTO,
	WorkloadCapacityDTO,
} from '../../../../services/StaffingService.ts';
/* #endregion */

/* #region Model */
/** Ordered stage lifecycle for the read-only StatusSlider (mirrors the stage_status enum). */
export const STAGE_STATUS_STEPS: StatusStep[] = [
	{ value: 'open', label: 'Open' },
	{ value: 'assigned', label: 'Assigned' },
	{ value: 'in_progress', label: 'Active' },
	{ value: 'submitted', label: 'Submitted', tone: 'warning' },
	{ value: 'approved', label: 'Approved', tone: 'success' },
	{ value: 'paid', label: 'Paid', tone: 'success' },
];

/** Draft signals for the owner "define a seat" form. */
export interface SeatDraftModel {
	description: Signal<string>;
	requireProposals: Signal<boolean>;
	open: Signal<boolean>;
}

/** The four assignment routing modes (spec §"Assignment Modes"), in the picker's display order. */
export type AssignmentMode = 'open_pull' | 'round_robin' | 'manual' | 'parallel_stream';

const ASSIGNMENT_MODES: { value: AssignmentMode; label: string; desc: string }[] = [
	{
		value: 'open_pull',
		label: 'Open pull',
		desc: 'Any hired freelancer can claim ready tickets, up to their capacity.',
	},
	{
		value: 'round_robin',
		label: 'Round robin',
		desc: 'The system routes the next ticket to the lowest-loaded eligible member.',
	},
	{
		value: 'manual',
		label: 'Manual',
		desc: 'You pin each ticket to a specific person; freelancers cannot self-claim.',
	},
	{
		value: 'parallel_stream',
		label: 'Parallel stream',
		desc: 'Fan every ready ticket across the roster for concurrent one-off execution.',
	},
];

export interface StageStaffingPanelProps {
	staffing: StageStaffingDTO | null;
	loading: boolean;
	error: string | null;
	/** Owner/client may define seats and assign applicants. */
	canManage: boolean;
	stageStatus: string;
	/** The viewing freelancer's own profile id — enables the per-seat Apply affordance. */
	currentFreelancerId?: string | null;
	/** The viewing freelancer's live workload capacity (spec §3), for the gauge. */
	myCapacity?: WorkloadCapacityDTO | null;
	/** The stage's current assignment routing mode (owner picker). */
	assignmentMode?: AssignmentMode;
	seatDraft: SeatDraftModel;
	busy: boolean;
	onCreateSeat: () => void;
	onApply: (seat: OpenSeatDTO) => void;
	onAssign: (applicationId: string) => void;
	/** Owner changed the routing mode. */
	onSetMode?: (mode: AssignmentMode) => void;
	/** Owner triggered an auto-assignment pass (round-robin / parallel-stream). */
	onAutoAssign?: () => void;
}
/* #endregion */

/* #region Helpers */
function budgetLabel(seat: OpenSeatDTO): string | undefined {
	const fmt = (c: number) =>
		`$${(c / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
	if (seat.budgetMinCents != null && seat.budgetMaxCents != null) {
		return `${fmt(seat.budgetMinCents)} – ${fmt(seat.budgetMaxCents)}`;
	}
	if (seat.budgetMaxCents != null) return `up to ${fmt(seat.budgetMaxCents)}`;
	if (seat.budgetMinCents != null) return `from ${fmt(seat.budgetMinCents)}`;
	return undefined;
}

function toApplicants(seat: OpenSeatDTO): RosterApplicant[] {
	return (seat.applications ?? []).map((a) => ({
		id: a.id,
		name: a.applicantName,
		type: a.applicantType,
		message: a.message,
		status: a.status,
	}));
}
/* #endregion */

/* #region Component */
/**
 * @function StageStaffingPanel
 * @description Dumb staffing surface for a stage (US-004). Renders the stage lifecycle as a read-only
 * StatusSlider, each open seat as a shared RosterCard (owner sees per-applicant Assign; a viewing
 * freelancer sees Apply), and an owner-only "define a seat" form. All persistence is delegated to the
 * island via callbacks.
 */
export function StageStaffingPanel(props: StageStaffingPanelProps): JSX.Element {
	const {
		staffing,
		loading,
		error,
		canManage,
		stageStatus,
		currentFreelancerId,
		myCapacity,
		assignmentMode,
		seatDraft,
		busy,
		onCreateSeat,
		onApply,
		onAssign,
		onSetMode,
		onAutoAssign,
	} = props;

	const seats = staffing?.seats ?? [];
	const mode = assignmentMode ?? 'open_pull';
	const activeMode = ASSIGNMENT_MODES.find((m) => m.value === mode);

	return (
		<div class='stage-staffing'>
			<div class='stage-staffing__status'>
				<StatusSlider steps={STAGE_STATUS_STEPS} value={stageStatus} size='sm' />
			</div>

			{/* Owner-only: how this stage routes work (spec §"Assignment Modes"). */}
			{canManage && (
				<div class='stage-staffing__routing'>
					<div class='stage-staffing__routing-head'>
						<IconRoute size={16} />
						<span>Assignment routing</span>
					</div>
					<div class='stage-staffing__modes' role='group' aria-label='Assignment mode'>
						{ASSIGNMENT_MODES.map((m) => (
							<button
								key={m.value}
								type='button'
								class={`stage-staffing__mode${
									mode === m.value ? ' stage-staffing__mode--active' : ''
								}`}
								aria-pressed={mode === m.value}
								disabled={busy || mode === m.value}
								onClick={() => onSetMode?.(m.value)}
							>
								{m.label}
							</button>
						))}
					</div>
					{activeMode && <p class='stage-staffing__routing-desc'>{activeMode.desc}</p>}
					{(mode === 'round_robin' || mode === 'parallel_stream') && (
						<Button
							variant='secondary'
							disabled={busy}
							onClick={() => onAutoAssign?.()}
						>
							{mode === 'round_robin' ? 'Assign next ticket' : 'Distribute ready tickets'}
						</Button>
					)}
				</div>
			)}

			{/* A freelancer viewer sees their live capacity before applying for a seat (spec §3). */}
			{currentFreelancerId && myCapacity && (
				<div class='stage-staffing__capacity'>
					<WorkloadCapacityGauge
						variant='dial'
						current={myCapacity.current}
						max={myCapacity.cap}
						size={116}
						label='Your load'
						caption={`${myCapacity.ticket_count} active ticket${
							myCapacity.ticket_count === 1 ? '' : 's'
						}`}
					/>
					<p class='stage-staffing__capacity-note'>
						Your remaining bandwidth across all projects. New claims are blocked once you hit your
						cap — submit current work to free up capacity.
					</p>
				</div>
			)}

			{error && <p class='stage-staffing__error'>{error}</p>}
			{loading && <p class='stage-staffing__muted'>Loading staffing…</p>}

			{!loading && seats.length === 0 && (
				<p class='stage-staffing__muted'>No open seats on this stage yet.</p>
			)}

			<div class='stage-staffing__seats'>
				{seats.map((seat) => (
					<RosterCard
						key={seat.id}
						title={seat.description}
						status={seat.status}
						requiredSkills={seat.requiredSkills}
						budgetLabel={budgetLabel(seat)}
						applicants={toApplicants(seat)}
						canAssign={canManage}
						busy={busy}
						onAssign={onAssign}
						onApply={currentFreelancerId && seat.status === 'open'
							? () => onApply(seat)
							: undefined}
					/>
				))}
			</div>

			{canManage && (
				<div class='stage-staffing__create'>
					{seatDraft.open.value
						? (
							<div class='stage-staffing__form'>
								<TextField
									label='Describe the seat / role'
									value={seatDraft.description}
									floatingRule='auto'
								/>
								<Checkbox
									checked={seatDraft.requireProposals.value}
									onChange={(v) => (seatDraft.requireProposals.value = v)}
									label='Require proposals from applicants'
								/>
								<div class='stage-staffing__form-actions'>
									<Button variant='secondary' onClick={() => (seatDraft.open.value = false)}>
										Cancel
									</Button>
									<Button
										onClick={onCreateSeat}
										disabled={busy || !seatDraft.description.value.trim()}
									>
										Create seat
									</Button>
								</div>
							</div>
						)
						: (
							<Button
								variant='secondary'
								startIcon={<IconBriefcase size={18} />}
								onClick={() => (seatDraft.open.value = true)}
							>
								Define an open seat
							</Button>
						)}
				</div>
			)}
		</div>
	);
}
/* #endregion */
