// #region IMPORTS
import { Fragment } from 'preact';
import { useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { KanbanField } from './KanbanField.tsx';
import { KanbanCard } from './KanbanCard.tsx';
import { Button } from '@projective/ui';
import {
	DragData,
	INITIAL_DRAG_DATA,
	KanbanCardProps,
	KanbanFieldProps,
	KanbanProps,
} from '../../types/kanban.ts';
import '../../styles/kanban/kanban.css';
// #endregion

// #region HELPERS
const sortFields = (fields: KanbanFieldProps[]): KanbanFieldProps[] => {
	return [...fields].sort((a, b) => {
		if (a.order >= 0 && b.order >= 0) return a.order - b.order;
		if (a.order < 0 && b.order < 0) return b.order - a.order;
		if (a.order >= 0 && b.order < 0) return -1;
		return 1;
	});
};
// #endregion

// #region COMPONENT
export function Kanban({
	fields,
	mode = 'container',
	permissions,
	onCardClick,
	onAddCard,
	onAddField,
	onCardMove,
	onFieldMove,
}: KanbanProps) {
	const dragData = useSignal<DragData>(INITIAL_DRAG_DATA);
	const sortedFields = sortFields(fields);

	// --- DRAG INITIATORS ---
	const startFieldDrag = (e: PointerEvent, field: KanbanFieldProps) => {
		if (field.permissions?.canReorder !== true) return;
		if ((e.target as HTMLElement).closest('button')) return;

		const el = (e.currentTarget as HTMLElement).closest('.kanban__field-wrapper');
		if (!el) return;

		const rect = el.getBoundingClientRect();
		e.preventDefault();

		dragData.value = {
			...INITIAL_DRAG_DATA,
			isDragging: true,
			type: 'field',
			id: field.id,
			clientX: e.clientX,
			clientY: e.clientY,
			offsetX: e.clientX - rect.left,
			offsetY: e.clientY - rect.top,
			width: rect.width,
			height: rect.height,
			fieldData: field,
		};
	};

	const startCardDrag = (e: PointerEvent, card: KanbanCardProps, fieldId: string) => {
		if (card.permissions?.canReorder !== true) return;

		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		e.preventDefault();
		e.stopPropagation();

		dragData.value = {
			...INITIAL_DRAG_DATA,
			isDragging: true,
			type: 'card',
			id: card.id,
			sourceFieldId: fieldId,
			clientX: e.clientX,
			clientY: e.clientY,
			offsetX: e.clientX - rect.left,
			offsetY: e.clientY - rect.top,
			width: rect.width,
			height: rect.height,
			cardData: card,
		};
	};

	// --- GLOBAL POINTER TRACKING ---
	useEffect(() => {
		const handlePointerMove = (e: PointerEvent) => {
			if (!dragData.value.isDragging) return;
			e.preventDefault();

			const targetEl = document.elementFromPoint(e.clientX, e.clientY);

			let targetFieldId = dragData.value.targetFieldId;
			let targetCardId = dragData.value.targetCardId;
			let insertPosition = dragData.value.insertPosition;

			if (dragData.value.type === 'card') {
				const cardEl = targetEl?.closest('[data-kanban-card-id]');
				const fieldEl = targetEl?.closest('[data-kanban-field-id]');

				if (cardEl) {
					targetFieldId = fieldEl?.getAttribute('data-kanban-field-id') || null;
					targetCardId = cardEl.getAttribute('data-kanban-card-id');
					const rect = cardEl.getBoundingClientRect();
					insertPosition = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
				} else if (fieldEl) {
					const hoveredFieldId = fieldEl.getAttribute('data-kanban-field-id');
					if (hoveredFieldId !== targetFieldId) {
						targetFieldId = hoveredFieldId;
						targetCardId = null;
						insertPosition = 'after';
					}
				}
			} else if (dragData.value.type === 'field') {
				const fieldEl = targetEl?.closest('[data-kanban-field-wrapper-id]');
				if (fieldEl) {
					targetFieldId = fieldEl.getAttribute('data-kanban-field-wrapper-id');
					const rect = fieldEl.getBoundingClientRect();
					insertPosition = e.clientX < rect.left + rect.width / 2 ? 'before' : 'after';
				}
			}

			dragData.value = {
				...dragData.value,
				clientX: e.clientX,
				clientY: e.clientY,
				targetFieldId,
				targetCardId,
				insertPosition,
			};
		};

		const handlePointerUp = () => {
			if (!dragData.value.isDragging) return;

			const { type, id, sourceFieldId, targetFieldId, targetCardId, insertPosition } =
				dragData.value;

			if (type === 'card' && id && sourceFieldId && targetFieldId) {
				let insertBeforeId = null;
				if (targetCardId) {
					insertBeforeId = insertPosition === 'before' ? targetCardId : `${targetCardId}_after`;
				}
				if (!(sourceFieldId === targetFieldId && targetCardId === id)) {
					onCardMove?.(id, sourceFieldId, targetFieldId, insertBeforeId);
				}
			} else if (type === 'field' && id && targetFieldId && id !== targetFieldId) {
				onFieldMove?.(id, targetFieldId, insertPosition === 'before');
			}

			dragData.value = INITIAL_DRAG_DATA;
		};

		if (dragData.value.isDragging) {
			window.addEventListener('pointermove', handlePointerMove, { passive: false });
			window.addEventListener('pointerup', handlePointerUp);
		}

		return () => {
			window.removeEventListener('pointermove', handlePointerMove);
			window.removeEventListener('pointerup', handlePointerUp);
		};
	}, [dragData.value.isDragging, onCardMove, onFieldMove]);

	const classes = [
		'kanban',
		`kanban--mode-${mode}`,
		dragData.value.isDragging ? 'kanban--dragging' : '',
	].filter(Boolean).join(' ');

	return (
		<div class={classes}>
			<div class='kanban__track'>
				{sortedFields.map((field) => {
					const isDraggingThisField = dragData.value.type === 'field' &&
						dragData.value.id === field.id;
					const isDropTarget = dragData.value.isDragging && dragData.value.type === 'field' &&
						dragData.value.targetFieldId === field.id && !isDraggingThisField;

					return (
						<Fragment key={field.id}>
							{isDropTarget && dragData.value.insertPosition === 'before' && (
								<div class='kanban__field-ghost' style={{ height: `${dragData.value.height}px` }} />
							)}

							<div
								class='kanban__field-wrapper'
								data-kanban-field-wrapper-id={field.id}
								style={{ display: isDraggingThisField ? 'none' : 'flex' }}
							>
								<KanbanField
									{...field}
									dragData={dragData}
									startFieldDrag={startFieldDrag}
									startCardDrag={startCardDrag}
									onCardClick={onCardClick}
									onAddCard={field.permissions?.canAddCard && onAddCard
										? () => onAddCard(field.id)
										: undefined}
								/>
							</div>

							{isDropTarget && dragData.value.insertPosition === 'after' && (
								<div class='kanban__field-ghost' style={{ height: `${dragData.value.height}px` }} />
							)}
						</Fragment>
					);
				})}

				{permissions?.canAddField && onAddField && (
					<div class='kanban__add-action'>
						<Button ghost onClick={onAddField} className='kanban__add-btn'>
							<span class='kanban__add-icon'>+</span> Add Stage
						</Button>
					</div>
				)}
			</div>

			{dragData.value.isDragging && (
				<div
					class='kanban__drag-avatar'
					style={{
						left: `${dragData.value.clientX - dragData.value.offsetX}px`,
						top: `${dragData.value.clientY - dragData.value.offsetY}px`,
						width: `${dragData.value.width}px`,
						height: `${dragData.value.height}px`,
					}}
				>
					{dragData.value.type === 'field'
						? (
							<KanbanField
								{...dragData.value.fieldData!}
								cards={[]}
								dragData={dragData}
								startFieldDrag={() => {}}
								startCardDrag={() => {}}
							/>
						)
						: <KanbanCard {...dragData.value.cardData!} fieldId='' />}
				</div>
			)}
		</div>
	);
}
// #endregion
