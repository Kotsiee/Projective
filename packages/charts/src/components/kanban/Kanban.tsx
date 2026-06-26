import { Fragment } from 'preact';
import { KanbanField } from './KanbanField.tsx';
import { KanbanCard } from './KanbanCard.tsx';
import { Button } from '@projective/ui';
import { KanbanFieldProps, KanbanProps } from '../../types/kanban.ts';
import { useKanbanDnD } from '../../hooks/useKanbanDnD.ts';
import '../../styles/kanban/kanban.css';

const sortFields = (fields: KanbanFieldProps[]): KanbanFieldProps[] => {
	return [...fields].sort((a, b) => {
		if (a.order >= 0 && b.order >= 0) return a.order - b.order;
		if (a.order < 0 && b.order < 0) return b.order - a.order;
		if (a.order >= 0 && b.order < 0) return -1;
		return 1;
	});
};

export function Kanban({
	fields,
	permissions,
	onCardClick,
	onAddCard,
	onAddField,
	onCardMove,
	onFieldMove,
}: KanbanProps) {
	const dragData = useKanbanDnD(onCardMove, onFieldMove);
	const sortedFields = sortFields(fields);

	const classes = ['kanban', dragData.value.isDragging ? 'kanban--dragging' : ''].filter(Boolean)
		.join(' ');

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
						<Button variant='secondary' onClick={onAddField} className='kanban__add-btn'>
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
						/* FIX: Removed cards={[]} to retain the original cards and header count */
						? <KanbanField {...dragData.value.fieldData!} />
						: <KanbanCard {...dragData.value.cardData!} fieldId='' />}
				</div>
			)}
		</div>
	);
}
