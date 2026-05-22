/**
 * @file ProjectTimeline.tsx
 * @description Step 4 of the Project Creation Engine.
 * Dynamically renders either a Gantt Chart (One-Off) or a Flow Visualizer (Pipeline) based on the project format.
 */

// #region Imports
import '../../styles/components/new/new-project-timeline.css';
import { useNewProjectContext } from '../../contexts/NewProjectContext.tsx';
import { DateField, SelectField, SelectOption } from '@projective/fields';
import { ProjectFormat, StartTriggerType, TimelinePreset } from '@projective/types';
import { DependencyType, GanttChart, RowType } from '@projective/charts';
import { IconCalendarEvent, IconChartArcs, IconGitBranch } from '@tabler/icons-preact';
import { useMemo } from 'preact/hooks';

import ProjectTimelineControls from '@features/dashboard/projects/components/new/ProjectTimelineControls.tsx';
// #endregion

// #region Main Component
/**
 * @function ProjectTimeline
 * @description Renders the Workflow and Scheduling step, adapting its layout and tools to the selected ProjectFormat.
 */
export default function ProjectTimeline() {
	const state = useNewProjectContext();

	const stages = state.stages.value;
	const targetStartDate = state.targetStartDate.value;
	const timelinePreset = state.timelinePreset.value;
	const selectedStageIndex = state.timelineSelectedStageIndex.value;
	const isOneOff = state.format.value === ProjectFormat.OneOff;

	// #region Options & Handlers
	const presetOptions: SelectOption<string>[] = [
		{ label: 'Sequential (Waterfall)', value: TimelinePreset.Sequential },
		{ label: 'Simultaneous (All at once)', value: TimelinePreset.Simultaneous },
		{ label: 'Staggered (Overlapping)', value: TimelinePreset.Staggered },
		{ label: 'Custom Mapping', value: TimelinePreset.Custom },
	];

	const handlePresetChange = (preset: string) => {
		state.timelinePreset.value = preset as TimelinePreset;
		if (preset === TimelinePreset.Custom) return;

		const newStages = [...stages];
		newStages.forEach((s, i) => {
			if (preset === TimelinePreset.Simultaneous) {
				s.start_trigger_type = StartTriggerType.OnProjectStart;
				s.start_dependency_stage_id = undefined;
				s.start_dependency_lag_days = 0;
			} else if (preset === TimelinePreset.Sequential) {
				if (i === 0) {
					s.start_trigger_type = StartTriggerType.OnProjectStart;
					s.start_dependency_stage_id = undefined;
				} else {
					s.start_trigger_type = StartTriggerType.DependentOnStage;
					s.start_dependency_stage_id = (i - 1).toString();
				}
				s.start_dependency_lag_days = 0;
			} else if (preset === TimelinePreset.Staggered) {
				if (i === 0) {
					s.start_trigger_type = StartTriggerType.OnProjectStart;
					s.start_dependency_stage_id = undefined;
					s.start_dependency_lag_days = 0;
				} else {
					s.start_trigger_type = StartTriggerType.DependentOnStage;
					s.start_dependency_stage_id = (i - 1).toString();
					s.start_dependency_lag_days = -2;
				}
			}
		});
		state.stages.value = newStages;
	};
	// #endregion

	// #region Gantt Data Calculation (One-Off Only)
	// deno-lint-ignore no-explicit-any
	const extractMs = (dateVal: any, fallback: number): number => {
		if (!dateVal) return fallback;
		if (typeof dateVal === 'number') return dateVal;
		if (typeof dateVal.toMillis === 'function') return dateVal.toMillis();
		if (typeof dateVal.getTime === 'function') return dateVal.getTime();
		const d = new Date(dateVal.toString());
		return isNaN(d.getTime()) ? fallback : d.getTime();
	};

	const ganttData = useMemo(() => {
		if (!isOneOff) return { rows: [], tasks: [], dependencies: [] };

		const fallbackStart = new Date();
		fallbackStart.setHours(0, 0, 0, 0);

		const defaultStart = extractMs(targetStartDate, fallbackStart.getTime());

		// deno-lint-ignore no-explicit-any
		const computedStages: any[] = stages.map((s, idx) => ({
			...s,
			idx,
			calculatedStartMs: defaultStart,
			calculatedEndMs: defaultStart + 86400000,
			durationMs: 86400000,
		}));

		let keepCalculating = true;
		let loops = 0;
		while (keepCalculating && loops < 10) {
			keepCalculating = false;
			loops++;

			for (const s of computedStages) {
				let intendedStart = defaultStart;

				if (s.start_trigger_type === StartTriggerType.FixedDate) {
					intendedStart = extractMs(s.fixed_start_date, defaultStart);
				} else if (
					s.start_trigger_type === StartTriggerType.DependentOnStage &&
					s.start_dependency_stage_id
				) {
					const depIdx = parseInt(s.start_dependency_stage_id, 10);
					const parent = computedStages[depIdx];
					if (parent) {
						const lagMs = (s.start_dependency_lag_days || 0) * 86400000;
						intendedStart = Math.max(defaultStart, parent.calculatedEndMs + lagMs);
					}
				}

				if (intendedStart !== s.calculatedStartMs) {
					s.calculatedStartMs = intendedStart;
					keepCalculating = true;
				}

				let newEndMs = s.calculatedStartMs + s.durationMs;

				if (s.file_duration_mode === 'fixed_deadline' && s.file_due_date) {
					newEndMs = Math.max(
						extractMs(s.file_due_date, s.calculatedStartMs),
						s.calculatedStartMs + 86400000,
					);
				} else {
					newEndMs = s.calculatedStartMs + ((s.file_duration_days || 7) * 86400000);
				}

				s.durationMs = newEndMs - s.calculatedStartMs;

				if (newEndMs !== s.calculatedEndMs) {
					s.calculatedEndMs = newEndMs;
					keepCalculating = true;
				}
			}
		}

		// deno-lint-ignore no-explicit-any
		const finalTasks: any[] = computedStages.map((s) => ({
			id: `task-${s.idx}`,
			rowId: s.idx.toString(),
			name: s.title || `Stage ${s.idx + 1}`,
			startAt: s.calculatedStartMs,
			endAt: s.calculatedEndMs,
			progress: 0,
			status: 'todo',
			isMilestone: false,
		}));

		const finalRows = computedStages.map((s) => ({
			id: s.idx.toString(),
			label: s.title || `Stage ${s.idx + 1}`,
			type: RowType.Task,
			orderIndex: s.idx,
			collapsed: false,
			data: {
				startMs: s.calculatedStartMs,
				endMs: s.calculatedEndMs,
			},
		}));

		finalRows.sort((a, b) => {
			if (a.data.startMs === b.data.startMs) {
				return parseInt(a.id, 10) - parseInt(b.id, 10);
			}
			return a.data.startMs - b.data.startMs;
		});

		finalRows.forEach((row, index) => {
			row.orderIndex = index;
		});

		return {
			rows: finalRows,
			tasks: finalTasks,
			dependencies: computedStages
				.map((s) => {
					if (
						s.start_trigger_type === StartTriggerType.DependentOnStage &&
						s.start_dependency_stage_id
					) {
						return {
							id: `dep-${s.idx}`,
							fromTaskId: `task-${s.start_dependency_stage_id}`,
							toTaskId: `task-${s.idx}`,
							type: DependencyType.FS,
							lagMs: (s.start_dependency_lag_days || 0) * 86400000,
						};
					}
					return null;
				})
				.filter((dep) => dep !== null),
		};
	}, [stages, targetStartDate, isOneOff]);
	// #endregion

	return (
		<div
			className='project-timeline'
			style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
		>
			<div className='project-timeline__header'>
				<h2>Workflow & Scheduling</h2>
				<p className='project-timeline__subtitle'>
					{isOneOff
						? 'Define the absolute timeline, dependencies, and deadlines for your one-off sprint.'
						: 'Configure the sequential flow, SLA turnaround times, and limits for your pipeline.'}
				</p>
			</div>

			{/* Global Schedule Constraints */}
			<div className='project-timeline__section project-timeline__section--global'>
				<h3 className='project-timeline__section-title'>
					<IconCalendarEvent size={18} /> Global Project Settings
				</h3>
				<div className='project-timeline__grid'>
					<SelectField
						name='timeline_preset'
						label='Stage Flow Preset'
						options={presetOptions}
						value={timelinePreset || TimelinePreset.Sequential}
						onChange={(v) => handlePresetChange(v as string)}
						searchable={false}
						floating
						required
						hint='Determines the default dependencies between stages.'
					/>

					<DateField
						label='Target Start Date'
						value={targetStartDate}
						onChange={(v) => state.targetStartDate.value = v}
						floating
						required
						hint='The earliest date any work on this project can begin.'
					/>
				</div>
			</div>

			{/* Visualizer & Inspector Split */}
			<div
				className='project-timeline__section'
				style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
			>
				<h3 className='project-timeline__section-title'>
					{isOneOff
						? (
							<>
								<IconChartArcs size={18} /> Interactive Timeline
							</>
						)
						: (
							<>
								<IconGitBranch size={18} /> Process Flow
							</>
						)}
				</h3>

				<div
					style={{
						display: 'flex',
						gap: '1.5rem',
						width: '100%',
						height: '500px',
						overflow: 'hidden',
					}}
				>
					{/* Left Pane: Visualizer */}
					<div
						className='gantt-chart-wrapper'
						style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
					>
						{isOneOff
							? (
								// @ts-ignore - Bypass for filtered arrays
								<GanttChart
									initialData={ganttData}
									selectedRowId={(selectedStageIndex ?? 0).toString()}
									onRowSelect={(id) => {
										state.timelineSelectedStageIndex.value = parseInt(id, 10);
									}}
								/>
							)
							: (
								<div
									style={{
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										justifyContent: 'center',
										height: '100%',
										backgroundColor: 'var(--input-bg)',
										border: '1px dashed var(--border-color)',
										borderRadius: 'var(--border-radius)',
										color: 'var(--text-muted)',
									}}
								>
									<IconGitBranch size={48} opacity={0.2} style={{ marginBottom: '1rem' }} />
									<h4 style={{ color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>
										Pipeline Flow Visualizer
									</h4>
									<span style={{ fontSize: '0.875rem' }}>
										Stages will be rendered as a sequence of connected nodes here.
									</span>
								</div>
							)}
					</div>

					{/* Right Pane: Inspector Controls */}
					<aside
						style={{
							width: '380px',
							flexShrink: 0,
							overflowY: 'auto',
							paddingLeft: '1.5rem',
							borderLeft: '1px solid var(--border-color)',
						}}
					>
						<ProjectTimelineControls />
					</aside>
				</div>
			</div>
		</div>
	);
}
// #endregion
