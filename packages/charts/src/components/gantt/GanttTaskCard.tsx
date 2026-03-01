import { GanttRow } from '../../types/gantt.ts';
import { GanttStore } from './../../core/gantt/store.ts';
import { DateTime } from '@projective/types';

interface GanttTaskCardProps {
	row: GanttRow;
	store: GanttStore;
}

export function GanttTaskCard({ row, store }: GanttTaskCardProps) {
	const startDt = new DateTime(new Date(row.data?.startMs || Date.now()));
	const endDt = new DateTime(new Date(row.data?.endMs || Date.now() + 86400000));
	const dateStr = `${startDt.toFormat('dd/MM/yy')} - ${endDt.toFormat('dd/MM/yy')}`;

	const isSelected = store.selectedRowId.value === row.id;

	return (
		<div
			class='gantt-task-card__container'
			style={`--task-height: ${store.rowHeight.value}px`}
		>
			<div
				class='gantt-task-card'
				data-selected={isSelected}
				onClick={() => store.selectRow(row.id)}
			>
				<div class='gantt-task-card__content'>
					<div>
						<h4 class='gantt-task-card__title'>{row.label}</h4>
					</div>

					<div class='gantt-task-card__meta'>
						<span class='gantt-task-card__type'>
							{row.data?.originalType?.replace('_', ' ') || row.type}
						</span>
						<span class='gantt-task-card__date'>
							{dateStr}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
