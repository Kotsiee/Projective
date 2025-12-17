import type { Key } from './types.ts';

export type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'component';

export interface ColumnDef<T> {
	id: string;
	field: keyof T | ((item: T) => unknown);
	label: string;
	width?: number; // Initial width
	minWidth?: number;
	maxWidth?: number;
	resizable?: boolean;
	sortable?: boolean;
	align?: 'left' | 'center' | 'right';
	// Future: pinned: 'left' | 'right'
}

export interface ColumnState {
	width: number;
	isResizing: boolean;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface TableState {
	columns: Map<string, ColumnState>;
	sort: { columnId: string | null; direction: SortDirection };
}

/**
 * Calculates generic string value for cell content
 */
export function getCellValue<T>(item: T, column: ColumnDef<T>): string {
	if (typeof column.field === 'function') {
		return String(column.field(item));
	}
	return String(item[column.field]);
}

/**
 * Initializer for column state
 */
export function initTableState<T>(defs: ColumnDef<T>[]): TableState {
	const columns = new Map<string, ColumnState>();
	defs.forEach((def) => {
		columns.set(def.id, {
			width: def.width ?? 150, // Default 150px
			isResizing: false,
		});
	});
	return {
		columns,
		sort: { columnId: null, direction: null },
	};
}
