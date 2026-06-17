// #region IMPORTS
import type { DateTime } from '@projective/types';
// #endregion

// #region INTERFACES
export interface KanbanCardProps {
	id: string;
	title: string;
	description: string;
	tags?: string[];
	attachments?: number;
	created: DateTime | string | Date;
	createdBy?: string;
	updated?: DateTime | string | Date;
	updatedBy?: string;
	status?: string;
	takenBy?: string;
	order: number;
	permissions?: {
		canEdit?: boolean;
		canDelete?: boolean;
		canReorder?: boolean; // Defaults to false
	};
}

export interface KanbanFieldProps {
	id: string;
	title: string;
	description?: string;
	color?: string;
	cards: KanbanCardProps[];
	limit?: number;
	order: number;
	addCardLabel?: string; // Custom label per field
	permissions?: {
		canAddCard?: boolean; // Defaults to false
		canEdit?: boolean;
		canDelete?: boolean;
		canReorder?: boolean; // Defaults to false
	};
}

export interface KanbanProps {
	fields: KanbanFieldProps[];
	mode?: 'window' | 'container'; // Defaults to 'container'
	permissions?: {
		canAddField?: boolean; // Defaults to false
	};
	onCardClick?: (card: KanbanCardProps) => void;
	onFieldClick?: (field: KanbanFieldProps) => void;
	onAddCard?: (fieldId: string) => void;
	onAddField?: () => void;
	onCardMove?: (
		cardId: string,
		sourceFieldId: string,
		targetFieldId: string,
		insertBeforeCardId: string | null,
	) => void;
	onFieldMove?: (sourceFieldId: string, targetFieldId: string, insertBefore: boolean) => void;
}

export interface DragData {
	isDragging: boolean;
	type: 'field' | 'card' | null;
	id: string | null;
	sourceFieldId: string | null;
	clientX: number;
	clientY: number;
	offsetX: number;
	offsetY: number;
	width: number;
	height: number;
	targetFieldId: string | null;
	targetCardId: string | null;
	insertPosition: 'before' | 'after' | null;
	fieldData?: KanbanFieldProps;
	cardData?: KanbanCardProps;
}

export const INITIAL_DRAG_DATA: DragData = {
	isDragging: false,
	type: null,
	id: null,
	sourceFieldId: null,
	clientX: 0,
	clientY: 0,
	offsetX: 0,
	offsetY: 0,
	width: 0,
	height: 0,
	targetFieldId: null,
	targetCardId: null,
	insertPosition: null,
};
// #endregion
