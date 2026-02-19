import '../../styles/gantt/gantt.css';
import { GanttStore } from '../../core/gantt/store.ts';
import { GanttHeader } from './GanttHeader.tsx';
import { GanttTimeline } from './GanttTimeline.tsx';
import { GanttTaskList } from './GanttTaskList.tsx';
import { useMemo } from 'preact/hooks';

// #region Interfaces

interface GanttChartProps {
	initialData: any;
}

// #endregion

export default function GanttChart({ initialData }: GanttChartProps) {
	const store = useMemo(() => {
		const s = new GanttStore({
			visibleWidth: 1000,
			visibleHeight: 500,
			startDate: Date.now() - (7 * 24 * 60 * 60 * 1000),
			endDate: Date.now() + (21 * 24 * 60 * 60 * 1000),
		});

		s.loadData(initialData.rows, initialData.tasks, initialData.dependencies);
		return s;
	}, [initialData]);

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
