import type { DateTime } from '@projective/types';

export interface KanbanTag {
	id: string;
	label: string;
	// deno-lint-ignore no-explicit-any
	icon?: any; // e.g., Preact component or string emoji
	color?: string; // CSS color variable or hex
	variant?: 'solid' | 'ghost' | 'text';
}

/** Priority/workload pill shown in the card footer (Low / Medium / High in the wireframes). */
export interface KanbanPriority {
	label: string;
	/** Drives the pill colour ramp; `none` renders a neutral pill. */
	level: 'low' | 'medium' | 'high' | 'none';
}

export interface KanbanCardProps {
	id: string;
	/** Human-facing short reference rendered in the card header (e.g. "#044"). */
	displayId?: string;
	title: string;
	description?: string;
	meta?: string; // e.g., "Created: 4 Hours ago • Due: 30th July"
	tags?: KanbanTag[];
	/** Priority/workload pill (Low/Medium/High) shown on the left of the footer. */
	priority?: KanbanPriority;
	/** Attachment count — renders a paperclip + number in the footer when > 0. */
	attachmentCount?: number;
	/** Short due/created label rendered with a calendar glyph in the footer (e.g. "Jul 9"). */
	dateLabel?: string;
	takenBy?: {
		name: string;
		avatarUrl?: string;
	};
	order: number;
	created: DateTime;
	/** Last-updated timestamp — used to auto-order non-backlog columns by recency. */
	updated?: DateTime;
	/**
	 * When present, the card is rendered with a striped "frozen" overlay and a live countdown to
	 * `until`. Drives the workload-dispute state (spec §4): the card sits in the New column awaiting
	 * a client response, and both parties take penalties if the window lapses.
	 */
	frozen?: {
		/** ISO timestamp the countdown ticks down to (e.g. the 48h workload-report window). */
		until: string;
		/** Overlay copy; defaults to the standard "Client must respond…" warning. */
		message?: string;
	};
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
	/**
	 * How this column's cards are ordered, surfaced as a header hint (spec §1):
	 *   • 'manual'  — the New/backlog column, drag-reorderable → shows "drag to reorder".
	 *   • 'recency' — Claimed / In Progress / Review, auto-sorted → shows "by update".
	 */
	sortMode?: 'manual' | 'recency';
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
