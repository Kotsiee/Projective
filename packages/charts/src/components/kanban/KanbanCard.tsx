import type { KanbanCardProps } from '../../types/kanban.ts';
import { useDraggable, useDropzone } from '../../hooks/useKanbanDnD.ts';
import '../../styles/kanban/kanban-card.css';

interface ExtendedCardProps extends KanbanCardProps {
	fieldId: string;
	onClick?: () => void;
}

export function KanbanCard({
	fieldId,
	id,
	title,
	description,
	meta,
	tags,
	takenBy,
	permissions,
	onClick,
	...rest
}: ExtendedCardProps) {
	const isLocked = permissions?.canReorder !== true;
	const draggableProps = useDraggable(
		'card',
		{ id, title, description, tags, takenBy, permissions, ...rest },
		fieldId,
		isLocked,
	);
	const dropzoneProps = useDropzone('card', id);

	return (
		<div
			class='kanban-card'
			{...dropzoneProps}
			{...draggableProps}
			onClick={onClick}
			role='button'
			tabIndex={0}
		>
			<div class='kanban-card__header'>
				<h4 class='kanban-card__title'>{title}</h4>
				{meta && <span class='kanban-card__meta'>{meta}</span>}
			</div>

			{description && (
				<div class='kanban-card__body'>
					<p class='kanban-card__desc'>{description}</p>
				</div>
			)}

			<div class='kanban-card__footer'>
				<div class='kanban-card__tags'>
					{tags?.map((tag) => (
						<span
							key={tag.id}
							class={`kanban-card__tag kanban-card__tag--${tag.variant || 'solid'}`}
							style={tag.color ? { color: tag.color } : {}}
						>
							{tag.icon && <span class='kanban-card__tag-icon'>{tag.icon}</span>}
							{tag.label}
						</span>
					))}
				</div>

				{takenBy && (
					<div class='kanban-card__assignee'>
						{takenBy.avatarUrl
							? <img src={takenBy.avatarUrl} alt={takenBy.name} class='kanban-card__avatar-img' />
							: (
								<div class='kanban-card__avatar' title={takenBy.name}>
									{takenBy.name.charAt(0).toUpperCase()}
								</div>
							)}
					</div>
				)}
			</div>
		</div>
	);
}
