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
		}
	}, [initialData, store]);

	return (
		<div className='gantt-chart'>
			<div class='gantt-controls'>
				<GanttHeader store={store} />
			</div>
			<div class='gantt-body'>
				<GanttTaskList store={store} width={store.containerWidth.value} />
				<GanttTimeline store={store} />
			</div>
		</div>
	);
}
