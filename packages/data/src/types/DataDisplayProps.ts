import type { CSSProperties, VNode } from 'preact';
import type { DataSource } from '../core/datasource.ts';
import type { ColumnDef } from '../core/table.ts';

export type DisplayMode = 'list' | 'grid' | 'table';
export type ScrollMode = 'container' | 'window';

export interface DataDisplayProps<TOut, TIn = unknown> {
	/**
	 * The source of data. Can be a remote DataSource or a local array.
	 */
	dataSource: DataSource<TOut, TIn> | TOut[];

	/**
	 * Render function for individual items.
	 */
	renderItem: (item: TOut, index: number) => VNode;

	/**
	 * Render function for loading skeletons (optional).
	 */
	renderSkeleton?: (index: number) => VNode;

	/**
	 * Layout mode: 'list', 'grid', or 'table'.
	 * Default: 'list'
	 */
	mode?: DisplayMode;

	/**
	 * Scrolling behavior.
	 * 'container': The component has its own scrollbar (overflow: auto).
	 * 'window': The component grows to fit content; the window/body scrolls.
	 * Default: 'container'
	 */
	scrollMode?: ScrollMode;

	/**
	 * If true, scrolls to the bottom of the list on initial load.
	 * Useful for chat interfaces.
	 */
	scrollToBottom?: boolean;

	/**
	 * Number of columns for 'grid' mode.
	 * Default: 3
	 */
	gridColumns?: number;

	/**
	 * Column definitions for 'table' mode.
	 */
	columns?: ColumnDef<TOut>[];

	/**
	 * Approximate height of a row in pixels. Used for virtualizer calculations.
	 * Default: 50
	 */
	estimateHeight?: number;

	/**
	 * Number of items to fetch per page/batch.
	 * Default: 50
	 */
	pageSize?: number;

	/**
	 * Selection behavior.
	 * Default: 'single'
	 */
	selectionMode?: 'none' | 'single' | 'multi';

	/**
	 * Callback fired when selection changes.
	 */
	onSelectionChange?: (keys: Set<string>) => void;

	/**
	 * Additional CSS class names.
	 */
	className?: string;

	/**
	 * Inline styles.
	 */
	style?: CSSProperties;

	/**
	 * If true, enables hover states and interactive styling on rows.
	 */
	interactive?: boolean;
}
