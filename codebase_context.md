# Selected Codebase Context

> Included paths: ./packages/data

## Project Tree (Selected)

```text
./packages/data/
  data/
  deno.json
  mod.ts
  src/
  components/
  DataDisplay.tsx
  displays/
  Grid.tsx
  List.tsx
  internal/
  Row.tsx
  ScrollPane.tsx
  table/
  Header.tsx
  Table.tsx
  TableRow.tsx
  core/
  dataset.ts
  datasource.ts
  index.ts
  loading.ts
  normalization.ts
  restdatasource.ts
  table.ts
  types.ts
  virtualizer.ts
  hooks/
  useDataManager.ts
  useSelection.ts
  useVirtual.ts
  styles/
  base.css
  components/
  grid.css
  list.css
  table.css
  skeleton.css
  theme.css
  types/
```

## File Contents

### File: packages\data\deno.json

```json
{
  "name": "@projective/data",
  "version": "0.0.0",
  "exports": "./mod.ts",
  "tasks": {
    "check": "deno fmt --check && deno lint && deno check main.ts",
    "dev": "vite --port 3000 --open --host --mode development",
    "build": "vite build --mode production",
    "start": "deno serve -A --watch --port 3000 --env-file=../../.env main.ts",
    "update": "deno run -A -r jsr:@fresh/update ."
  },
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "preact"
  }
}

```

### File: packages\data\mod.ts

```ts
// Models & Types
export * from './src/core/index.ts';

// Components
export * from './src/components/DataDisplay.tsx';

// Hooks (exposed for advanced custom renderers)
export { useVirtual } from './src/hooks/useVirtual.ts';
export { useDataManager } from './src/hooks/useDataManager.ts';
export { useSelection } from './src/hooks/useSelection.ts';

```

### File: packages\data\src\components\DataDisplay.tsx

```tsx
import { useMemo, useState } from 'preact/hooks';
import type { JSX } from 'preact';

// CSS Imports
import '../styles/theme.css';
import '../styles/base.css';
// import "../../styles/skeleton.css";

import { createEmptyDataset, type Dataset, type NormalizedItem } from '../core/dataset.ts';
import type { DataSource } from '../core/datasource.ts';
import { type ColumnDef, getCellValue, initTableState, type TableState } from '../core/table.ts';

import { useVirtual } from '../hooks/useVirtual.ts';
import { useDataManager } from '../hooks/useDataManager.ts';
import { useSelection } from '../hooks/useSelection.ts';

import { ScrollPane } from './ScrollPane.tsx';
import { List } from './displays/List.tsx';
import { Grid } from './displays/Grid.tsx';
import { Table } from './table/Table.tsx';

export type DisplayMode = 'list' | 'grid' | 'table';

interface DataDisplayProps<TOut, TIn = unknown> {
	dataSource: DataSource<TOut, TIn> | TOut[];
	renderItem: (item: TOut, index: number) => preact.VNode;
	renderSkeleton?: (index: number) => preact.VNode;
	mode?: DisplayMode;
	gridColumns?: number;
	columns?: ColumnDef<TOut>[];
	estimateHeight?: number;
	pageSize?: number;
	selectionMode?: 'none' | 'single' | 'multi';
	onSelectionChange?: (keys: Set<string>) => void;
	className?: string;
	style?: JSX.CSSProperties;
}

function sortLocalData<T>(
	dataset: Dataset<T>,
	colId: string,
	dir: 'asc' | 'desc',
	columns?: ColumnDef<T>[],
) {
	const colDef = columns?.find((c) => c.id === colId);
	if (!colDef) return dataset.order;

	return [...dataset.order].sort((keyA, keyB) => {
		const itemA = dataset.items.get(keyA)?.data;
		const itemB = dataset.items.get(keyB)?.data;
		if (!itemA || !itemB) return 0;

		const valA = getCellValue(itemA, colDef);
		const valB = getCellValue(itemB, colDef);

		if (valA < valB) return dir === 'asc' ? -1 : 1;
		if (valA > valB) return dir === 'asc' ? 1 : -1;
		return 0;
	});
}

export function DataDisplay<TOut, TIn>({
	dataSource,
	renderItem,
	mode = 'list',
	gridColumns = 3,
	columns,
	estimateHeight = 50,
	pageSize = 50,
	selectionMode = 'single',
	onSelectionChange,
	className,
	style,
}: DataDisplayProps<TOut, TIn>) {
	const [dataset, setDataset] = useState<Dataset<TOut>>(() => {
		if (Array.isArray(dataSource)) {
			const items = new Map<string, NormalizedItem<TOut>>();
			const order: string[] = [];
			dataSource.forEach((d, i) => {
				const key = String(i);
				items.set(key, { key, data: d, selected: false, isSkeleton: false });
				order.push(key);
			});
			return { items, order, totalCount: dataSource.length, pendingRanges: [] };
		}
		return createEmptyDataset<TOut>();
	});

	const { handleItemClick } = useSelection({
		dataset,
		setDataset,
		selectionMode,
		onSelectionChange,
	});

	const [tableState, setTableState] = useState<TableState>(() => initTableState(columns || []));

	const activeOrder = useMemo(() => {
		const { columnId, direction } = tableState.sort;
		if (Array.isArray(dataSource) && columnId && direction) {
			return sortLocalData(dataset, columnId, direction, columns);
		}
		return dataset.order;
	}, [dataset, tableState.sort, dataSource, columns]);

	const totalCount = Array.isArray(dataSource)
		? activeOrder.length
		: (dataset.totalCount ?? activeOrder.length + 100);

	const virtualRowCount = mode === 'grid' ? Math.ceil(totalCount / gridColumns) : totalCount;

	const { parentRef, virtualizer, getItems, getTotalSize } = useVirtual({
		count: virtualRowCount,
		estimateSize: () => estimateHeight,
		overscan: 5,
	});

	const virtualItems = getItems();

	const visibleRange = useMemo(() => {
		if (virtualItems.length === 0) return { start: 0, end: 0 };
		const startRow = virtualItems[0].index;
		const endRow = virtualItems[virtualItems.length - 1].index;

		if (mode === 'grid') {
			return { start: startRow * gridColumns, end: (endRow + 1) * gridColumns - 1 };
		}
		return { start: startRow, end: endRow };
	}, [virtualItems, mode, gridColumns]);

	const { isFetching } = useDataManager({
		dataset,
		setDataset,
		dataSource: Array.isArray(dataSource) ? null : dataSource,
		visibleRange,
		pageSize,
	});

	const safeRenderItem = (item: TOut, index: number) => renderItem(item, index);

	return (
		<div
			className={`data-display ${className ?? ''}`}
			style={style}
		>
			{isFetching && (
				<div className='data-display__loader'>
					Loading...
				</div>
			)}

			<ScrollPane ref={parentRef} className='data-display__scroll-pane'>
				<div
					style={{
						height: `${getTotalSize()}px`,
						width: '100%',
						position: 'relative',
						minWidth: mode === 'table' ? 'fit-content' : '100%',
					}}
				>
					{mode === 'list' && (
						<List
							dataset={{ ...dataset, order: activeOrder }}
							virtualItems={virtualItems}
							virtualizer={virtualizer}
							renderItem={safeRenderItem}
							onItemClick={handleItemClick}
						/>
					)}

					{mode === 'grid' && (
						<Grid
							dataset={{ ...dataset, order: activeOrder }}
							virtualItems={virtualItems}
							virtualizer={virtualizer}
							renderItem={safeRenderItem}
							columnCount={gridColumns}
							onItemClick={handleItemClick}
						/>
					)}

					{mode === 'table' && columns && (
						<Table
							dataset={{ ...dataset, order: activeOrder }}
							virtualItems={virtualItems}
							virtualizer={virtualizer}
							columns={columns}
							state={tableState}
							onSort={(colId) => {
								setTableState((prev) => {
									const dir = prev.sort.columnId === colId && prev.sort.direction === 'asc'
										? 'desc'
										: 'asc';
									return { ...prev, sort: { columnId: colId, direction: dir } };
								});
							}}
							onResize={(colId, width) => {
								setTableState((prev) => {
									const next = new Map(prev.columns);
									next.set(colId, { width, isResizing: false });
									return { ...prev, columns: next };
								});
							}}
							onRowClick={handleItemClick}
						/>
					)}
				</div>
			</ScrollPane>
		</div>
	);
}

```

### File: packages\data\src\components\displays\Grid.tsx

```tsx
import '../../styles/components/grid.css';
import type { Dataset, NormalizedItem } from '../../core/dataset.ts';
import type { VirtualItem, Virtualizer } from '../../core/virtualizer.ts';
import { Row } from '../internal/Row.tsx';

interface GridProps<T> {
	dataset: Dataset<T>;
	virtualItems: VirtualItem[];
	virtualizer: Virtualizer;
	renderItem: (item: T, index: number) => preact.VNode;
	columnCount: number;
	onItemClick?: (key: string, e: MouseEvent) => void;
}

export function Grid<T>({
	dataset,
	virtualItems,
	virtualizer,
	renderItem,
	columnCount,
	onItemClick,
}: GridProps<T>) {
	const itemWidth = `${100 / columnCount}%`;

	return (
		<>
			{virtualItems.map((virtualRow) => {
				const startItemIndex = virtualRow.index * columnCount;
				const rowItems: NormalizedItem<T>[] = [];

				for (let i = 0; i < columnCount; i++) {
					const itemKey = dataset.order[startItemIndex + i];
					if (itemKey) {
						const item = dataset.items.get(itemKey);
						if (item) rowItems.push(item);
					}
				}

				return (
					<Row
						key={`row-${virtualRow.index}`}
						virtualItem={virtualRow}
						virtualizer={virtualizer}
						className='data-grid__row'
					>
						<div style={{ display: 'flex', width: '100%', height: '100%' }}>
							{rowItems.map((item, colIndex) => (
								<div
									key={item.key}
									className='data-grid__cell'
									style={{ width: itemWidth }}
								>
									<div
										className={`data-grid__card ${
											onItemClick ? 'data-grid__card--interactive' : ''
										} ${item.selected ? 'data-grid__card--selected' : ''}`}
										onClick={(e) => onItemClick?.(item.key, e)}
									>
										{renderItem(item.data, startItemIndex + colIndex)}
									</div>
								</div>
							))}
						</div>
					</Row>
				);
			})}
		</>
	);
}

```

### File: packages\data\src\components\displays\List.tsx

```tsx
import '../../styles/components/list.css';
import type { Dataset } from '../../core/dataset.ts';
import type { VirtualItem, Virtualizer } from '../../core/virtualizer.ts';
import { Row } from '../internal/Row.tsx';

export interface ListProps<T> {
	dataset: Dataset<T>;
	virtualItems: VirtualItem[];
	virtualizer: Virtualizer;
	renderItem: (item: T, index: number) => preact.VNode;
	onItemClick?: (key: string, e: MouseEvent) => void;
}

export function List<T>({
	dataset,
	virtualItems,
	virtualizer,
	renderItem,
	onItemClick,
}: ListProps<T>) {
	return (
		<>
			{virtualItems.map((virtualRow) => {
				const key = dataset.order[virtualRow.index];
				const item = dataset.items.get(key);

				if (!item) return null;

				return (
					<Row
						key={key}
						virtualItem={virtualRow}
						virtualizer={virtualizer}
						className='data-list__row'
					>
						<div
							className={`data-list__item ${onItemClick ? 'data-list__item--interactive' : ''} ${
								item.selected ? 'data-list__item--selected' : ''
							}`}
							onClick={(e) => onItemClick?.(item.key, e)}
						>
							{renderItem(item.data, virtualRow.index)}
						</div>
					</Row>
				);
			})}
		</>
	);
}

```

### File: packages\data\src\components\internal\Row.tsx

```tsx
import { useEffect, useRef } from 'preact/hooks';
import type { VirtualItem, Virtualizer } from '../../core/virtualizer.ts';

interface RowProps {
	virtualItem: VirtualItem;
	virtualizer: Virtualizer;
	children: preact.ComponentChildren;
	className?: string;
}

export function Row({ virtualItem, virtualizer, children, className }: RowProps) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!ref.current) return;

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				// Report EXACT pixel height to the engine
				// entry.borderBoxSize[0].blockSize is more precise than offsetHeight
				const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
				virtualizer.measure(virtualItem.index, height);
			}
		});

		observer.observe(ref.current);
		return () => observer.disconnect();
	}, [virtualItem.index, virtualizer]);

	return (
		<div
			ref={ref}
			data-index={virtualItem.index}
			className={className}
			style={{
				position: 'absolute',
				top: 0,
				left: 0,
				width: '100%',
				transform: `translateY(${virtualItem.start}px)`,
				// We do NOT set height here (let content dictate it)
				// unless it's strictly fixed mode, but variable mode is safer default
			}}
		>
			{children}
		</div>
	);
}

```

### File: packages\data\src\components\ScrollPane.tsx

```tsx
import { forwardRef } from 'preact/compat';
import type { CSSProperties, HTMLAttributes, JSX, Signalish } from 'preact';

interface ScrollPaneProps extends HTMLAttributes<HTMLDivElement> {
	children: preact.ComponentChildren;
}

export const ScrollPane = forwardRef<HTMLDivElement, ScrollPaneProps>(
	({ children, style, className, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={`scroll-pane ${className ?? ''}`}
				style={{
					overflowY: 'auto',
					overflowX: 'hidden',
					position: 'relative',
					height: '100%', // Must fill parent to scroll
					width: '100%',
					contain: 'strict', // Browser optimization
					...style as Signalish<CSSProperties>,
				}}
				{...props}
			>
				{children}
			</div>
		);
	},
);

```

### File: packages\data\src\components\table\Header.tsx

```tsx
import { useState } from 'preact/hooks';
import type { ColumnDef, TableState } from '../../core/table.ts';
// CSS imported via Table.tsx parent, but classNames align with table.css

interface HeaderProps<T> {
	columns: ColumnDef<T>[];
	state: TableState;
	onSort: (colId: string) => void;
	onResize: (colId: string, newWidth: number) => void;
}

export function Header<T>({ columns, state, onSort, onResize }: HeaderProps<T>) {
	const handleMouseDown = (e: MouseEvent, colId: string, startWidth: number) => {
		e.preventDefault();
		const startX = e.pageX;

		const onMove = (moveEvent: MouseEvent) => {
			const delta = moveEvent.pageX - startX;
			const newWidth = Math.max(50, startWidth + delta);
			onResize(colId, newWidth);
		};

		const onUp = () => {
			document.removeEventListener('mousemove', onMove);
			document.removeEventListener('mouseup', onUp);
		};

		document.addEventListener('mousemove', onMove);
		document.addEventListener('mouseup', onUp);
	};

	return (
		<div className='data-table__header' role='row'>
			{columns.map((col) => {
				const colState = state.columns.get(col.id);
				const width = colState?.width ?? 150;
				const sortDir = state.sort.columnId === col.id ? state.sort.direction : null;

				return (
					<div
						key={col.id}
						role='columnheader'
						aria-sort={sortDir === 'asc' ? 'ascending' : sortDir === 'desc' ? 'descending' : 'none'}
						className={`data-table__header-cell ${
							col.sortable ? 'data-table__header-cell--sortable' : ''
						}`}
						style={{
							width: `${width}px`,
							minWidth: `${width}px`,
							justifyContent: col.align === 'right'
								? 'flex-end'
								: col.align === 'center'
								? 'center'
								: 'flex-start',
						}}
						onClick={() => col.sortable && onSort(col.id)}
					>
						{col.label}
						{sortDir && (
							<span className='data-table__sort-icon'>{sortDir === 'asc' ? '▲' : '▼'}</span>
						)}

						{col.resizable !== false && (
							<div
								className={`data-table__resizer ${
									colState?.isResizing ? 'data-table__resizer--active' : ''
								}`}
								onClick={(e) => e.stopPropagation()}
								onMouseDown={(e) => handleMouseDown(e, col.id, width)}
							/>
						)}
					</div>
				);
			})}
		</div>
	);
}

```

### File: packages\data\src\components\table\Table.tsx

```tsx
import '../../styles/components/table.css';
import type { Dataset } from '../../core/dataset.ts';
import type { VirtualItem, Virtualizer } from '../../core/virtualizer.ts';
import { type ColumnDef, type TableState } from '../../core/table.ts';
import { Header } from './Header.tsx';
import { TableRow } from './TableRow.tsx';

export interface TableProps<T> {
	dataset: Dataset<T>;
	virtualItems: VirtualItem[];
	virtualizer: Virtualizer;
	columns: ColumnDef<T>[];
	state: TableState;
	onSort: (colId: string) => void;
	onResize: (colId: string, newWidth: number) => void;
	onRowClick?: (key: string, e: MouseEvent) => void;
}

export function Table<T>({
	dataset,
	virtualItems,
	virtualizer,
	columns,
	state,
	onSort,
	onResize,
	onRowClick,
}: TableProps<T>) {
	return (
		<div className='data-table' role='grid'>
			<Header
				columns={columns}
				state={state}
				onSort={onSort}
				onResize={onResize}
			/>

			<div role='rowgroup' style={{ position: 'relative' }}>
				{virtualItems.map((virtualRow) => {
					const key = dataset.order[virtualRow.index];
					const item = dataset.items.get(key);

					return (
						<TableRow
							key={key}
							virtualRow={virtualRow}
							item={item}
							columns={columns}
							state={state}
							virtualizer={virtualizer}
							onRowClick={onRowClick}
						/>
					);
				})}
			</div>
		</div>
	);
}

```

### File: packages\data\src\components\table\TableRow.tsx

```tsx
import '../../styles/skeleton.css';
import type { NormalizedItem } from '../../core/dataset.ts';
import { type ColumnDef, getCellValue, type TableState } from '../../core/table.ts';
import { Row } from '../internal/Row.tsx';
import type { VirtualItem, Virtualizer } from '../../core/virtualizer.ts';

interface TableRowProps<T> {
	virtualRow: VirtualItem;
	item: NormalizedItem<T> | undefined;
	columns: ColumnDef<T>[];
	state: TableState;
	virtualizer: Virtualizer;
	onRowClick?: (key: string, e: MouseEvent) => void;
}

export function TableRow<T>({
	virtualRow,
	item,
	columns,
	state,
	virtualizer,
	onRowClick,
}: TableRowProps<T>) {
	if (!item || item.isSkeleton) {
		return (
			<Row
				virtualItem={virtualRow}
				virtualizer={virtualizer}
				className='data-table__row data-table__row--skeleton data-skeleton'
			>
				<div style={{ display: 'flex', height: '100%', width: '100%' }}>
					{columns.map((col) => {
						const width = state.columns.get(col.id)?.width ?? 150;
						return (
							<div key={col.id} className='data-table__cell' style={{ width: `${width}px` }}>
								<div className='data-skeleton__text' style={{ width: '80%' }} />
							</div>
						);
					})}
				</div>
			</Row>
		);
	}

	return (
		<Row
			virtualItem={virtualRow}
			virtualizer={virtualizer}
			className={`data-table__row ${onRowClick ? 'data-table__row--interactive' : ''} ${
				item.selected ? 'data-table__row--selected' : ''
			}`}
		>
			<div
				role='row'
				aria-selected={item.selected}
				onClick={(e) => onRowClick?.(item.key, e)}
				style={{ display: 'flex', height: '100%', minWidth: 'fit-content' }}
			>
				{columns.map((col) => {
					const width = state.columns.get(col.id)?.width ?? 150;
					return (
						<div
							key={col.id}
							role='gridcell'
							className='data-table__cell'
							style={{
								width: `${width}px`,
								minWidth: `${width}px`,
								textAlign: col.align ?? 'left',
							}}
						>
							{getCellValue(item.data, col)}
						</div>
					);
				})}
			</div>
		</Row>
	);
}

```

### File: packages\data\src\core\dataset.ts

```ts
import type { Key } from './types.ts';

/**
 * A single item wrapper that separates the raw data from UI state.
 */
export interface NormalizedItem<T> {
	/** Stable unique key (derived from DB ID or generated) */
	key: Key;
	/** The actual domain object (e.g., User, Project) */
	data: T;
	/** Is this item currently selected? */
	selected: boolean;
	/** Is this item effectively a placeholder/loading state? */
	isSkeleton: boolean;
	/** Layout hints for variable height calculations */
	layout?: {
		estimatedHeight?: number;
		measuredHeight?: number;
	};
}

/**
 * The state container representing the current view of the data.
 * This is "Snapshot" safe - replace the whole object to trigger UI updates.
 */
export interface Dataset<T> {
	/** Map of Key -> Item for O(1) lookups */
	items: Map<Key, NormalizedItem<T>>;

	/** Ordered list of keys currently visible/loaded in the specific sort order */
	order: Key[];

	/** Total count of items on the server (if known) */
	totalCount: number | null;

	/** Tracks loading states for specific ranges to prevent double-fetching */
	pendingRanges: Array<{ start: number; end: number }>;
}

/**
 * Factory to create an empty dataset.
 */
export function createEmptyDataset<T>(): Dataset<T> {
	return {
		items: new Map(),
		order: [],
		totalCount: null,
		pendingRanges: [],
	};
}

// Add this helper
export function createSkeletonItem<T>(index: number): NormalizedItem<T> {
	return {
		key: `skeleton-${index}`,
		data: {} as T, // Empty data for skeletons
		selected: false,
		isSkeleton: true,
		layout: { estimatedHeight: 50 }, // Default height
	};
}

```

### File: packages\data\src\core\datasource.ts

```ts
import type { FetchMeta, Mapper, Range } from './types.ts';

/**
 * Result of a fetch operation.
 */
export interface FetchResult<Tin> {
	items: Tin[];
	meta?: FetchMeta;
	error?: Error;
}

/**
 * Configuration for a data source.
 * TOut: The shape the UI expects.
 * TIn: The shape the API returns (optional, defaults to unknown).
 */
export interface DataSourceConfig<TOut, TIn = unknown> {
	/** Function to extract a unique ID from a raw item */
	keyExtractor: (item: TIn) => string | number;

	/** Optional mapper to transform API shape to UI shape */
	mapper?: Mapper<TIn, TOut>;
}

/**
 * Abstract base class for all data sources.
 */
export abstract class DataSource<TOut, TIn = unknown> {
	protected config: DataSourceConfig<TOut, TIn>;

	constructor(config: DataSourceConfig<TOut, TIn>) {
		this.config = config;
	}

	/**
	 * The primary method the Virtualizer calls when it hits a gap.
	 */
	abstract fetch(range: Range): Promise<FetchResult<TIn>>;

	/**
	 * Helper to normalize a raw result using the config.
	 */
	public normalize(rawItem: TIn): { key: string; data: TOut } {
		const rawKey = this.config.keyExtractor(rawItem);
		const key = String(rawKey);

		// If a mapper is provided, use it. Otherwise cast raw as TOut.
		const data = this.config.mapper ? this.config.mapper(rawItem) : (rawItem as unknown as TOut);

		return { key, data };
	}
}

```

### File: packages\data\src\core\index.ts

```ts
export * from './dataset.ts';
export * from './datasource.ts';
export * from './loading.ts';
export * from './normalization.ts';
export * from './table.ts';
export * from './types.ts';
export * from './virtualizer.ts';
export * from './restdatasource.ts';

```

### File: packages\data\src\core\loading.ts

```ts
import type { Range } from './types.ts';

/**
 * Merges overlapping or adjacent ranges to reduce API calls.
 * e.g., [100, 110] + [105, 120] -> [100, 120]
 */
export function mergeRanges(ranges: Range[]): Range[] {
	if (ranges.length === 0) return [];

	// Sort by start index
	const sorted = [...ranges].sort((a, b) => a.start - b.start);
	const merged: Range[] = [];

	let current = sorted[0];

	for (let i = 1; i < sorted.length; i++) {
		const next = sorted[i];

		// If overlaps or touches (next.start <= current.end + 1)
		if (next.start <= (current.start + current.length)) {
			// Extend current
			const newEnd = Math.max(
				current.start + current.length,
				next.start + next.length,
			);
			current.length = newEnd - current.start;
		} else {
			merged.push(current);
			current = next;
		}
	}
	merged.push(current);

	return merged;
}

/**
 * Calculates what is missing from the dataset.
 */
export function findGaps(
	neededStart: number,
	neededEnd: number,
	loadedOrder: Array<string | undefined>,
): Range[] {
	const gaps: Range[] = [];
	let currentStart = -1;

	for (let i = neededStart; i <= neededEnd; i++) {
		const isLoaded = loadedOrder[i] !== undefined;

		if (!isLoaded) {
			if (currentStart === -1) currentStart = i;
		} else {
			if (currentStart !== -1) {
				gaps.push({ start: currentStart, length: i - currentStart });
				currentStart = -1;
			}
		}
	}

	// Close final gap
	if (currentStart !== -1) {
		gaps.push({ start: currentStart, length: neededEnd - currentStart + 1 });
	}

	return gaps;
}

```

### File: packages\data\src\core\normalization.ts

```ts
import type { Dataset, NormalizedItem } from './dataset.ts';
import type { DataSource } from './datasource.ts';

/**
 * Merges new items into an existing dataset.
 * Handles deduplication and preserves selection state if keys match.
 */
export function mergeItems<TOut, TIn>(
	currentDataset: Dataset<TOut>,
	newRawItems: TIn[],
	offset: number,
	source: DataSource<TOut, TIn>,
): Dataset<TOut> {
	// 1. Clone the current state (shallow copy for immutability)
	const nextItems = new Map(currentDataset.items);
	const nextOrder = [...currentDataset.order];

	// 2. Process new items
	newRawItems.forEach((raw, index) => {
		const { key, data } = source.normalize(raw);
		const absoluteIndex = offset + index;

		// Check if we already have this item (to preserve local state like selection)
		const existing = nextItems.get(key);

		const newItem: NormalizedItem<TOut> = {
			key,
			data,
			selected: existing ? existing.selected : false, // Preserve selection
			isSkeleton: false,
			layout: existing?.layout, // Preserve measured heights
		};

		nextItems.set(key, newItem);

		// Ensure the order array is big enough
		if (absoluteIndex >= nextOrder.length) {
			nextOrder.length = absoluteIndex + 1;
		}
		nextOrder[absoluteIndex] = key;
	});

	// 3. Return new immutable dataset
	return {
		...currentDataset,
		items: nextItems,
		order: nextOrder,
	};
}

```

### File: packages\data\src\core\restdatasource.ts

```ts
import { DataSource, type DataSourceConfig, type FetchResult } from './datasource.ts';
import type { Range } from './types.ts';

interface RestDataSourceConfig<TOut, TIn> extends DataSourceConfig<TOut, TIn> {
	url: string;
	defaultParams?: Record<string, string>;
}

export class RestDataSource<TOut, TIn extends { total_count?: number }>
	extends DataSource<TOut, TIn> {
	declare protected config: RestDataSourceConfig<TOut, TIn>;

	constructor(config: RestDataSourceConfig<TOut, TIn>) {
		super(config);
	}

	public async fetch(range: Range): Promise<FetchResult<TIn>> {
		const params = new URLSearchParams(this.config.defaultParams);
		params.set('offset', String(range.start));
		params.set('limit', String(range.length));

		try {
			const response = await fetch(`${this.config.url}?${params.toString()}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP Error: ${response.statusText}`);
			}

			const items: TIn[] = await response.json();

			const totalCount = items.length > 0 ? items[0].total_count : undefined;

			return {
				items,
				meta: {
					totalCount,
				},
			};
		} catch (error) {
			console.error('Data Fetch Error:', error);
			return { items: [], error: error as Error };
		}
	}

	public withParams(newParams: Record<string, string>): RestDataSource<TOut, TIn> {
		return new RestDataSource({
			...this.config,
			defaultParams: { ...this.config.defaultParams, ...newParams },
		});
	}
}

```

### File: packages\data\src\core\table.ts

```ts
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

```

### File: packages\data\src\core\types.ts

```ts
/**
 * A stable unique identifier for an item.
 * Internally, we always convert this to a string for Map lookups.
 */
export type Key = string;

/**
 * Generic range request (index-based).
 */
export interface Range {
	start: number;
	length: number;
}

/**
 * A function that transforms raw backend data (Tin) into the target UI shape (Tout).
 */
export type Mapper<Tin = unknown, Tout = unknown> = (raw: Tin) => Tout;

/**
 * Metadata accompanying a fetch response.
 */
export interface FetchMeta {
	totalCount?: number;
	hasMoreForward?: boolean;
	hasMoreBackward?: boolean;
	cursor?: string;
}

```

### File: packages\data\src\core\virtualizer.ts

```ts
import type { Range } from './types.ts';

export interface VirtualItem {
	index: number;
	start: number; // Pixel offset from top
	size: number; // Pixel height
	end: number; // start + size
	measured: boolean;
}

export interface VirtualizerOptions {
	count: number;
	/** Estimated height for unmeasured items */
	estimateSize: (index: number) => number;
	/** Number of extra items to render outside viewport (prevents white flashes) */
	overscan?: number;
	/** Optional fixed height optimization. If set, ignores measurements. */
	fixedItemHeight?: number;
}

export class Virtualizer {
	private measurements = new Map<number, number>();
	private lastMeasuredIndex = -1;
	private options: VirtualizerOptions;

	// Cache the last computed total size to avoid frequent expensive loops
	private _totalSizeCache: number | null = null;

	constructor(options: VirtualizerOptions) {
		this.options = { overscan: 1, ...options };
	}

	/**
	 * Update configuration (e.g., when item count changes)
	 */
	public setOptions(newOptions: Partial<VirtualizerOptions>) {
		this.options = { ...this.options, ...newOptions };
		this._totalSizeCache = null; // Invalidate size cache
	}

	/**
	 * The UI calls this when a DOM node is rendered and we know its real height.
	 */
	public measure(index: number, size: number) {
		const prev = this.measurements.get(index);
		if (prev !== size) {
			this.measurements.set(index, size);
			this._totalSizeCache = null; // Size changed, invalidate total
			this.lastMeasuredIndex = Math.max(this.lastMeasuredIndex, index);
		}
	}

	/**
	 * Calculates the total height of the scrollable content.
	 */
	public getTotalSize(): number {
		// Optimization: Return exact math for fixed height
		if (this.options.fixedItemHeight) {
			return this.options.count * this.options.fixedItemHeight;
		}

		if (this._totalSizeCache !== null) {
			return this._totalSizeCache;
		}

		// Sum known measurements + estimate remaining
		// Note: In a production 1M item list, we'd use a Prefix Sum Tree for O(log N) lookups.
		// For this MVP, we use a simpler approximation:
		// (Sum of measured) + (Count of unmeasured * Estimate)

		let measuredHeight = 0;
		for (const [_, size] of this.measurements) {
			measuredHeight += size;
		}

		const unmeasuredCount = this.options.count - this.measurements.size;
		const total = measuredHeight + (unmeasuredCount * this.options.estimateSize(0));

		this._totalSizeCache = total;
		return total;
	}

	/**
	 * The core engine. Returns exactly which items should be in the DOM.
	 */
	public getVirtualItems(
		scrollTop: number,
		viewportHeight: number,
	): VirtualItem[] {
		const { count, overscan = 1, fixedItemHeight } = this.options;

		if (count === 0) return [];

		// 1. Find Start Index
		let startIndex = 0;
		let startOffset = 0;

		if (fixedItemHeight) {
			// O(1) Lookup for fixed height
			startIndex = Math.floor(scrollTop / fixedItemHeight);
			startOffset = startIndex * fixedItemHeight;
		} else {
			// O(N) Scan for variable height (Simple version)
			// *Optimization Note*: For 1M items, replacing this linear scan
			// with a Binary Search over a cached offset array is Phase 4 work.
			let currentOffset = 0;
			for (let i = 0; i < count; i++) {
				const size = this.getSize(i);
				if (currentOffset + size > scrollTop) {
					startIndex = i;
					startOffset = currentOffset;
					break;
				}
				currentOffset += size;
			}
		}

		// Clamp start
		startIndex = Math.max(0, Math.min(startIndex, count - 1));

		// 2. Find End Index (Fill viewport)
		let endIndex = startIndex;
		let currentStackHeight = 0;
		const items: VirtualItem[] = [];

		// Apply overscan to start (look behind)
		const renderStart = Math.max(0, startIndex - overscan);

		// We need to back-calculate the offset if we overscanned backwards
		let renderOffset = startOffset;
		for (let i = startIndex - 1; i >= renderStart; i--) {
			renderOffset -= this.getSize(i);
		}

		// Loop forward until we fill viewport + overscan
		for (let i = renderStart; i < count; i++) {
			const size = this.getSize(i);

			items.push({
				index: i,
				start: renderOffset,
				size,
				end: renderOffset + size,
				measured: this.measurements.has(i),
			});

			renderOffset += size;
			currentStackHeight = renderOffset - startOffset;

			if (currentStackHeight >= viewportHeight && i >= startIndex + overscan) {
				endIndex = i;
				break;
			}
		}

		return items;
	}

	/**
	 * Helper to get size (measured > fixed > estimate)
	 */
	private getSize(index: number): number {
		if (this.options.fixedItemHeight) return this.options.fixedItemHeight;
		return this.measurements.get(index) ?? this.options.estimateSize(index);
	}
}

```

### File: packages\data\src\hooks\useDataManager.ts

```ts
import { useEffect, useRef, useState } from 'preact/hooks';
import type { DataSource } from '../core/datasource.ts';
import type { Dataset } from '../core/dataset.ts';
import { mergeItems } from '../core/normalization.ts';
import { findGaps, mergeRanges } from '../core/loading.ts';

interface UseDataManagerProps<TOut, TIn> {
	dataset: Dataset<TOut>;
	setDataset: (d: Dataset<TOut>) => void;
	/** Allow null for "Sugar Mode" (local arrays) */
	dataSource: DataSource<TOut, TIn> | null;
	visibleRange: { start: number; end: number };
	pageSize?: number;
}

export function useDataManager<TOut, TIn>({
	dataset,
	setDataset,
	dataSource,
	visibleRange,
	pageSize = 50,
}: UseDataManagerProps<TOut, TIn>) {
	const [isFetching, setIsFetching] = useState(false);
	const pendingRequests = useRef(new Set<string>());

	useEffect(() => {
		// 1. If no remote source, do nothing
		if (!dataSource) return;

		// 2. Identify what we need (Visible + Overscan)
		const PREFETCH = pageSize / 2;
		const start = Math.max(0, visibleRange.start - PREFETCH);
		const end = visibleRange.end + PREFETCH;

		// 3. Find what's missing
		const gaps = findGaps(Math.floor(start), Math.ceil(end), dataset.order);

		if (gaps.length === 0) return;

		// 4. Optimize requests
		const optimizedGaps = mergeRanges(gaps).map((gap) => {
			const pageStart = Math.floor(gap.start / pageSize) * pageSize;
			const pageEnd = Math.ceil((gap.start + gap.length) / pageSize) * pageSize;
			return { start: pageStart, length: pageEnd - pageStart };
		});

		// 5. Execute Fetch
		optimizedGaps.forEach((range) => {
			const reqKey = `${range.start}-${range.length}`;
			if (pendingRequests.current.has(reqKey)) return;

			pendingRequests.current.add(reqKey);
			setIsFetching(true);

			dataSource.fetch(range)
				.then((result) => {
					setDataset(mergeItems(dataset, result.items, range.start, dataSource));
				})
				.catch((err) => {
					console.error('Fetch failed', err);
				})
				.finally(() => {
					pendingRequests.current.delete(reqKey);
					setIsFetching(false);
				});
		});
	}, [visibleRange.start, visibleRange.end, dataset.order, dataSource]);

	return { isFetching };
}

```

### File: packages\data\src\hooks\useSelection.ts

```ts
import { useRef, useState } from 'preact/hooks';
import type { Dataset, NormalizedItem } from '../core/dataset.ts';

interface UseSelectionProps<T> {
	dataset: Dataset<T>;
	setDataset: (d: Dataset<T>) => void;
	selectionMode?: 'none' | 'single' | 'multi';
	onSelectionChange?: (selectedKeys: Set<string>) => void;
}

export function useSelection<T>({
	dataset,
	setDataset,
	selectionMode = 'single',
	onSelectionChange,
}: UseSelectionProps<T>) {
	// Track the last clicked item for Shift+Click ranges
	const lastKeyRef = useRef<string | null>(null);

	const handleItemClick = (key: string, event: MouseEvent) => {
		if (selectionMode === 'none') return;

		const isShift = event.shiftKey && selectionMode === 'multi';
		const isCtrl = (event.ctrlKey || event.metaKey) && selectionMode === 'multi';

		// Immutable update preparation
		const nextItems = new Map(dataset.items);
		let newSelectedKeys = new Set<string>();

		// Helper to set state
		const setSelect = (k: string, val: boolean) => {
			const item = nextItems.get(k);
			if (item) {
				nextItems.set(k, { ...item, selected: val });
				if (val) newSelectedKeys.add(k);
			}
		};

		if (isShift && lastKeyRef.current) {
			// --- Range Selection ---
			const start = dataset.order.indexOf(lastKeyRef.current);
			const end = dataset.order.indexOf(key);

			if (start !== -1 && end !== -1) {
				const [low, high] = start < end ? [start, end] : [end, start];
				// Select everything in between
				for (let i = low; i <= high; i++) {
					const k = dataset.order[i];
					if (k) setSelect(k, true);
				}
			}
		} else if (isCtrl) {
			// --- Toggle Selection ---
			// Keep existing
			for (const [k, item] of dataset.items) {
				if (item.selected) newSelectedKeys.add(k);
			}
			// Toggle target
			const target = nextItems.get(key);
			if (target) {
				if (target.selected) {
					setSelect(key, false);
					newSelectedKeys.delete(key);
				} else {
					setSelect(key, true);
				}
			}
			lastKeyRef.current = key;
		} else {
			// --- Simple Selection (Reset others) ---
			// Deselect all current
			for (const [k, item] of dataset.items) {
				if (item.selected) nextItems.set(k, { ...item, selected: false });
			}
			// Select new
			setSelect(key, true);
			lastKeyRef.current = key;
		}

		// Commit State
		setDataset({ ...dataset, items: nextItems });

		// Fire callback
		onSelectionChange?.(newSelectedKeys);
	};

	return { handleItemClick };
}

```

### File: packages\data\src\hooks\useVirtual.ts

```ts
import { useEffect, useReducer, useRef } from 'preact/hooks';
import { Virtualizer, type VirtualizerOptions } from '../core/virtualizer.ts';

export function useVirtual(options: VirtualizerOptions) {
	// Force update reducer
	const [, forceUpdate] = useReducer((x) => x + 1, 0);

	// The scroll container element
	const parentRef = useRef<HTMLDivElement>(null);

	// Persist the engine instance
	const virtualizerRef = useRef<Virtualizer | null>(null);

	if (!virtualizerRef.current) {
		virtualizerRef.current = new Virtualizer(options);
	}

	const virtualizer = virtualizerRef.current;

	// Sync options if they change (e.g., data count changes)
	useEffect(() => {
		virtualizer.setOptions(options);
		forceUpdate(0);
	}, [options.count, options.estimateSize, options.fixedItemHeight]);

	// Bind scroll event
	useEffect(() => {
		const element = parentRef.current;
		if (!element) return;

		const handleScroll = () => {
			// We only care about scrollTop changes
			// The virtualizer calculates what is visible based on this
			forceUpdate(0);
		};

		element.addEventListener('scroll', handleScroll, { passive: true });
		return () => element.removeEventListener('scroll', handleScroll);
	}, []);

	return {
		parentRef,
		virtualizer,
		// Helper to get current slice based on DOM state
		getItems: () => {
			const element = parentRef.current;
			const scrollTop = element?.scrollTop ?? 0;
			const height = element?.clientHeight ?? 0;
			return virtualizer.getVirtualItems(scrollTop, height);
		},
		getTotalSize: () => virtualizer.getTotalSize(),
	};
}

```

### File: packages\data\src\styles\base.css

```css
.data-display {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    position: relative;
    font-family: var(--data-font-family);
    font-size: var(--data-font-size);
    color: var(--text-primary);
    background-color: var(--bg-surface);
}


.data-display__scroll-pane {
    flex: 1;
    overflow-y: auto;
    overflow-x: auto;
    position: relative;

    scrollbar-width: thin;
    scrollbar-color: var(--border-active) transparent;
}


.data-display__scroll-pane::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.data-display__scroll-pane::-webkit-scrollbar-track {
    background: transparent;
}

.data-display__scroll-pane::-webkit-scrollbar-thumb {
    background-color: var(--border-subtle);
    border-radius: 4px;
}

.data-display__scroll-pane::-webkit-scrollbar-thumb:hover {
    background-color: var(--border-active);
}


.data-display__loader {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: var(--z-loader);
    background-color: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    color: var(--text-secondary);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
```

### File: packages\data\src\styles\components\grid.css

```css
.data-grid__row {
    display: flex;
    flex-direction: row;

}

.data-grid__cell {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding: calc(var(--grid-gap) / 2);
    position: relative;
}

.data-grid__card {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: var(--grid-card-bg);
    border: 1px solid var(--border-subtle);
    border-radius: var(--data-radius);
    overflow: hidden;
    transition: border-color var(--data-transition), box-shadow var(--data-transition);
}


.data-grid__card--interactive {
    cursor: pointer;
}

.data-grid__card--interactive:hover {
    border-color: var(--border-active);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.data-grid__card--selected {
    border-color: var(--border-focus);
    background-color: var(--bg-brand-subtle);
    box-shadow: 0 0 0 1px var(--border-focus);
}
```

### File: packages\data\src\styles\components\list.css

```css
.data-list__row {
    box-sizing: border-box;
}

.data-list__item {
    width: 100%;
    height: 100%;
    padding: 8px 12px;
    cursor: default;
    transition: background-color var(--data-transition);
    border-bottom: 1px solid transparent;
}


.data-list__item--interactive {
    cursor: pointer;
}

.data-list__item--interactive:hover {
    background-color: var(--bg-surface-subtle);
}

.data-list__item--selected {
    background-color: var(--bg-selection);
}

.data-list__item--selected:hover {
    background-color: var(--bg-selection);
}
```

### File: packages\data\src\styles\components\table.css

```css
.data-table {
    display: inline-block;
    min-width: 100%;
}


.data-table__header {
    display: flex;
    position: sticky;
    top: 0;
    z-index: var(--z-header);
    background-color: var(--table-header-bg);
    border-bottom: 1px solid var(--border-default);
    height: var(--table-header-height);

}

.data-table__header-cell {
    position: relative;
    display: flex;
    align-items: center;
    padding: var(--table-cell-padding);
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
    user-select: none;
}

.data-table__header-cell--sortable {
    cursor: pointer;
}

.data-table__header-cell--sortable:hover {
    color: var(--text-primary);
    background-color: var(--bg-surface-subtle);
}


.data-table__sort-icon {
    margin-left: 4px;
    font-size: 10px;
    color: var(--text-brand);
}


.data-table__resizer {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 12px;
    transform: translateX(50%);
    cursor: col-resize;
    z-index: 1;
    touch-action: none;
}


.data-table__resizer::after {
    content: "";
    display: block;
    position: absolute;
    left: 50%;
    top: 20%;
    bottom: 20%;
    width: 1px;
    background-color: transparent;
    transition: background-color 0.1s;
}

.data-table__resizer:hover::after,
.data-table__resizer--active::after {
    background-color: var(--border-focus);
    width: 2px;
}


.data-table__row {

    display: flex;
    border-bottom: 1px solid var(--border-subtle);
    background-color: var(--bg-surface);
    transition: background-color 0.1s;
}

.data-table__row:last-child {
    border-bottom: none;
}

.data-table__row--interactive {
    cursor: pointer;
}

.data-table__row--interactive:hover {
    background-color: var(--bg-surface-subtle);
}

.data-table__row--selected {
    background-color: var(--bg-selection);
}

.data-table__row--selected:hover {
    background-color: var(--bg-selection);
}


.data-table__cell {
    padding: var(--table-cell-padding);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    align-self: center;
    color: var(--text-primary);
}
```

### File: packages\data\src\styles\skeleton.css

```css
@keyframes data-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.data-skeleton {
  animation: data-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.data-table__row--skeleton {
  pointer-events: none;
}

.data-table__row--skeleton .data-table__cell {
  display: flex;
  align-items: center;
}

.data-skeleton__text {
  height: 16px;
  background-color: var(--bg-surface-active);
  border-radius: 4px;
}
```

### File: packages\data\src\styles\theme.css

```css
:root {
    --bg-surface: #ffffff;
    --bg-surface-subtle: #f9fafb;
    --bg-surface-active: #f3f4f6;
    --bg-surface-disabled: #f9fafb;
    --bg-overlay: #ffffff;
    --bg-brand-subtle: #eff6ff;
    --bg-brand-solid: #3b82f6;
    --bg-selection: rgba(59, 130, 246, 0.08);
    --border-default: #d1d5db;
    --border-subtle: #e5e7eb;
    --border-active: #9ca3af;
    --border-focus: #3b82f6;
    --border-error: #ef4444;
    --text-primary: #111827;
    --text-secondary: #4b5563;
    --text-tertiary: #9ca3af;
    --text-brand: #1d4ed8;
    --text-inverse: #ffffff;
    --data-radius: 6px;
    --data-font-family: inherit;
    --data-font-size: 14px;
    --data-line-height: 20px;
    --data-transition: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    --table-header-bg: var(--bg-surface);
    --table-header-height: 40px;
    --table-row-height: 48px;
    --table-cell-padding: 0 12px;
    --grid-gap: 8px;
    --grid-card-bg: var(--bg-surface);
    --z-header: 10;
    --z-sticky-col: 20;
    --z-loader: 50;
}


[data-theme='dark'] {
    --bg-surface: #222222;
    --bg-surface-subtle: #1f2937;
    --bg-surface-active: #374151;
    --bg-surface-disabled: #111827;
    --bg-overlay: #1e1e1e;
    --bg-brand-subtle: rgba(59, 130, 246, 0.15);
    --bg-selection: rgba(59, 130, 246, 0.2);
    --border-default: #374151;
    --border-subtle: #1f2937;
    --border-active: #4b5563;
    --text-primary: #f3f4f6;
    --text-secondary: #9ca3af;
    --text-tertiary: #6b7280;
    --text-brand: #3b82f6;
    --table-header-bg: #222222;
}
```

