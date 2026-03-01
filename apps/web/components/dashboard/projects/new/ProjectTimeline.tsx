import '@styles/components/dashboard/projects/new/new-project-timeline.css';
import { useNewProjectContext } from '@contexts/NewProjectContext.tsx';
import { DateField, SelectField } from '@projective/fields';
import { SelectOption, StageType, StartTriggerType, TimelinePreset } from '@projective/types';
import { DependencyType, GanttChart, RowType } from '@projective/charts';
import { IconCalendarEvent, IconChartArcs } from '@tabler/icons-preact';
import { useMemo } from 'preact/hooks';

export default function ProjectTimeline() {
	const state = useNewProjectContext();

	const presetOptions: SelectOption<string>[] = [
		{ label: 'Sequential (Waterfall)', value: TimelinePreset.Sequential },
		{ label: 'Simultaneous (All at once)', value: TimelinePreset.Simultaneous },
		{ label: 'Staggered (Overlapping)', value: TimelinePreset.Staggered },
		{ label: 'Custom Mapping', value: TimelinePreset.Custom },
	];

	// Handles applying a global preset template to all stages
	const handlePresetChange = (preset: string) => {
		state.timelinePreset.value = preset;
		if (preset === TimelinePreset.Custom) return;

		const newStages = [...state.stages.value];
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
					s.start_dependency_lag_days = -2; // 2 day overlap default for Staggered
				}
			}
		});
		state.stages.value = newStages;
	};

	// deno-lint-ignore no-explicit-any
	const extractMs = (dateVal: any, fallback: number): number => {
		if (!dateVal) return fallback;
		if (typeof dateVal === 'number') return dateVal;
		if (typeof dateVal.getTime === 'function') return dateVal.getTime();
		const d = new Date(dateVal.toString());
		return isNaN(d.getTime()) ? fallback : d.getTime();
	};

	const daysMap: Record<string, number> = {
		sunday: 0,
		monday: 1,
		tuesday: 2,
		wednesday: 3,
		thursday: 4,
		friday: 5,
		saturday: 6,
	};

	const ganttData = useMemo(() => {
		const fallbackStart = new Date();
		fallbackStart.setHours(0, 0, 0, 0);

		const defaultStart = extractMs(state.targetStartDate.value, fallbackStart.getTime());

		// 1. Prepare base stage data
		// deno-lint-ignore no-explicit-any
		const computedStages: any[] = state.stages.value.map((s, idx) => ({
			...s,
			idx,
			calculatedStartMs: defaultStart,
			calculatedEndMs: defaultStart + 86400000,
			durationMs: 86400000,
		}));

		// 2. Cascade start times and end times based on dependencies
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
						// Prevent negative lag from pushing a task before the global project start
						intendedStart = Math.max(defaultStart, parent.calculatedEndMs + lagMs);
					}
				}

				if (intendedStart !== s.calculatedStartMs) {
					s.calculatedStartMs = intendedStart;
					keepCalculating = true;
				}

				let newEndMs = s.calculatedStartMs + s.durationMs;

				if (s.stage_type === StageType.SessionBased) {
					const prefDays = s.session_preferred_days || [];
					const count = s.session_count || 1;

					if (prefDays.length > 0) {
						const targetDays = prefDays.map((d: string) => daysMap[d.toLowerCase()]).filter((
							d: number,
						) => d !== undefined);
						let currentMs = s.calculatedStartMs;
						let scheduled = 0;
						let safety = 0;
						let lastMs = currentMs;

						while (scheduled < count && safety < 365) {
							const date = new Date(currentMs);
							if (targetDays.includes(date.getDay())) {
								lastMs = currentMs;
								scheduled++;
							}
							if (scheduled < count) currentMs += 86400000;
							safety++;
						}
						newEndMs = lastMs + 86400000;
					} else {
						if (s.session_end_date) {
							newEndMs = Math.max(
								extractMs(s.session_end_date, s.calculatedStartMs + 86400000),
								s.calculatedStartMs + 86400000,
							);
						} else {
							newEndMs = s.calculatedStartMs + (count * 86400000);
						}
					}
				} else if (
					s.stage_type === StageType.FileBased && s.file_duration_mode === 'fixed_deadline' &&
					s.file_due_date
				) {
					newEndMs = Math.max(
						extractMs(s.file_due_date, s.calculatedStartMs),
						s.calculatedStartMs + 86400000,
					);
				} else if (s.stage_type === StageType.MaintenanceBased) {
					newEndMs = s.calculatedStartMs +
						(s.maintenance_cycle_interval === 'monthly' ? 30 * 86400000 : 7 * 86400000);
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

		// 3. Expand Tasks for rendering
		// deno-lint-ignore no-explicit-any
		const finalTasks: any[] = [];
		for (const s of computedStages) {
			if (s.stage_type === StageType.SessionBased && (s.session_preferred_days || []).length > 0) {
				const prefDays = s.session_preferred_days || [];
				const count = s.session_count || 1;
				const targetDays = prefDays.map((d: string) => daysMap[d.toLowerCase()]).filter((
					d: number,
				) => d !== undefined);

				let currentMs = s.calculatedStartMs;
				let scheduled = 0;
				let safety = 0;

				while (scheduled < count && safety < 365) {
					const date = new Date(currentMs);
					if (targetDays.includes(date.getDay())) {
						finalTasks.push({
							id: `task-${s.idx}-${scheduled}`,
							rowId: s.idx.toString(),
							name: `${s.title} (Session ${scheduled + 1}/${count})`,
							startAt: currentMs,
							endAt: currentMs + 86400000,
							progress: 0,
							status: 'todo',
							isMilestone: true,
						});
						scheduled++;
					}
					currentMs += 86400000;
					safety++;
				}
			} else {
				finalTasks.push({
					id: `task-${s.idx}`,
					rowId: s.idx.toString(),
					name: s.title || `Stage ${s.idx + 1}`,
					startAt: s.calculatedStartMs,
					endAt: s.calculatedEndMs,
					progress: 0,
					status: 'todo',
					isMilestone: s.stage_type === StageType.ManagementBased,
				});
			}
		}

		// 4. Map and sort rows chronologically
		const finalRows = computedStages.map((s) => ({
			id: s.idx.toString(),
			label: s.title || `Stage ${s.idx + 1}`,
			type: s.stage_type === StageType.ManagementBased ? RowType.Milestone : RowType.Task,
			orderIndex: s.idx, // Will be overwritten by sort
			collapsed: false,
			data: {
				originalType: s.stage_type,
				startMs: s.calculatedStartMs,
				endMs: s.calculatedEndMs,
			},
		}));

		// Sort by start date, using ID as a tie-breaker for stability
		finalRows.sort((a, b) => {
			if (a.data.startMs === b.data.startMs) {
				return parseInt(a.id, 10) - parseInt(b.id, 10);
			}
			return a.data.startMs - b.data.startMs;
		});

		// Reassign orderIndex so the Gantt sidebar renders them chronologically
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
	}, [state.stages.value, state.targetStartDate.value]);

	return (
		<div className='project-timeline'>
			<div className='project-timeline__header'>
				<h2>Timeline & Dependencies</h2>
				<p className='project-timeline__subtitle'>
					Define the global timeline and map exactly when each stage should begin.
				</p>
			</div>

			<div className='project-timeline__section project-timeline__section--global'>
				<h3 className='project-timeline__section-title'>
					<IconCalendarEvent size={18} /> Global Project Schedule
				</h3>
				<div className='project-timeline__grid'>
					<SelectField
						name='timeline_preset'
						label='Overall Timeline Preset'
						options={presetOptions}
						value={state.timelinePreset.value || TimelinePreset.Sequential}
						onChange={(v) => handlePresetChange(v as string)}
						searchable={false}
						floating
						required
					/>

					<DateField
						label='Target Project Start Date'
						value={state.targetStartDate.value}
						onChange={(v) => state.targetStartDate.value = v}
						floating
						required
						hint='The earliest date any work on this project can begin.'
					/>
				</div>
			</div>

			<div className='project-timeline__section' style={{ flex: 1, minHeight: 0 }}>
				<h3 className='project-timeline__section-title'>
					<IconChartArcs size={18} /> Interactive Timeline
				</h3>
				<div className='gantt-chart-wrapper'>
					{/* @ts-ignore - Bypass for filtered arrays */}
					<GanttChart
						initialData={ganttData}
						selectedRowId={state.timelineSelectedStageIndex.value.toString()}
						onRowSelect={(id) => {
							state.timelineSelectedStageIndex.value = parseInt(id, 10);
						}}
					/>
				</div>
			</div>
		</div>
	);
}
