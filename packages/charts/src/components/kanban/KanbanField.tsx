// #region IMPORTS
import { Fragment } from 'preact';
import type { Signal } from '@preact/signals';
import { Button } from '@projective/ui';
import { KanbanCard } from './KanbanCard.tsx';
import type { DragData, KanbanCardProps, KanbanFieldProps } from '../../types/kanban.ts';
import '../../styles/kanban/kanban-field.css';
// #endregion

// #region HELPERS
const getTimestamp = (date: any): number => {
	if (!date) return 0;
	return new Date(date).getTime();
};

const sortCards = (cards: KanbanCardProps[]): KanbanCardProps[] => {
	return [...cards].sort((a, b) => {
		if (a.order !== b.order) return a.order - b.order;
		return getTimestamp(a.created) - getTimestamp(b.created);
	});
};
// #endregion

// #region COMPONENT
interface ExtendedFieldProps extends KanbanFieldProps {
	dragData: Signal<DragData>;
	startFieldDrag: (e: PointerEvent, field: KanbanFieldProps) => void;
	startCardDrag: (e: PointerEvent, card: KanbanCardProps, fieldId: string) => void;
	onCardClick?: (card: KanbanCardProps) => void;
	onAddCard?: () => void;
}

export function KanbanField({
	id,
	title,
	color = 'var(--primary)',
	cards,
	limit,
	order,
	permissions,
	addCardLabel = 'Add Ticket',
	dragData,
	startFieldDrag,
	startCardDrag,
	onCardClick,
	onAddCard,
}: ExtendedFieldProps) {
	const sortedCards = sortCards(cards);
	const cardCount = cards.length;
	const isOverLimit = limit !== undefined && cardCount > limit;
	const canReorder = permissions?.canReorder === true;

	return (
		<div
			class='kanban-field'
			style={{ '--field-indicator': color } as any}
			data-kanban-field-id={id}
		>
			<div
				class='kanban-field__header'
				onPointerDown={(e) =>
					startFieldDrag(e, { id, title, color, cards, limit, order, permissions })}
				data-reorderable={canReorder}
			>
				<div class='kanban-field__indicator' />
				<h3 class='kanban-field__title'>{title}</h3>
				<div class={`kanban-field__metrics ${isOverLimit ? 'kanban-field__metrics--danger' : ''}`}>
					<span class='kanban-field__count'>{cardCount}</span>
					{limit !== undefined && <span class='kanban-field__limit'>/ {limit}</span>}
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
									onPointerDown={(e) => startCardDrag(e, card, id)}
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
						<Button
							ghost
							variant='secondary'
							onClick={onAddCard}
							className='kanban-field__add-btn'
						>
							+ {addCardLabel}
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
// #endregion
