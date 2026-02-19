import { GanttRow } from '../../types/gantt.ts';
import { IconGripVertical } from '@tabler/icons-preact';
import { GanttStore } from './../../core/gantt/store.ts';

interface GanttTaskCardProps {
	row: GanttRow;
	isActive?: boolean;
	store: GanttStore;
}

export function GanttTaskCard({ row, isActive, store }: GanttTaskCardProps) {
	return (
		<div
			class='gantt-task-card__container'
			data-active={isActive}
			style={`--task-height: ${store.rowHeight.value}px`}
		>
			<div class='gantt-task-card' data-active={isActive}>
				<div class='gantt-task-card__grip'>
					<IconGripVertical size={18} />
				</div>

				<div class='gantt-task-card__content'>
					<div>
						<h4 class='gantt-task-card__title'>{row.label}</h4>
					</div>

					<div class='gantt-task-card__meta'>
						<span class='gantt-task-card__type'>
							{row.type}
						</span>
						<span class='gantt-task-card__date'>
							27/02/25 - 04/03/25
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
