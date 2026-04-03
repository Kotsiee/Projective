import '../../styles/gantt/gantt.css';
import { GanttStore } from '../../core/gantt/store.ts';
import { GanttHeader } from './GanttHeader.tsx';
import { GanttTimeline } from './GanttTimeline.tsx';
import { GanttTaskList } from './GanttTaskList.tsx';
import { useEffect, useMemo } from 'preact/hooks';
import { DependencyLink, GanttRow, GanttTask } from '../../types/gantt.ts';

// #region Interfaces
interface GanttChartProps {
	initialData: {
		rows: GanttRow[];
		tasks: GanttTask[];
		dependencies: DependencyLink[];
	};
	selectedRowId?: string;
	onRowSelect?: (rowId: string) => void;
}
// #endregion

export default function GanttChart({ initialData, selectedRowId, onRowSelect }: GanttChartProps) {
	const store = useMemo(() => {
		const defaultStart = initialData?.tasks?.[0]?.startAt ||
			(Date.now() - (7 * 24 * 60 * 60 * 1000));

		return new GanttStore({
			visibleWidth: 1000,
			visibleHeight: 500,
			startDate: defaultStart,
		});
	}, []);

	useEffect(() => {
		store.onRowSelect = onRowSelect;
	}, [onRowSelect, store]);

	useEffect(() => {
		if (selectedRowId !== undefined) {
			store.selectedRowId.value = selectedRowId;
		}
	}, [selectedRowId, store]);

	useEffect(() => {
		if (initialData) {
			store.loadData(initialData.rows, initialData.tasks, initialData.dependencies);

			if (initialData.tasks.length > 0) {
				const earliestTask = initialData.tasks.reduce(
					(min, t) => t.startAt < min.startAt ? t : min,
					initialData.tasks[0],
				);
				const currentStart = store.timelineStart.value;

				if (
					earliestTask.startAt < currentStart - (3 * 86400000) ||
					earliestTask.startAt > currentStart + (7 * 86400000)
				) {
					store.setStartDate(earliestTask.startAt - (3 * 86400000));
					store.scrollX.value = 0;
				}
			}
		}
	}, [initialData, store]);

	return (
		<div
			className='gantt-chart'
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: '1rem',
				width: '100%',
				flex: 1, // CRITICAL: Use flex: 1 instead of height: 100% to resolve CSS minimum height collapse bounds
				minHeight: 0,
				minWidth: 0,
				overflow: 'hidden',
			}}
		>
			<div class='gantt-controls' style={{ width: '100%', flexShrink: 0 }}>
				<GanttHeader store={store} />
			</div>

			<div
				class='gantt-body'
				style={{
					display: 'flex',
					flex: 1,
					width: '100%',
					minHeight: 0,
					minWidth: 0,
					backgroundColor: 'var(--card)',
					border: '1px solid var(--border-color)',
					borderRadius: 'var(--border-radius)',
					overflow: 'hidden',
				}}
			>
				<GanttTaskList store={store} width={store.containerWidth.value} />
				<GanttTimeline store={store} />
			</div>
		</div>
	);
}
