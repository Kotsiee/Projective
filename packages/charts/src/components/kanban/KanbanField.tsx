import { Fragment } from 'preact';
import { Button } from '@projective/ui';
import { KanbanCard } from './KanbanCard.tsx';
import { KanbanCardProps, KanbanFieldProps } from '../../types/kanban.ts';
import { dragData, useDraggable, useDropzone } from '../../hooks/useKanbanDnD.ts';
import { IconArrowsSort, IconClockHour4, IconInbox } from '@tabler/icons-preact';
import '../../styles/kanban/kanban-field.css';

// deno-lint-ignore no-explicit-any
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

/** Right-aligned header hint describing how the column is ordered (spec §1). */
function SortHint({ mode }: { mode: 'manual' | 'recency' }) {
	if (mode === 'manual') {
		return (
			<span class='kanban-field__hint'>
				<IconArrowsSort size={13} stroke={1.8} />
				drag to reorder
			</span>
		);
	}
	return (
		<span class='kanban-field__hint'>
			<IconClockHour4 size={13} stroke={1.8} />
			by update
		</span>
	);
}

export function KanbanField({
	id,
	title,
	color = 'secondary',
	cards,
	limit,
	order,
	sortMode,
	permissions,
	addCardLabel = 'Add Ticket',
	onCardClick,
	onAddCard,
}: ExtendedFieldProps) {
	const sortedCards = sortCards(cards);
	const cardCount = cards.length;
	const isOverLimit = limit !== undefined && cardCount > limit;

	const isLocked = permissions?.canReorder !== true;
	const draggableProps = useDraggable(
		'field',
		{ id, title, color, cards, limit, order, sortMode, permissions },
		id,
		isLocked,
	);
	const dropzoneProps = useDropzone('field', id);

	// Contextual logic evaluating active hover/drag interaction
	const isAnyCardHoveringThisField = dragData.value.isDragging &&
		dragData.value.type === 'card' &&
		dragData.value.targetFieldId === id;

	// CSS custom property in an inline style object — Preact's JSX.CSSProperties doesn't model
	// arbitrary `--vars`, hence the cast (mirrors the pattern used elsewhere in the package).
	// deno-lint-ignore no-explicit-any
	const fieldStyle = { '--field-solid': resolveColor(color) } as any;

	return (
		<div class='kanban-field' style={fieldStyle} {...dropzoneProps}>
			<div class='kanban-field__header' {...draggableProps}>
				<div class='kanban-field__heading'>
					<span class='kanban-field__dot' aria-hidden='true' />
					<h3 class='kanban-field__title'>{title}</h3>
					<span
						class={`kanban-field__count ${isOverLimit ? 'kanban-field__count--danger' : ''}`}
					>
						{cardCount}
					</span>
				</div>
				{sortMode && <SortHint mode={sortMode} />}
			</div>

			<div class='kanban-field__body'>
				{cardCount === 0 && !isAnyCardHoveringThisField && (
					<div class='kanban-field__empty-state'>
						<IconInbox size={22} class='kanban-field__empty-icon' />
						<span class='kanban-field__empty-text'>Empty</span>
					</div>
				)}

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
