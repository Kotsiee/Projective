// #region IMPORTS
import type { KanbanCardProps } from '../../types/kanban.ts';
import '../../styles/kanban/kanban-card.css';
// #endregion

// #region COMPONENT
interface ExtendedCardProps extends KanbanCardProps {
	fieldId: string;
	onClick?: () => void;
	onPointerDown?: (e: PointerEvent) => void;
}

export function KanbanCard({
	id,
	title,
	description,
	tags,
	attachments,
	takenBy,
	permissions,
	onClick,
	onPointerDown,
}: ExtendedCardProps) {
	const canReorder = permissions?.canReorder === true;

	return (
		<div
			class='kanban-card'
			data-kanban-card-id={id}
			data-reorderable={canReorder}
			onPointerDown={onPointerDown}
			onClick={onClick}
			role='button'
			tabIndex={0}
		>
			<div class='kanban-card__header'>
				<h4 class='kanban-card__title'>{title}</h4>
			</div>

			{description && <p class='kanban-card__desc'>{description}</p>}

			{tags && tags.length > 0 && (
				<div class='kanban-card__tags'>
					{tags.map((tag) => <span key={tag} class='kanban-card__tag'>{tag}</span>)}
				</div>
			)}

			<div class='kanban-card__footer'>
				<div class='kanban-card__meta'>
					{attachments !== undefined && attachments > 0 && (
						<span class='kanban-card__attachment'>
							<span class='kanban-card__icon'>📎</span> {attachments}
						</span>
					)}
				</div>
				{takenBy && (
					<div class='kanban-card__assignee'>
						<div class='kanban-card__avatar' title={takenBy}>
							{takenBy.charAt(0).toUpperCase()}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
// #endregion
