/* #region Imports */
import '../../../styles/components/project/stage/staffing/staffing.css';
import { JSX } from 'preact';
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { toast } from '@projective/ui';
import {
	type OpenSeatDTO,
	StaffingService,
	type StageStaffingDTO,
	type WorkloadCapacityDTO,
} from '../../../services/StaffingService.ts';
import { StagesService } from '../../../services/StagesService.ts';
import {
	type AssignmentMode,
	type SeatDraftModel,
	StageStaffingPanel,
} from '../../../components/project/stage/staffing/StageStaffingPanel.tsx';
import { useStageContext } from '../../../contexts/StageContext.tsx';
/* #endregion */

/* #region Props */
export interface StageStaffingIslandProps {
	projectId: string;
	stageId: string;
	stageStatus: string;
	/** True when the viewer is the project owner / client business (can define seats + assign). */
	canManage: boolean;
	/** The viewing freelancer's own profile id, if they are a freelancer (enables Apply). */
	currentFreelancerId?: string | null;
	/** The stage's current assignment routing mode (drives the owner picker). */
	assignmentMode?: AssignmentMode;
	/** Called after the routing mode changes so the parent can re-fetch the stage. */
	onStageChanged?: () => void | Promise<void>;
	/** Optional server-hydrated initial staffing payload (Route → Service → Island, one-way). */
	initialData?: StageStaffingDTO | null;
}
/* #endregion */

/* #region Island */
/**
 * @island StageStaffing
 * @description Stateful staffing surface for a stage (US-004). Hydrates from `initialData` when the
 * route provides it, else fetches via StaffingService on mount; owns the create-seat draft and the
 * apply/assign mutations, refreshing the read-model after each. Rendering is delegated to the dumb
 * StageStaffingPanel (which composes the shared RosterCard / StatusSlider primitives).
 */
export function StageStaffing(props: StageStaffingIslandProps): JSX.Element {
	const {
		projectId,
		stageId,
		stageStatus,
		canManage,
		currentFreelancerId,
		assignmentMode,
		onStageChanged,
		initialData,
	} = props;

	const staffing = useSignal<StageStaffingDTO | null>(initialData ?? null);
	const loading = useSignal(!initialData);
	const busy = useSignal(false);
	const error = useSignal<string | null>(null);
	// The viewing freelancer's own capacity, for the Workload Capacity Gauge (spec §3).
	const myCapacity = useSignal<WorkloadCapacityDTO | null>(null);

	const seatDraft: SeatDraftModel = {
		description: useSignal(''),
		requireProposals: useSignal(true),
		open: useSignal(false),
	};

	const refresh = async () => {
		try {
			staffing.value = await StaffingService.getStaffing(projectId, stageId);
			error.value = null;
		} catch (err) {
			error.value = (err as Error).message;
		} finally {
			loading.value = false;
		}
	};

	useEffect(() => {
		if (!initialData) void refresh();
		// Only a freelancer viewer has a workload to gauge; owners/clients skip the fetch.
		if (currentFreelancerId) {
			StaffingService.getMyCapacity(projectId)
				.then((cap) => (myCapacity.value = cap))
				.catch(() => {/* non-fatal: the gauge simply stays hidden */});
		}
	}, []);

	const onCreateSeat = async () => {
		busy.value = true;
		try {
			await StaffingService.createSeat(projectId, stageId, {
				description: seatDraft.description.value.trim(),
				requireProposals: seatDraft.requireProposals.value,
			});
			seatDraft.description.value = '';
			seatDraft.open.value = false;
			toast.success('Open seat created.');
			await refresh();
		} catch (err) {
			toast.error((err as Error).message);
		} finally {
			busy.value = false;
		}
	};

	const onApply = async (seat: OpenSeatDTO) => {
		if (!currentFreelancerId) return;
		busy.value = true;
		try {
			await StaffingService.apply(projectId, stageId, seat.id, {
				applicantType: 'freelancer',
				applicantProfileId: currentFreelancerId,
			});
			toast.success('Application submitted.');
			await refresh();
		} catch (err) {
			toast.error((err as Error).message);
		} finally {
			busy.value = false;
		}
	};

	const onAssign = async (applicationId: string) => {
		busy.value = true;
		try {
			await StaffingService.assign(projectId, stageId, applicationId);
			toast.success('Talent assigned to the stage.');
			await refresh();
		} catch (err) {
			toast.error((err as Error).message);
		} finally {
			busy.value = false;
		}
	};

	const onSetMode = async (mode: AssignmentMode) => {
		busy.value = true;
		try {
			await StagesService.setAssignmentMode(projectId, stageId, mode);
			toast.success('Assignment routing updated.');
			// Re-fetch the stage so the picker reflects the new mode, then refresh staffing.
			await onStageChanged?.();
			await refresh();
		} catch (err) {
			toast.error((err as Error).message);
		} finally {
			busy.value = false;
		}
	};

	const onAutoAssign = async () => {
		if (assignmentMode !== 'round_robin' && assignmentMode !== 'parallel_stream') return;
		busy.value = true;
		try {
			const res = await StagesService.autoAssign(projectId, stageId, assignmentMode);
			if (assignmentMode === 'parallel_stream') {
				const n = typeof res.assigned === 'number' ? res.assigned : 0;
				if (n > 0) toast.success(`Distributed ${n} ticket${n === 1 ? '' : 's'} across the roster.`);
				else toast.error('No ready tickets could be distributed.');
			} else {
				const r = res.assigned ?? {};
				if (r.assigned) toast.success('Assigned the next ticket to the lowest-loaded member.');
				else toast.error(r.reason || 'No ticket could be assigned.');
			}
			await refresh();
		} catch (err) {
			toast.error((err as Error).message);
		} finally {
			busy.value = false;
		}
	};

	return (
		<StageStaffingPanel
			staffing={staffing.value}
			loading={loading.value}
			error={error.value}
			canManage={canManage}
			stageStatus={stageStatus}
			currentFreelancerId={currentFreelancerId}
			myCapacity={myCapacity.value}
			assignmentMode={assignmentMode}
			seatDraft={seatDraft}
			busy={busy.value}
			onCreateSeat={onCreateSeat}
			onApply={onApply}
			onAssign={onAssign}
			onSetMode={onSetMode}
			onAutoAssign={onAutoAssign}
		/>
	);
}

/* #endregion */

/* #region Route wrapper */
/**
 * @island StageStaffingRoute
 * @description Route-mounted default export for the stage "Staffing" tab. Reads the live StageContext
 * (hydrated one-way by the stage layout) and hands the prop-driven StageStaffing island everything it
 * needs: the owner/client gets seat-definition + assign authority (`canManage`), and an assigned
 * freelancer gets their own profile id so the per-seat Apply affordance is enabled (US-004).
 */
export default function StageStaffingRoute(): JSX.Element {
	const { stage, refresh } = useStageContext();
	const s = stage.value;

	if (!s) {
		return (
			<div class='stage-staffing'>
				<p class='stage-staffing__muted'>Loading staffing…</p>
			</div>
		);
	}

	const canManage = s.viewer_context?.role === 'owner';
	const currentFreelancerId =
		s.viewer_context?.role === 'assignee' && s.assignee?.type === 'freelancer'
			? s.assignee.profile_id
			: null;

	return (
		<StageStaffing
			projectId={s.project_id}
			stageId={s.stage_id}
			stageStatus={s.status}
			canManage={canManage}
			currentFreelancerId={currentFreelancerId}
			assignmentMode={s.assignment_mode}
			onStageChanged={refresh}
		/>
	);
}
/* #endregion */
