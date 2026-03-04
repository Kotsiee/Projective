import { useNewProjectContext } from '../../../contexts/NewProjectContext.tsx';
import { DateField, SelectField, TextField } from '@projective/fields';
import {
	DateTime,
	SelectOption,
	StageType,
	StartTriggerType,
	TimelinePreset,
} from '@projective/types';
import { IconClock, IconGitBranch, IconLockSquareRounded } from '@tabler/icons-preact';
import { UIStage } from '../ProjectStages.tsx';

import ProjectTimelineControlsFile from './ProjectTimelineControlsFile.tsx';
import ProjectTimelineControlsSession from './ProjectTimelineControlsSession.tsx';

export default function ProjectTimelineControls() {
	const state = useNewProjectContext();

	const selectedIndex = state.timelineSelectedStageIndex.value;
	const stage = state.stages.value[selectedIndex];

	if (!stage) {
		return (
			<div className='timeline-preview-empty'>
				Select a stage from the timeline to configure its triggers.
			</div>
		);
	}

	const startTriggerOptions: SelectOption<string>[] = [
		{ label: 'On Project Start', value: StartTriggerType.OnProjectStart },
		{ label: 'Dependent on another Stage', value: StartTriggerType.DependentOnStage },
		{ label: 'Fixed Calendar Date', value: StartTriggerType.FixedDate },
	];

	// Prevent infinite loops by detecting if the target stage already depends on the current stage
	const isDescendant = (targetIdx: number, currentIdx: number): boolean => {
		let curr = state.stages.value[targetIdx];
		let safe = 0;
		while (
			curr && curr.start_trigger_type === StartTriggerType.DependentOnStage &&
			curr.start_dependency_stage_id && safe < 100
		) {
			const parentIdx = parseInt(curr.start_dependency_stage_id, 10);
			if (parentIdx === currentIdx) return true;
			curr = state.stages.value[parentIdx];
			safe++;
		}
		return false;
	};

	const getStageOptions = (currentIndex: number): SelectOption<string>[] => {
		return state.stages.value
			.map((s, idx) => ({
				label: s.title || `Stage ${idx + 1}`,
				value: idx.toString(),
			}))
			.filter((opt) => {
				const optIdx = parseInt(opt.value, 10);
				// Cannot depend on self
				if (optIdx === currentIndex) return false;
				// Cannot depend on a stage that already depends on this stage (Paradox prevention)
				if (isDescendant(optIdx, currentIndex)) return false;
				return true;
			});
	};

	// deno-lint-ignore no-explicit-any
	const updateStageTimeline = (field: string, value: any) => {
		const newStages = [...state.stages.value];
		newStages[selectedIndex] = { ...newStages[selectedIndex], [field]: value };
		state.stages.value = newStages;

		// Break the global preset mode if they manually override stage scheduling
		const overridingFields = [
			'start_trigger_type',
			'start_dependency_stage_id',
			'fixed_start_date',
			'start_dependency_lag_days',
		];
		if (overridingFields.includes(field)) {
			state.timelinePreset.value = TimelinePreset.Custom;
		}
	};

	return (
		<div className='timeline-stage-inspector'>
			<div className='timeline-stage-inspector__header'>
				<span className='timeline-stage-inspector__badge'>Stage {selectedIndex + 1}</span>
				<h3 className='timeline-stage-inspector__title'>{stage.title || 'Untitled Stage'}</h3>
			</div>

			<div className='timeline-stage-inspector__content'>
				{/* --- 1. START TRIGGERS --- */}
				<div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
					<h4 className='timeline-stage-inspector__subtitle'>
						<IconGitBranch size={16} /> Start Triggers
					</h4>

					<div className='timeline-stage-inspector__form'>
						<SelectField
							name={`start-trigger-${selectedIndex}`}
							label='When does this stage start?'
							options={startTriggerOptions}
							value={stage.start_trigger_type}
							onChange={(v) => updateStageTimeline('start_trigger_type', v)}
							searchable={false}
							floating
							required
						/>

						{stage.start_trigger_type === StartTriggerType.DependentOnStage && (
							<div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
								<div style={{ flex: 2 }}>
									<SelectField
										name={`dependency-${selectedIndex}`}
										label='Waits for completion of:'
										options={getStageOptions(selectedIndex)}
										value={stage.start_dependency_stage_id || ''}
										onChange={(v) =>
											updateStageTimeline('start_dependency_stage_id', v)}
										searchable={false}
										floating
										required
										hint='Stage will unlock when this completes.'
									/>
								</div>
								<div style={{ flex: 1 }}>
									<TextField
										type='number'
										label='Offset Days'
										value={stage.start_dependency_lag_days?.toString() || '0'}
										onChange={(v) =>
											updateStageTimeline('start_dependency_lag_days', parseInt(v, 10) || 0)}
										floating
										hint='Neg = overlap'
									/>
								</div>
							</div>
						)}

						{stage.start_trigger_type === StartTriggerType.FixedDate && (
							<DateField
								label='Fixed Start Date'
								value={stage.fixed_start_date as DateTime}
								onChange={(v) => updateStageTimeline('fixed_start_date', v)}
								floating
								required
								hint='Work cannot begin before this exact calendar date.'
							/>
						)}
					</div>
				</div>

				{/* --- 2. DURATION & SCHEDULING --- */}
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: '1.5rem',
						paddingTop: '1.5rem',
						borderTop: '1px dashed var(--border-color)',
					}}
				>
					<h4 className='timeline-stage-inspector__subtitle'>
						<IconClock size={16} /> Duration & Scheduling
					</h4>

					<div className='timeline-stage-inspector__form'>
						{stage.stage_type === StageType.FileBased && (
							<ProjectTimelineControlsFile
								stage={stage}
								index={selectedIndex}
								updateStage={updateStageTimeline as any}
							/>
						)}

						{stage.stage_type === StageType.SessionBased && (
							<ProjectTimelineControlsSession
								stage={stage}
								index={selectedIndex}
								updateStage={updateStageTimeline}
							/>
						)}

						{stage.stage_type === StageType.MaintenanceBased && (
							<SelectField
								name={`maintenance-interval-${selectedIndex}`}
								label='Cycle Interval'
								options={[{ label: 'Weekly Retainer', value: 'weekly' }, {
									label: 'Monthly Retainer',
									value: 'monthly',
								}]}
								value={stage.maintenance_cycle_interval || 'monthly'}
								onChange={(v) => updateStageTimeline('maintenance_cycle_interval', v)}
								searchable={false}
								floating
								required
							/>
						)}
					</div>
				</div>

				{/* --- 3. CONTRACT TRIGGERS --- */}
				<div
					className='timeline-stage-inspector__toggle-row'
					style={{ paddingTop: '1.5rem', borderTop: '1px dashed var(--border-color)' }}
				>
					<label className='toggle-label'>
						<IconLockSquareRounded size={18} color='var(--text-muted)' />
						<div>
							<span className='toggle-label__title'>Require Hire Confirmation</span>
							<span className='toggle-label__desc'>
								Even if the timeline trigger is met, work cannot begin until talent is assigned and
								confirmed.
							</span>
						</div>
					</label>
					<div className='toggle-switch'>
						<input
							type='checkbox'
							id={`hire-trigger-${selectedIndex}`}
							checked={stage.hire_trigger_active !== false}
							onChange={(e) => updateStageTimeline('hire_trigger_active', e.currentTarget.checked)}
						/>
						<label htmlFor={`hire-trigger-${selectedIndex}`}></label>
					</div>
				</div>
			</div>
		</div>
	);
}
