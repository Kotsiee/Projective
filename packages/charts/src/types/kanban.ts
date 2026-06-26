import type { DateTime } from '@projective/types';

export interface KanbanTag {
	id: string;
	label: string;
	icon?: any; // e.g., Preact component or string emoji
	color?: string; // CSS color variable or hex
	variant?: 'solid' | 'ghost' | 'text';
}

export interface KanbanCardProps {
	id: string;
	title: string;
	description?: string;
	meta?: string; // e.g., "Created: 4 Hours ago • Due: 30th July"
	tags?: KanbanTag[];
	takenBy?: {
		name: string;
		avatarUrl?: string;
	};
	order: number;
	permissions?: {
		canEdit?: boolean;
		canDelete?: boolean;
		canReorder?: boolean;
	};
}

export interface KanbanFieldProps {
	id: string;
	title: string;
	description?: string;
	color?: 'primary' | 'secondary' | string; // Supports presets or custom hex/rgb
	cards: KanbanCardProps[];
	limit?: number;
	order: number;
	addCardLabel?: string;
	permissions?: {
		canAddCard?: boolean;
		canEdit?: boolean;
		canDelete?: boolean;
		canReorder?: boolean; // Acts as our lock
	};
}

export interface KanbanProps {
	fields: KanbanFieldProps[];
	minHeight?: string;
	permissions?: {
		canAddField?: boolean;
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
