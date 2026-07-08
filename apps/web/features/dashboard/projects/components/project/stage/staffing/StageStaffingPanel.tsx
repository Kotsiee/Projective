/* #region Imports */
import { JSX } from 'preact';
import { Signal } from '@preact/signals';
import { Button, type RosterApplicant, RosterCard } from '@projective/ui';
import { Checkbox, StatusSlider, type StatusStep, TextField } from '@projective/fields';
import { IconBriefcase } from '@tabler/icons-preact';
import type { OpenSeatDTO, StageStaffingDTO } from '../../../../services/StaffingService.ts';
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

export interface StageStaffingPanelProps {
	staffing: StageStaffingDTO | null;
	loading: boolean;
	error: string | null;
	/** Owner/client may define seats and assign applicants. */
	canManage: boolean;
	stageStatus: string;
	/** The viewing freelancer's own profile id — enables the per-seat Apply affordance. */
	currentFreelancerId?: string | null;
	seatDraft: SeatDraftModel;
	busy: boolean;
	onCreateSeat: () => void;
	onApply: (seat: OpenSeatDTO) => void;
	onAssign: (applicationId: string) => void;
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
		seatDraft,
		busy,
		onCreateSeat,
		onApply,
		onAssign,
	} = props;

	const seats = staffing?.seats ?? [];

	return (
		<div class='stage-staffing'>
			<div class='stage-staffing__status'>
				<StatusSlider steps={STAGE_STATUS_STEPS} value={stageStatus} size='sm' />
			</div>

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
