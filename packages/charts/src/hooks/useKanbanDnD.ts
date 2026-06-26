import { useEffect } from 'preact/hooks';
import { signal } from '@preact/signals';
import { DragData, INITIAL_DRAG_DATA, KanbanCardProps, KanbanFieldProps } from '../types/kanban.ts';

export const dragData = signal<DragData>(INITIAL_DRAG_DATA);

export function useDraggable(
	type: 'card' | 'field',
	// deno-lint-ignore no-explicit-any
	data: any,
	sourceId: string,
	isLocked: boolean,
) {
	const onPointerDown = (e: PointerEvent) => {
		if (isLocked) return;
		if ((e.target as HTMLElement).closest('button')) return;

		const el = e.currentTarget as HTMLElement;
		const rect = el.getBoundingClientRect();
		const startX = e.clientX;
		const startY = e.clientY;

		const handlePointerMove = (moveEvent: PointerEvent) => {
			const dx = Math.abs(moveEvent.clientX - startX);
			const dy = Math.abs(moveEvent.clientY - startY);

			// 5-pixel threshold to prevent click/drag conflict
			if (dx > 5 || dy > 5) {
				moveEvent.preventDefault();

				dragData.value = {
					...INITIAL_DRAG_DATA,
					isDragging: true,
					type,
					id: data.id,
					sourceFieldId: type === 'card' ? sourceId : null,
					clientX: moveEvent.clientX,
					clientY: moveEvent.clientY,
					offsetX: moveEvent.clientX - rect.left,
					offsetY: moveEvent.clientY - rect.top,
					width: rect.width,
					height: rect.height,
					...(type === 'card' ? { cardData: data } : { fieldData: data }),
				};

				cleanup();
			}
		};

		const handlePointerUp = () => {
			cleanup();
		};

		const cleanup = () => {
			globalThis.removeEventListener('pointermove', handlePointerMove);
			globalThis.removeEventListener('pointerup', handlePointerUp);
		};

		globalThis.addEventListener('pointermove', handlePointerMove, { passive: false });
		globalThis.addEventListener('pointerup', handlePointerUp);
	};

	return {
		onPointerDown,
		'data-reorderable': !isLocked,
	};
}

export function useDropzone(type: 'card' | 'field', id: string) {
	return {
		[`data-kanban-${type}-id`]: id,
	};
}

export function useKanbanDnD(
	onCardMove?: (
		cardId: string,
		sourceFieldId: string,
		targetFieldId: string,
		insertBeforeId: string | null,
	) => void,
	onFieldMove?: (sourceFieldId: string, targetFieldId: string, insertBefore: boolean) => void,
) {
	useEffect(() => {
		const handlePointerMove = (e: PointerEvent) => {
			if (!dragData.value.isDragging) return;
			e.preventDefault();

			const targetEl = document.elementFromPoint(e.clientX, e.clientY);
			let targetFieldId = dragData.value.targetFieldId;
			let targetCardId = dragData.value.targetCardId;
			let insertPosition = dragData.value.insertPosition;

			if (dragData.value.type === 'card') {
				const fieldEl = targetEl?.closest('[data-kanban-field-id]');

				if (fieldEl) {
					targetFieldId = fieldEl.getAttribute('data-kanban-field-id');

					// Geometric calculation: Query all cards in the column and compare their Y-axis
					const cardElements = Array.from(fieldEl.querySelectorAll('[data-kanban-card-id]'));

					// Ignore the original card we are holding
					const validCards = cardElements.filter((el) =>
						el.getAttribute('data-kanban-card-id') !== dragData.value.id
					);

					if (validCards.length === 0) {
						// Column is empty or only has the ghost
						targetCardId = null;
						insertPosition = 'after';
					} else {
						let found = false;
						for (const cardEl of validCards) {
							const rect = cardEl.getBoundingClientRect();
							// If mouse Y is above the physical center of this card, insert before it
							if (e.clientY < rect.top + rect.height / 2) {
								targetCardId = cardEl.getAttribute('data-kanban-card-id');
								insertPosition = 'before';
								found = true;
								break;
							}
						}
						// If no card center was found below the mouse, snap to the very bottom
						if (!found) {
							const lastCard = validCards[validCards.length - 1];
							targetCardId = lastCard.getAttribute('data-kanban-card-id');
							insertPosition = 'after';
						}
					}
				}
			} else if (dragData.value.type === 'field') {
				const trackEl = targetEl?.closest('.kanban__track');
				if (trackEl) {
					// Geometric calculation for horizontal field movement
					const fieldElements = Array.from(
						trackEl.querySelectorAll('[data-kanban-field-wrapper-id]'),
					);
					const validFields = fieldElements.filter((el) =>
						el.getAttribute('data-kanban-field-wrapper-id') !== dragData.value.id
					);

					let found = false;
					for (const fEl of validFields) {
						const rect = fEl.getBoundingClientRect();
						if (e.clientX < rect.left + rect.width / 2) {
							targetFieldId = fEl.getAttribute('data-kanban-field-wrapper-id');
							insertPosition = 'before';
							found = true;
							break;
						}
					}
					if (!found && validFields.length > 0) {
						targetFieldId = validFields[validFields.length - 1].getAttribute(
							'data-kanban-field-wrapper-id',
						);
						insertPosition = 'after';
					}
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
				// Allow dropping in the same field to allow reordering
				onCardMove?.(id, sourceFieldId, targetFieldId, insertBeforeId);
			} else if (type === 'field' && id && targetFieldId && id !== targetFieldId) {
				onFieldMove?.(id, targetFieldId, insertPosition === 'before');
			}

			dragData.value = INITIAL_DRAG_DATA;
		};

		if (dragData.value.isDragging) {
			globalThis.addEventListener('pointermove', handlePointerMove, { passive: false });
			globalThis.addEventListener('pointerup', handlePointerUp);
		}

		return () => {
			globalThis.removeEventListener('pointermove', handlePointerMove);
			globalThis.removeEventListener('pointerup', handlePointerUp);
		};
	}, [dragData.value.isDragging, onCardMove, onFieldMove]);

	return dragData;
}
