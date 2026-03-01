import { GanttStore } from '../../core/gantt/store.ts';
import { DateTime } from '@projective/types';
import '../../styles/gantt/gantt-tooltip.css';

interface GanttTooltipProps {
	store: GanttStore;
}

export function GanttTooltip({ store }: GanttTooltipProps) {
	const task = store.hoveredTask.value;
	const pos = store.pointerPos.value;

	// Hide if nothing hovered, or if the user is actively dragging the canvas around
	if (!task || store.isMouseDown.value) return null;

	const startDt = new DateTime(new Date(task.startAt));
	const endDt = new DateTime(new Date(task.endAt));

	const isSinglePoint = task.startAt === task.endAt;

	// Collision Detection:
	// If near the top roof, flip it below the cursor.
	// If near the right edge, shift it left of the cursor.
	const isHitRoof = pos.y < 120;
	const isHitWall = pos.x > store.containerWidth.value - 280;

	// Diagonal offset of 15px so it doesn't cover the mouse pointer
	const transformX = isHitWall ? 'calc(-100% - 15px)' : '15px';
	const transformY = isHitRoof ? '15px' : 'calc(-100% - 15px)';

	const style = {
		left: `${pos.x}px`,
		top: `${pos.y}px`,
		transform: `translate(${transformX}, ${transformY})`,
	};

	return (
		<div class='gantt-tooltip' style={style}>
			<div class='gantt-tooltip__header'>
				<span class='gantt-tooltip__type'>{task.isMilestone ? 'Milestone' : 'Task'}</span>
			</div>

			<div class='gantt-tooltip__title'>{task.name}</div>

			<div class='gantt-tooltip__meta'>
				{isSinglePoint
					? (
						<div class='gantt-tooltip__meta-row'>
							<span class='gantt-tooltip__meta-label'>Scheduled:</span>
							<span>{startDt.toFormat('dd MMM yyyy, HH:mm')}</span>
						</div>
					)
					: (
						<>
							<div class='gantt-tooltip__meta-row'>
								<span class='gantt-tooltip__meta-label'>Starts:</span>
								<span>{startDt.toFormat('dd MMM yyyy, HH:mm')}</span>
							</div>
							<div class='gantt-tooltip__meta-row'>
								<span class='gantt-tooltip__meta-label'>Ends:</span>
								<span>{endDt.toFormat('dd MMM yyyy, HH:mm')}</span>
							</div>
						</>
					)}
			</div>
		</div>
	);
}
