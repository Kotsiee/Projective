import { Fragment } from 'preact';
import { Button } from '@projective/ui';
import { KanbanCard } from './KanbanCard.tsx';
import { KanbanCardProps, KanbanFieldProps } from '../../types/kanban.ts';
import { dragData, useDraggable, useDropzone } from '../../hooks/useKanbanDnD.ts';
import '../../styles/kanban/kanban-field.css';

const getTimestamp = (date: any): number => date ? new Date(date).getTime() : 0;

const sortCards = (cards: KanbanCardProps[]): KanbanCardProps[] => {
	return [...cards].sort((a, b) => {
		if (a.order !== b.order) return a.order - b.order;
		return getTimestamp(a.created) - getTimestamp(b.created);
	});
};

const resolveColor = (c: string) => {
	if (c === 'primary') return 'var(--primary)';
	if (!c || c === 'secondary') return 'var(--text-muted)';
	return c;
};

interface ExtendedFieldProps extends KanbanFieldProps {
	onCardClick?: (card: KanbanCardProps) => void;
	onAddCard?: () => void;
}

export function KanbanField({
	id,
	title,
	color = 'secondary',
	cards,
	limit,
	order,
	permissions,
	addCardLabel = 'Add Ticket',
	onCardClick,
	onAddCard,
}: ExtendedFieldProps) {
	const sortedCards = sortCards(cards);
	const cardCount = cards.length;
	const isOverLimit = limit !== undefined && cardCount > limit;

	// Locks/Hooks Setup
	const isLocked = permissions?.canReorder !== true;
	const draggableProps = useDraggable(
		'field',
		{ id, title, color, cards, limit, order, permissions },
		id,
		isLocked,
	);
	const dropzoneProps = useDropzone('field', id);

	return (
		<div
			class='kanban-field'
			style={{ '--field-solid': resolveColor(color) } as any}
			{...dropzoneProps}
		>
			<div class='kanban-field__header' {...draggableProps}>
				<h3 class='kanban-field__title'>{title}</h3>
				<div class={`kanban-field__metrics ${isOverLimit ? 'kanban-field__metrics--danger' : ''}`}>
					<span class='kanban-field__count'>{cardCount}</span>
				</div>
			</div>

			<div class='kanban-field__body'>
				{sortedCards.map((card) => {
					const isDraggingThisCard = dragData.value.type === 'card' &&
						dragData.value.id === card.id;
					const isDropTarget = dragData.value.isDragging && dragData.value.type === 'card' &&
						dragData.value.targetCardId === card.id && !isDraggingThisCard;

					return (
						<Fragment key={card.id}>
							{isDropTarget && dragData.value.insertPosition === 'before' && (
								<div class='kanban-card-ghost' style={{ height: `${dragData.value.height}px` }} />
							)}

							<div style={{ display: isDraggingThisCard ? 'none' : 'block' }}>
								<KanbanCard
									{...card}
									fieldId={id}
									onClick={() => onCardClick?.(card)}
								/>
							</div>

							{isDropTarget && dragData.value.insertPosition === 'after' && (
								<div class='kanban-card-ghost' style={{ height: `${dragData.value.height}px` }} />
							)}
						</Fragment>
					);
				})}

				{dragData.value.isDragging && dragData.value.type === 'card' &&
					dragData.value.targetFieldId === id && !dragData.value.targetCardId && (
					<div class='kanban-card-ghost' style={{ height: `${dragData.value.height}px` }} />
				)}

				{permissions?.canAddCard && onAddCard && (
					<div class='kanban-field__add-wrapper'>
						<Button ghost variant='secondary' onClick={onAddCard} className='kanban-field__add-btn'>
							+ {addCardLabel}
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
