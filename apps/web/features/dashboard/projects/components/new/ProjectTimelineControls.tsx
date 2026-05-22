/**
 * @file ProjectTimelineControls.tsx
 * @description Dynamic inspector panel that switches between Absolute Scheduling (One-Offs) and Throughput Configuration (Pipelines).
 */

// #region Imports
import { useNewProjectContext } from '../../contexts/NewProjectContext.tsx';
import { DateField, SelectField, SelectOption, TextField } from '@projective/fields';
import { DateTime, ProjectFormat, StartTriggerType, TimelinePreset } from '@projective/types';
import { IconClock, IconGitBranch, IconLockSquareRounded, IconRocket } from '@tabler/icons-preact';
import { UIStage } from './ProjectStages.tsx';
// #endregion

// #region Main Router Component
/**
 * @function ProjectTimelineControls
 * @description Acts as a router for the inspector pane based on project format.
 */
export default function ProjectTimelineControls() {
	const state = useNewProjectContext();
	const selectedIndex = state.timelineSelectedStageIndex.value;
	const stage = state.stages.value[selectedIndex];
	const isOneOff = state.format.value === ProjectFormat.OneOff;

	if (!stage) {
		return (
			<div className='timeline-preview-empty'>
				Select a stage from the visualizer to configure its rules.
			</div>
		);
	}

	return (
		<div className='timeline-stage-inspector'>
			<div className='timeline-stage-inspector__header'>
				<span className='timeline-stage-inspector__badge'>Stage {selectedIndex + 1}</span>
				<h3 className='timeline-stage-inspector__title'>{stage.title || 'Untitled Stage'}</h3>
			</div>

			<div className='timeline-stage-inspector__content'>
				{isOneOff
					? <OneOffControls stage={stage} index={selectedIndex} />
					: <PipelineControls stage={stage} index={selectedIndex} />}
			</div>
		</div>
	);
}
// #endregion

// #region One-Off Controls (Absolute Time)
function OneOffControls({ stage, index }: { stage: UIStage; index: number }) {
	const state = useNewProjectContext();

	const startTriggerOptions: SelectOption<string>[] = [
		{ label: 'On Project Start', value: StartTriggerType.OnProjectStart },
		{ label: 'Dependent on another Stage', value: StartTriggerType.DependentOnStage },
		{ label: 'Fixed Calendar Date', value: StartTriggerType.FixedDate },
	];

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
			.map((s, idx) => ({ label: s.title || `Stage ${idx + 1}`, value: idx.toString() }))
			.filter((opt) => {
				const optIdx = parseInt(opt.value, 10);
				if (optIdx === currentIndex) return false;
				if (isDescendant(optIdx, currentIndex)) return false;
				return true;
			});
	};

	// deno-lint-ignore no-explicit-any
	const updateStage = (field: string, value: any) => {
		const newStages = [...state.stages.value];
		newStages[index] = { ...newStages[index], [field]: value };
		state.stages.value = newStages;

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
		<>
			{/* Start Triggers */}
			<div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
				<h4 className='timeline-stage-inspector__subtitle'>
					<IconGitBranch size={16} /> Start Triggers
				</h4>
				<div className='timeline-stage-inspector__form'>
					<SelectField
						name={`start-trigger-${index}`}
						label='When does this stage start?'
						options={startTriggerOptions}
						value={stage.start_trigger_type}
						onChange={(v) => updateStage('start_trigger_type', v)}
						searchable={false}
						floating
						required
					/>

					{stage.start_trigger_type === StartTriggerType.DependentOnStage && (
						<div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
							<div style={{ flex: 2 }}>
								<SelectField
									name={`dependency-${index}`}
									label='Waits for completion of:'
									options={getStageOptions(index)}
									value={stage.start_dependency_stage_id || ''}
									onChange={(v) =>
										updateStage('start_dependency_stage_id', v)}
									searchable={false}
									floating
									required
								/>
							</div>
							<div style={{ flex: 1 }}>
								<TextField
									type='number'
									label='Offset Days'
									value={stage.start_dependency_lag_days?.toString() || '0'}
									onChange={(v) => updateStage('start_dependency_lag_days', parseInt(v, 10) || 0)}
									floating
								/>
							</div>
						</div>
					)}

					{stage.start_trigger_type === StartTriggerType.FixedDate && (
						<DateField
							label='Fixed Start Date'
							value={stage.fixed_start_date as DateTime}
							onChange={(v) => updateStage('fixed_start_date', v)}
							floating
							required
						/>
					)}
				</div>
			</div>

			{/* Duration */}
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
					<IconClock size={16} /> Duration Constraints
				</h4>
				<div className='timeline-stage-inspector__form'>
					<SelectField
						name={`duration-mode-${index}`}
						label='Timeline Execution Mode'
						options={[
							{ label: 'Relative Duration (Days)', value: 'relative_duration' },
							{ label: 'Fixed Deadline (Hard Date)', value: 'fixed_deadline' },
						]}
						value={stage.file_duration_mode || 'relative_duration'}
						onChange={(v) => updateStage('file_duration_mode', v)}
						searchable={false}
						floating
						required
					/>

					{stage.file_duration_mode === 'relative_duration' && (
						<TextField
							label='Target Duration (Days)'
							type='number'
							value={stage.file_duration_days?.toString() || '7'}
							onChange={(v) => updateStage('file_duration_days', parseInt(v))}
							floating
							required
						/>
					)}

					{stage.file_duration_mode === 'fixed_deadline' && (
						<DateField
							label='Hard Due Date'
							value={stage.file_due_date as DateTime}
							onChange={(v) => updateStage('file_due_date', v)}
							floating
							required
						/>
					)}
				</div>
			</div>

			{/* Confirm Trigger */}
			<div className='timeline-stage-inspector__toggle-row'>
				<label className='toggle-label'>
					<IconLockSquareRounded size={18} color='var(--text-muted)' />
					<div>
						<span className='toggle-label__title'>Require Hire Confirmation</span>
						<span className='toggle-label__desc'>
							Work cannot begin until talent is assigned and confirmed, even if dates pass.
						</span>
					</div>
				</label>
				<div className='toggle-switch'>
					<input
						type='checkbox'
						id={`hire-trigger-${index}`}
						checked={stage.hire_trigger_active !== false}
						onChange={(e) => updateStage('hire_trigger_active', e.currentTarget.checked)}
					/>
					<label htmlFor={`hire-trigger-${index}`}></label>
				</div>
			</div>
		</>
	);
}
// #endregion

// #region Pipeline Controls (Throughput & SLA)
function PipelineControls({ stage, index }: { stage: UIStage; index: number }) {
	const state = useNewProjectContext();

	// deno-lint-ignore no-explicit-any
	const updateStage = (field: string, value: any) => {
		const newStages = [...state.stages.value];
		newStages[index] = { ...newStages[index], [field]: value };
		state.stages.value = newStages;
	};

	return (
		<>
			{/* SLA & Throughput */}
			<div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
				<h4 className='timeline-stage-inspector__subtitle'>
					<IconRocket size={16} /> Throughput Configuration
				</h4>
				<div className='timeline-stage-inspector__form'>
					<TextField
						label='Target Turnaround Time (Days)'
						type='number'
						value={stage.file_duration_days?.toString() || '7'}
						onChange={(v) => updateStage('file_duration_days', parseInt(v))}
						floating
						required
						hint='The Service Level Agreement (SLA) for how fast a ticket should move through this stage.'
					/>

					{/* Re-using max count as a generic WIP limit mapping for UI state until schema evolves */}
					<TextField
						label='WIP Limit (Concurrent Tickets)'
						type='number'
						value={stage.file_max_count?.toString() || ''}
						onChange={(v) => updateStage('file_max_count', parseInt(v))}
						floating
						hint='Optional. Maximum active tickets allowed in this stage at one time to prevent bottlenecks.'
					/>
				</div>
			</div>

			{/* Confirm Trigger */}
			<div className='timeline-stage-inspector__toggle-row'>
				<label className='toggle-label'>
					<IconLockSquareRounded size={18} color='var(--text-muted)' />
					<div>
						<span className='toggle-label__title'>Require Handover Confirmation</span>
						<span className='toggle-label__desc'>
							Tickets require explicit managerial approval before being pulled into this stage.
						</span>
					</div>
				</label>
				<div className='toggle-switch'>
					<input
						type='checkbox'
						id={`hire-trigger-${index}`}
						checked={stage.hire_trigger_active !== false}
						onChange={(e) => updateStage('hire_trigger_active', e.currentTarget.checked)}
					/>
					<label htmlFor={`hire-trigger-${index}`}></label>
				</div>
			</div>
		</>
	);
}
// #endregion
