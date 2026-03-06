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
  ChatList.tsx
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
  data-manager.ts
  dataset.ts
  datasource.ts
  helpers.ts
  index.ts
  loading.ts
  normalization.ts
  restdatasource.ts
  table.ts
  types.ts
  virtualizer.ts
  hooks/
  useDataManager.ts
  useScrollAnchoring.ts
  useSelection.ts
  useVirtual.ts
  styles/
  components/
  types/
  DataDisplayProps.ts
```

## File Contents

### File: packages\data\deno.json

```json
{
  "name": "@projective/data",
  "version": "0.0.0",
  "exports": "./mod.ts",
  "tasks": {
    "check": "deno fmt --check && deno lint && deno check mod.ts"
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
export { ChatList } from './src/components/displays/ChatList.tsx';
export type { DisplayMode } from './src/types/DataDisplayProps.ts';

```

### File: packages\data\src\components\DataDisplay.tsx

```tsx
import '../styles/base.css';
import '../styles/scroll-pane.css';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';

import type { DataSource } from '../core/datasource.ts';
import { initTableState, type TableState } from '../core/table.ts';
import { sortLocalData } from '../core/helpers.ts';

import { useVirtual } from '../hooks/useVirtual.ts';
import { useDataManager } from '../hooks/useDataManager.ts';
import { useSelection } from '../hooks/useSelection.ts';

import { ScrollPane } from './ScrollPane.tsx';
import { List } from './displays/List.tsx';
import { Grid } from './displays/Grid.tsx';
import { Table } from './table/Table.tsx';
import { DataDisplayProps } from '../types/DataDisplayProps.ts';

export function DataDisplay<TOut, TIn>({
	dataSource,
	renderItem,
	mode = 'list',
	scrollMode = 'container',
	scrollToBottom = false,
	gridColumns = 3,
	columns,
	estimateHeight = 50,
	pageSize = 50,
	selectionMode = 'single',
	onSelectionChange,
	className,
	style,
	interactive,
}: DataDisplayProps<TOut, TIn>) {
	const isLocal = Array.isArray(dataSource);

	const manager = useDataManager(
		isLocal ? null : dataSource as DataSource<TOut, TIn>,
		isLocal ? dataSource as TOut[] : undefined,
		pageSize,
	);

	const { handleItemClick } = useSelection({
		dataset: manager.dataset.value,
		setDataset: (d) => manager.dataset.value = d,
		selectionMode,
		onSelectionChange,
	});

	const [tableState, setTableState] = useState<TableState>(() => initTableState(columns || []));

	const activeOrder = useMemo(() => {
		const d = manager.dataset.value;
		const { columnId, direction } = tableState.sort;

		if (isLocal && columnId && direction) {
			return sortLocalData(d, columnId, direction, columns);
		}

		return d.order;
	}, [manager.dataset.value, tableState.sort, isLocal, columns]);

	const totalCount = manager.dataset.value.totalCount ?? (activeOrder.length + 100);
	const virtualRowCount = mode === 'grid' ? Math.ceil(totalCount / gridColumns) : totalCount;

	const previousTotalCount = useRef(totalCount);
	useLayoutEffect(() => {
		if (scrollToBottom && scrollMode === 'window' && totalCount > previousTotalCount.current) {
			const newScrollHeight = document.body.scrollHeight;
			if (globalThis.scrollY < 100 && newScrollHeight > 0) {
				globalThis.scrollBy(0, newScrollHeight);
			}
		}
		previousTotalCount.current = totalCount;
	}, [totalCount, scrollToBottom, scrollMode]);

	const { parentRef, virtualizer, getItems, getTotalSize } = useVirtual({
		count: virtualRowCount,
		estimateSize: () => estimateHeight,
		overscan: 5,
		useWindowScroll: scrollMode === 'window',
		initialScrollToBottom: scrollToBottom,
	});

	const virtualItems = getItems();

	useEffect(() => {
		if (virtualItems.length > 0) {
			const startRow = virtualItems[0].index;
			const endRow = virtualItems[virtualItems.length - 1].index;

			let start = startRow;
			let end = endRow;

			if (mode === 'grid') {
				start = startRow * gridColumns;
				end = (endRow + 1) * gridColumns - 1;
			}

			manager.setVisibleRange(start, end);
		}
	}, [virtualItems, mode, gridColumns, manager]);

	const safeRenderItem = (item: TOut, index: number) => renderItem(item, index);

	return (
		<div className={`data-display ${className ?? ''}`} style={style}>
			{manager.isFetching.value && <div className='data-display__loader'>Loading...</div>}

			<ScrollPane ref={parentRef} mode={scrollMode} className='data-display__scroll-pane'>
				<div
					className='scroll-pane__shim'
					style={{
						height: `${getTotalSize()}px`,
						minWidth: mode === 'table' ? 'fit-content' : '100%',
					}}
				>
					{mode === 'list' && (
						<List
							dataset={{ ...manager.dataset.value, order: activeOrder }}
							virtualItems={virtualItems}
							virtualizer={virtualizer}
							renderItem={safeRenderItem}
							onItemClick={handleItemClick}
							interactive={interactive}
						/>
					)}

					{mode === 'grid' && (
						<Grid
							dataset={{ ...manager.dataset.value, order: activeOrder }}
							virtualItems={virtualItems}
							virtualizer={virtualizer}
							renderItem={safeRenderItem}
							columnCount={gridColumns}
							onItemClick={handleItemClick}
						/>
					)}

					{mode === 'table' && columns && (
						<Table
							dataset={{ ...manager.dataset.value, order: activeOrder }}
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

### File: packages\data\src\components\displays\ChatList.tsx

```tsx
import { useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { DataSource } from '../../core/datasource.ts';
import { useVirtual } from '../../hooks/useVirtual.ts';
import { useScrollAnchoring } from '../../hooks/useScrollAnchoring.ts';
import { ScrollPane } from '../ScrollPane.tsx';

interface RealtimeDataSource<T> extends DataSource<T> {
	getMeta(): Promise<{ totalCount: number }>;
	subscribe?: (cb: (event: any) => void) => () => void;
}

interface ChatListProps<T> {
	dataSource: RealtimeDataSource<T>;
	renderItem: (item: T) => preact.VNode;
	estimateHeight?: number;
	pageSize?: number;
	optimisticItems?: T[];
	scrollMode?: 'container' | 'window';
}

export function ChatList<T extends { id: string; tempId?: string }>({
	dataSource,
	renderItem,
	estimateHeight = 80,
	pageSize = 20,
	optimisticItems = [],
	scrollMode = 'container',
}: ChatListProps<T>) {
	const items = useSignal<T[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [cursor, setCursor] = useState(0);

	const [, forceUpdate] = useReducer((x) => x + 1, 0);

	useEffect(() => {
		let unsubscribe: (() => void) | undefined;

		const init = async () => {
			setIsLoading(true);
			const meta = await dataSource.getMeta();
			const start = Math.max(0, meta.totalCount - pageSize);
			const result = await dataSource.fetch({ start, length: pageSize });

			items.value = result.items as T[];
			setCursor(start);
			setIsLoading(false);

			if (dataSource.subscribe) {
				console.log('[ChatList] Attaching to dataSource.subscribe()');
				unsubscribe = dataSource.subscribe((event: any) => {
					const { type, data } = event;
					const eventType = type || 'INSERT';
					const msgData = type ? data : event;

					console.log(`[ChatList] Processing ${eventType} event for ID: ${msgData.id}`);

					items.value = [...items.value];
					const currentItems = items.value;

					if (eventType === 'INSERT') {
						if (!currentItems.some((i: any) => i.id === msgData.id)) {
							console.log(`[ChatList] Injecting new message ${msgData.id} into list.`);
							items.value = [...currentItems, msgData];
							requestAnimationFrame(() => {
								if (parentRef.current) {
									parentRef.current.scrollTo({
										top: parentRef.current.scrollHeight,
										behavior: 'smooth',
									});
								}
							});
						} else {
							console.log(`[ChatList] Ignoring message ${msgData.id} (already exists).`);
						}
					} else if (eventType === 'UPDATE') {
						console.log(`[ChatList] Updating message ${msgData.id}.`);
						items.value = currentItems.map((i: any) =>
							i.id === msgData.id ? { ...i, ...msgData } : i
						);
					} else if (eventType === 'DELETE') {
						console.log(`[ChatList] Deleting message ${msgData.id}.`);
						items.value = currentItems.filter((i: any) => i.id !== msgData.id);
					}
				});
			}
		};

		init();
		return () => {
			if (unsubscribe) {
				console.log('[ChatList] Unmounting, cleaning up subscription.');
				unsubscribe();
			}
		};
	}, [dataSource]);

	const loadMore = async () => {
		if (isLoading || cursor === 0) return;
		setIsLoading(true);
		const amountToFetch = Math.min(pageSize, cursor);
		const start = cursor - amountToFetch;
		const result = await dataSource.fetch({ start, length: amountToFetch });

		items.value = [...result.items, ...items.value] as T[];
		setCursor(start);
		setIsLoading(false);
	};

	const combinedItems = useMemo(() => {
		if (!optimisticItems || optimisticItems.length === 0) return items.value;

		const realIds = new Set(items.value.map((i: any) => i.id));

		const filteredOpt = optimisticItems.filter((opt: any) =>
			!realIds.has(opt.id) && !realIds.has(opt.tempId)
		);

		if (filteredOpt.length > 0) {
			console.log('[ChatList] Appending Optimistic messages:', filteredOpt.length);
		}

		return [...items.value, ...filteredOpt];
	}, [items.value, optimisticItems]);

	const { parentRef, virtualizer: _, getItems, getTotalSize } = useVirtual({
		count: combinedItems.length,
		estimateSize: () => estimateHeight,
		overscan: 5,
		useWindowScroll: scrollMode === 'window',
		initialScrollToBottom: true,
		onChange: () => forceUpdate(0),
	});

	useScrollAnchoring(parentRef, true, [combinedItems, getTotalSize()]);

	const virtualItems = getItems();

	useEffect(() => {
		if (!isLoading && virtualItems.length > 0 && cursor > 0) {
			if (virtualItems[0].index < 5) loadMore();
		}
	}, [virtualItems, isLoading, cursor]);

	const hasJumped = useRef(false);
	useLayoutEffect(() => {
		if (!hasJumped.current && items.value.length > 0) {
			if (parentRef.current) {
				parentRef.current.scrollTo({ top: parentRef.current.scrollHeight, behavior: 'instant' });
			}
			hasJumped.current = true;
		}
	}, [items.value.length]);

	if (items.value.length === 0 && isLoading) {
		return <div class='p-4 text-center text-gray-400'>Loading chat...</div>;
	}

	return (
		<ScrollPane ref={parentRef} mode={scrollMode} style={{ height: '100%', overflowY: 'auto' }}>
			<div style={{ height: `${getTotalSize()}px`, width: '100%', position: 'relative' }}>
				{cursor > 0 && isLoading && (
					<div
						style={{
							position: 'absolute',
							top: '-40px',
							width: '100%',
							textAlign: 'center',
							padding: '10px',
							color: '#888',
						}}
					>
						Loading history...
					</div>
				)}

				{virtualItems.map((virtualRow) => {
					const item = combinedItems[virtualRow.index];
					if (!item) {
						return null;
					}

					return (
						<div
							key={item.id || virtualRow.index}
							ref={virtualRow.measureElement}
							data-index={virtualRow.index}
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								width: '100%',
								transform: `translateY(${virtualRow.start}px)`,
							}}
						>
							{renderItem(item)}
						</div>
					);
				})}
			</div>
		</ScrollPane>
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
	interactive?: boolean;
}

export function List<T>({
	dataset,
	virtualItems,
	virtualizer,
	renderItem,
	onItemClick,
	interactive,
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
							className={`data-list__item ${
								onItemClick && interactive ? 'data-list__item--interactive' : ''
							} ${item.selected ? 'data-list__item--selected' : ''}`}
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
import type { CSSProperties, HTMLAttributes, Signalish } from 'preact';
import '../styles/scroll-pane.css';

export type ScrollPaneMode = 'container' | 'window';

interface ScrollPaneProps extends HTMLAttributes<HTMLDivElement> {
	children: preact.ComponentChildren;
	mode?: ScrollPaneMode;
}

export const ScrollPane = forwardRef<HTMLDivElement, ScrollPaneProps>(
	({ children, style, className, mode = 'container', ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={`scroll-pane scroll-pane--${mode} ${className ?? ''}`}
				style={style as Signalish<CSSProperties>}
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

### File: packages\data\src\core\data-manager.ts

```ts
import { batch, type Signal, signal } from '@preact/signals';
import type { DataSource } from './datasource.ts';
import type { Dataset, NormalizedItem } from './dataset.ts';
import { createEmptyDataset } from './dataset.ts';
import { mergeItems } from './normalization.ts';
import { findGaps, mergeRanges } from './loading.ts';
import type { Range } from './types.ts';

interface DataManagerOptions<TOut, TIn> {
	dataSource: DataSource<TOut, TIn> | null;
	pageSize?: number;
	initialData?: TOut[];
}

export class DataManager<TOut, TIn> {
	public dataset: Signal<Dataset<TOut>>;
	public isFetching: Signal<boolean>;

	private dataSource: DataSource<TOut, TIn> | null;
	private pageSize: number;
	private pendingRequests = new Set<string>();
	private visibleRange: Range = { start: 0, length: 0 };
	private debounceTimer: number | null = null;
	private isDestroyed = false;

	constructor(options: DataManagerOptions<TOut, TIn>) {
		this.dataSource = options.dataSource;
		this.pageSize = options.pageSize || 50;
		this.isFetching = signal(false);

		if (options.initialData) {
			const items = new Map<string, NormalizedItem<TOut>>();
			const order: string[] = [];
			options.initialData.forEach((d, i) => {
				const key = String(i);
				items.set(key, { key, data: d, selected: false, isSkeleton: false });
				order.push(key);
			});
			this.dataset = signal({
				items,
				order,
				totalCount: options.initialData.length,
				pendingRanges: [],
			});
		} else {
			this.dataset = signal(createEmptyDataset<TOut>());
		}

		// REMOVED: this.fetchMeta();
		// SSR Safety: Do not fetch in constructor.
	}

	public updateDataSource(newSource: DataSource<TOut, TIn> | null) {
		// Even if source is same, we might need to fetch if it's the initial client-side hydration
		// So we only return if we have data or are already fetching
		if (
			this.dataSource === newSource &&
			(this.dataset.value.totalCount !== null || this.isFetching.value)
		) return;

		this.dataSource = newSource;
		this.pendingRequests.clear();

		// Only reset if we are actually switching sources, not just initializing
		if (this.dataset.value.totalCount !== null) {
			batch(() => {
				this.dataset.value = createEmptyDataset<TOut>();
				this.isFetching.value = false;
			});
		}

		this.fetchMeta();
		this.checkGaps();
	}

	// ... (rest of the file remains exactly the same as previous step)
	public setVisibleRange(start: number, end: number) {
		const length = end - start + 1;
		if (this.visibleRange.start === start && this.visibleRange.length === length) return;

		this.visibleRange = { start, length };

		if (this.debounceTimer) clearTimeout(this.debounceTimer);
		this.debounceTimer = setTimeout(() => {
			if (!this.isDestroyed) this.checkGaps();
		}, 60) as unknown as number;
	}

	private async fetchMeta() {
		if (!this.dataSource || this.dataset.value.totalCount !== null) return;

		// @ts-ignore
		if (typeof this.dataSource.getMeta === 'function') {
			try {
				// @ts-ignore
				const meta = await this.dataSource.getMeta();
				if (typeof meta?.totalCount === 'number') {
					this.dataset.value = {
						...this.dataset.value,
						totalCount: meta.totalCount,
					};
					this.checkGaps();
				}
			} catch (e) {
				console.error('Meta fetch failed', e);
			}
		}
	}

	private checkGaps() {
		if (!this.dataSource || this.isDestroyed) return;

		const currentTotal = this.dataset.value.totalCount;
		const PREFETCH = this.pageSize;
		const start = Math.max(0, this.visibleRange.start - PREFETCH);
		let end = this.visibleRange.start + this.visibleRange.length + PREFETCH;

		if (currentTotal !== null) {
			end = Math.min(end, currentTotal);
		} else {
			end = Math.min(end, this.pageSize * 2);
		}

		if (start >= end) return;

		const gaps = findGaps(Math.floor(start), Math.ceil(end), this.dataset.value.order);
		if (gaps.length === 0) return;

		const requests = mergeRanges(gaps).map((gap) => {
			const pageStart = Math.floor(gap.start / this.pageSize) * this.pageSize;
			let pageEnd = Math.ceil((gap.start + gap.length) / this.pageSize) * this.pageSize;

			if (currentTotal !== null) {
				pageEnd = Math.min(pageEnd, currentTotal);
			}

			return { start: pageStart, length: pageEnd - pageStart };
		}).filter((r) => r.length > 0);

		requests.forEach((range) => this.fetchRange(range));
	}

	private async fetchRange(range: Range) {
		const reqKey = `${range.start}-${range.length}`;

		if (this.pendingRequests.has(reqKey)) return;
		this.pendingRequests.add(reqKey);

		if (!this.isFetching.value) this.isFetching.value = true;

		try {
			const result = await this.dataSource!.fetch(range);
			if (this.isDestroyed) return;

			if (Array.isArray(result.items)) {
				batch(() => {
					this.dataset.value = mergeItems(
						this.dataset.value,
						result.items,
						range.start,
						this.dataSource!,
						result.meta?.totalCount,
						range.length,
					);
				});
			}
		} catch (err) {
			console.error(`Fetch failed ${reqKey}`, err);
		} finally {
			this.pendingRequests.delete(reqKey);
			if (this.pendingRequests.size === 0 && !this.isDestroyed) {
				this.isFetching.value = false;
			}
		}
	}

	public destroy() {
		this.isDestroyed = true;
		if (this.debounceTimer) clearTimeout(this.debounceTimer);
		this.pendingRequests.clear();
	}
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

export function createSkeletonItem<T>(index: number): NormalizedItem<T> {
	return {
		key: `skeleton-${index}`,
		data: {} as T,
		selected: false,
		isSkeleton: true,
		layout: { estimatedHeight: 50 },
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

### File: packages\data\src\core\helpers.ts

```ts
import { Dataset } from './dataset.ts';
import { ColumnDef, getCellValue } from './table.ts';

export function sortLocalData<T>(
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

	const sorted = [...ranges].sort((a, b) => a.start - b.start);
	const merged: Range[] = [];

	let current = sorted[0];

	for (let i = 1; i < sorted.length; i++) {
		const next = sorted[i];

		if (next.start <= (current.start + current.length)) {
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

export function mergeItems<TOut, TIn>(
	currentDataset: Dataset<TOut>,
	newRawItems: TIn[],
	offset: number,
	source: DataSource<TOut, TIn>,
	newTotalCount?: number | null,
	requestedLength?: number, // NEW: We need to know how many we asked for
): Dataset<TOut> {
	const nextItems = new Map(currentDataset.items);
	const nextOrder = [...currentDataset.order];

	newRawItems.forEach((raw, index) => {
		const { key, data } = source.normalize(raw);
		const absoluteIndex = offset + index;
		const existing = nextItems.get(key);

		const newItem: NormalizedItem<TOut> = {
			key,
			data,
			selected: existing ? existing.selected : false,
			isSkeleton: false,
			layout: existing?.layout,
		};

		nextItems.set(key, newItem);

		if (absoluteIndex >= nextOrder.length) {
			nextOrder.length = absoluteIndex + 1;
		}
		nextOrder[absoluteIndex] = key;
	});

	// --- INTELLIGENT TOTAL COUNT LOGIC ---
	let finalTotalCount = newTotalCount !== undefined ? newTotalCount : currentDataset.totalCount;

	// Fallback: If API didn't give a total, but gave us fewer items than we asked for,
	// we have hit the end of the dataset.
	if (
		finalTotalCount === null && // No explicit total yet
		requestedLength !== undefined && // We know what we asked for
		newRawItems.length < requestedLength // We got less back
	) {
		finalTotalCount = offset + newRawItems.length;
	}

	// Sanity trim
	if (finalTotalCount !== null && nextOrder.length > finalTotalCount) {
		nextOrder.length = finalTotalCount;
	}

	return {
		...currentDataset,
		items: nextItems,
		order: nextOrder,
		totalCount: finalTotalCount,
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
	cacheTtl?: number;
	fetchOptions?: RequestInit;
}

const GLOBAL_CACHE = new Map<string, { timestamp: number; response: Promise<any> }>();

export class RestDataSource<TOut, TIn extends { total_count?: number }>
	extends DataSource<TOut, TIn> {
	declare protected config: RestDataSourceConfig<TOut, TIn>;

	constructor(config: RestDataSourceConfig<TOut, TIn>) {
		super(config);
	}

	public async getMeta(): Promise<{ totalCount: number }> {
		const params = new URLSearchParams(this.config.defaultParams);
		params.set('countOnly', 'true');

		// FIX: Separate URL construction from Cache Key
		const fetchUrl = `${this.config.url}?${params.toString()}`;
		const cacheKey = `${fetchUrl}_meta`;

		// 1. Check Cache
		const now = Date.now();
		const ttl = this.config.cacheTtl ?? 5000;
		const cached = GLOBAL_CACHE.get(cacheKey);

		if (cached && (now - cached.timestamp < ttl)) {
			try {
				const data = await cached.response;
				return data.meta || { totalCount: 0 };
			} catch (e) {
				GLOBAL_CACHE.delete(cacheKey);
			}
		}

		// 2. Request
		const requestPromise = (async () => {
			const response = await fetch(fetchUrl, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					...(this.config.fetchOptions?.headers || {}),
				},
				credentials: this.config.fetchOptions?.credentials ?? 'same-origin',
				...this.config.fetchOptions,
			});

			if (!response.ok) return { totalCount: 0 };
			const data = await response.json();
			return data; // Return full response to cache
		})();

		GLOBAL_CACHE.set(cacheKey, { timestamp: now, response: requestPromise });

		try {
			const data = await requestPromise;
			return data.meta || { totalCount: 0 };
		} catch (error) {
			console.error('Meta fetch failed:', error);
			GLOBAL_CACHE.delete(cacheKey);
			return { totalCount: 0 };
		}
	}

	public async fetch(range: Range): Promise<FetchResult<TIn>> {
		const params = new URLSearchParams(this.config.defaultParams);
		params.set('offset', String(range.start));
		params.set('limit', String(range.length));

		// FIX: Use clean URL for fetch
		const fetchUrl = `${this.config.url}?${params.toString()}`;
		const cacheKey = fetchUrl; // For rows, URL is unique enough

		const ttl = this.config.cacheTtl ?? 5000;
		const now = Date.now();

		const cached = GLOBAL_CACHE.get(cacheKey);
		if (cached && (now - cached.timestamp < ttl)) {
			try {
				const data = await cached.response;
				return structuredClone(data);
			} catch (e) {
				GLOBAL_CACHE.delete(cacheKey);
			}
		}

		const requestPromise = (async () => {
			try {
				const response = await fetch(fetchUrl, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						...(this.config.fetchOptions?.headers || {}),
					},
					credentials: this.config.fetchOptions?.credentials ?? 'same-origin',
					...this.config.fetchOptions,
				});

				if (!response.ok) throw new Error(`HTTP Error: ${response.statusText}`);

				const data = await response.json();

				let items: TIn[] = [];
				if (Array.isArray(data)) {
					items = data;
				} else if (data && Array.isArray(data.items)) {
					items = data.items;
				}

				const totalCount = data.meta?.totalCount ?? (items.length > 0 ? items[0].total_count : 0);

				return {
					items,
					meta: { totalCount },
				};
			} catch (error) {
				console.error('Data Fetch Error:', error);
				throw error;
			}
		})();

		GLOBAL_CACHE.set(cacheKey, { timestamp: now, response: requestPromise });

		try {
			return await requestPromise;
		} catch (error) {
			GLOBAL_CACHE.delete(cacheKey);
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
export interface VirtualItem {
	index: number;
	start: number; // Pixel offset from top
	size: number; // Pixel height
	end: number; // start + size
	measured: boolean;
	/** Ref callback to attach to the rendered DOM element for measurement */
	measureElement: (el: Element | null) => void;
}

export interface VirtualizerOptions {
	count: number;
	estimateSize: (index: number) => number;
	overscan?: number;
	fixedItemHeight?: number;
	/** Callback fired when the total size changes (useful for updating scroll containers) */
	onChange?: () => void;
}

export class Virtualizer {
	private measurements = new Map<number, number>();
	private lastMeasuredIndex = -1;
	private options: VirtualizerOptions;
	private _totalSizeCache: number | null = null;

	// ResizeObserver Integration (Nullable for SSR safety)
	private resizeObserver: ResizeObserver | null = null;
	private activeElements = new Map<number, Element>();
	private elementIndexMap = new WeakMap<Element, number>();

	constructor(options: VirtualizerOptions) {
		this.options = { overscan: 1, ...options };

		// FIX: Only instantiate ResizeObserver if it exists (Browser environment)
		if (typeof ResizeObserver !== 'undefined') {
			this.resizeObserver = new ResizeObserver((entries) => {
				let hasChanges = false;
				for (const entry of entries) {
					const index = this.elementIndexMap.get(entry.target);
					if (index !== undefined) {
						// Use borderBoxSize for precision, fall back to contentRect
						const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;

						if (this.measurements.get(index) !== height) {
							this.measure(index, height);
							hasChanges = true;
						}
					}
				}

				if (hasChanges && this.options.onChange) {
					this.options.onChange();
				}
			});
		}
	}

	public setOptions(newOptions: Partial<VirtualizerOptions>) {
		this.options = { ...this.options, ...newOptions };
		this._totalSizeCache = null;
	}

	public measure(index: number, size: number) {
		const prev = this.measurements.get(index);
		if (prev !== size) {
			this.measurements.set(index, size);
			this._totalSizeCache = null;
			this.lastMeasuredIndex = Math.max(this.lastMeasuredIndex, index);
		}
	}

	public getTotalSize(): number {
		if (this.options.fixedItemHeight) {
			return this.options.count * this.options.fixedItemHeight;
		}

		if (this._totalSizeCache !== null) {
			return this._totalSizeCache;
		}

		let measuredHeight = 0;
		this.measurements.forEach((size) => {
			measuredHeight += size;
		});

		const unmeasuredCount = this.options.count - this.measurements.size;
		const total = measuredHeight + (unmeasuredCount * this.options.estimateSize(0));

		this._totalSizeCache = total;
		return total;
	}

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
			startIndex = Math.floor(scrollTop / fixedItemHeight);
			startOffset = startIndex * fixedItemHeight;
		} else {
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

		startIndex = Math.max(0, Math.min(startIndex, count - 1));

		// 2. Find End Index (Fill viewport)
		let endIndex = startIndex;
		let renderOffset = startOffset;

		const renderStart = Math.max(0, startIndex - overscan);

		// Adjust offset for overscan (look behind)
		for (let i = startIndex - 1; i >= renderStart; i--) {
			renderOffset -= this.getSize(i);
		}

		const items: VirtualItem[] = [];

		for (let i = renderStart; i < count; i++) {
			const size = this.getSize(i);

			items.push({
				index: i,
				start: renderOffset,
				size,
				end: renderOffset + size,
				measured: this.measurements.has(i),

				// The ref callback
				measureElement: (node: Element | null) => {
					// FIX: Check if observer exists before using
					if (!this.resizeObserver) return;

					if (node) {
						// Mount: Observe
						if (this.activeElements.get(i) !== node) {
							this.activeElements.set(i, node);
							this.elementIndexMap.set(node, i);
							this.resizeObserver.observe(node);
						}
					} else {
						// Unmount: Unobserve
						const activeNode = this.activeElements.get(i);
						if (activeNode) {
							this.resizeObserver.unobserve(activeNode);
							this.activeElements.delete(i);
							this.elementIndexMap.delete(activeNode);
						}
					}
				},
			});

			renderOffset += size;
			if (renderOffset - startOffset >= viewportHeight && i >= startIndex + overscan) {
				endIndex = i;
				break;
			}
		}

		return items;
	}

	private getSize(index: number): number {
		if (this.options.fixedItemHeight) return this.options.fixedItemHeight;
		return this.measurements.get(index) ?? this.options.estimateSize(index);
	}

	public cleanup() {
		// FIX: Safe access
		this.resizeObserver?.disconnect();
		this.activeElements.clear();
	}
}

```

### File: packages\data\src\hooks\useDataManager.ts

```ts
import { useEffect, useMemo } from 'preact/hooks';
import { DataManager } from '../core/data-manager.ts';
import type { DataSource } from '../core/datasource.ts';

export function useDataManager<TOut, TIn>(
	dataSource: DataSource<TOut, TIn> | null,
	initialData?: TOut[],
	pageSize = 50,
) {
	const manager = useMemo(() =>
		new DataManager({
			dataSource,
			initialData,
			pageSize,
		}), []);

	useEffect(() => {
		manager.updateDataSource(dataSource);
	}, [dataSource, manager]);

	useEffect(() => {
		return () => manager.destroy();
	}, [manager]);

	return manager;
}

```

### File: packages\data\src\hooks\useScrollAnchoring.ts

```ts
import { useEffect, useLayoutEffect, useRef } from 'preact/hooks';

/**
 * Maintains the user's scroll position relative to the bottom of the content.
 */
export function useScrollAnchoring(
	ref: preact.RefObject<HTMLElement | null>,
	isWindowMode: boolean,
	deps: any[] = [],
) {
	const prevScrollHeight = useRef(0);
	const prevScrollTop = useRef(0);
	const wasAtBottom = useRef(true);

	useLayoutEffect(() => {
		const el = isWindowMode ? document.scrollingElement : ref.current;
		if (!el) return;

		const currentScrollHeight = el.scrollHeight;
		// @ts-ignore - fallback to innerHeight
		const clientHeight = isWindowMode
			? (globalThis.visualViewport?.height ?? globalThis.innerHeight)
			: el.clientHeight;
		const currentScrollTop = isWindowMode ? globalThis.scrollY : el.scrollTop;

		const heightDelta = currentScrollHeight - prevScrollHeight.current;

		if (heightDelta !== 0 && prevScrollHeight.current > 0) {
			// CASE 1: STRICT BOTTOM LOCK
			// If we were at the bottom previously, we MUST stay at the bottom,
			// regardless of whether content grew or shrank.
			if (wasAtBottom.current) {
				if (isWindowMode) {
					globalThis.scrollTo({ top: currentScrollHeight, behavior: 'instant' });
				} else if (el instanceof HTMLElement) {
					el.scrollTop = currentScrollHeight;
				}
			} // CASE 2: RELATIVE ADJUSTMENT (History Load)
			// We weren't at the bottom, so we are likely reading history.
			// Adjust position by the delta to prevent visual jumping.
			else {
				if (isWindowMode) {
					globalThis.scrollBy({ top: heightDelta, behavior: 'instant' });
				} else if (el instanceof HTMLElement) {
					el.scrollTop += heightDelta;
				}
			}
		}

		// Snapshot
		prevScrollHeight.current = currentScrollHeight;
		prevScrollTop.current = isWindowMode ? globalThis.scrollY : el.scrollTop;

		// Re-calculate "Am I at the bottom?" for the NEXT run
		// We use a looser threshold (100px) to make it "sticky"
		const dist = currentScrollHeight - (prevScrollTop.current + clientHeight);
		wasAtBottom.current = dist < 100;
	}, [...deps, isWindowMode]);

	// Listen to real-time scrolling
	useEffect(() => {
		const handleScroll = () => {
			const el = isWindowMode ? document.scrollingElement : ref.current;
			if (!el) return;

			const scrollH = el.scrollHeight;
			const scrollT = isWindowMode ? globalThis.scrollY : el.scrollTop;
			// @ts-ignore
			const clientH = isWindowMode
				? (globalThis.visualViewport?.height ?? globalThis.innerHeight)
				: el.clientHeight;

			wasAtBottom.current = (scrollH - (scrollT + clientH)) < 100;
		};

		const target = isWindowMode ? globalThis : ref.current;
		target?.addEventListener('scroll', handleScroll, { passive: true });
		return () => target?.removeEventListener('scroll', handleScroll);
	}, [isWindowMode]);
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

interface UseVirtualOptions extends VirtualizerOptions {
	/**
	 * If true, attaches scroll listeners to the globalThis instead of the parent element.
	 * The virtualizer will calculate offsets relative to the viewport.
	 */
	useWindowScroll?: boolean;

	/**
	 * If true, scrolls to the bottom of the content on initial load.
	 */
	initialScrollToBottom?: boolean;
}

export function useVirtual(options: UseVirtualOptions) {
	const [, forceUpdate] = useReducer((x) => x + 1, 0);
	const parentRef = useRef<HTMLDivElement>(null);
	const virtualizerRef = useRef<Virtualizer | null>(null);
	const hasAutoScrolled = useRef(false);

	if (!virtualizerRef.current) {
		virtualizerRef.current = new Virtualizer(options);
	}

	const virtualizer = virtualizerRef.current;

	// Update options when they change
	useEffect(() => {
		virtualizer.setOptions(options);
		forceUpdate(0);
	}, [options.count, options.estimateSize, options.fixedItemHeight, options.useWindowScroll]);

	// --- Scroll Event Listeners ---
	useEffect(() => {
		const handleScroll = () => {
			forceUpdate(0);
		};

		if (options.useWindowScroll) {
			globalThis.addEventListener('scroll', handleScroll, { passive: true });
			globalThis.addEventListener('resize', handleScroll, { passive: true });

			return () => {
				globalThis.removeEventListener('scroll', handleScroll);
				globalThis.removeEventListener('resize', handleScroll);
			};
		} else {
			const element = parentRef.current;
			if (!element) return;

			element.addEventListener('scroll', handleScroll, { passive: true });
			return () => element.removeEventListener('scroll', handleScroll);
		}
	}, [options.useWindowScroll]);

	// --- Initial Scroll To Bottom Logic ---
	useEffect(() => {
		// Only run once when we have items
		if (options.initialScrollToBottom && !hasAutoScrolled.current && options.count > 0) {
			// We need a small tick to let the layout settle and height to be calculated
			requestAnimationFrame(() => {
				const totalSize = virtualizer.getTotalSize();

				if (options.useWindowScroll) {
					// For globalThis scroll, we scroll the body
					globalThis.scrollTo({
						top: document.body.scrollHeight,
						behavior: 'instant' as ScrollBehavior,
					});
				} else if (parentRef.current) {
					// For container scroll, we scroll the element
					parentRef.current.scrollTop = totalSize;
				}

				hasAutoScrolled.current = true;
			});
		}
	}, [options.count, options.initialScrollToBottom, options.useWindowScroll]);

	const getItems = () => {
		let scrollTop = 0;
		let viewportHeight = 0;
		let offsetAdjustment = 0;

		if (options.useWindowScroll) {
			scrollTop = globalThis.scrollY;
			viewportHeight = globalThis.innerHeight;

			// If the list isn't at the very top of the page, we need to adjust
			if (parentRef.current) {
				const rect = parentRef.current.getBoundingClientRect();
				const elementAbsoluteTop = scrollTop + rect.top;
				offsetAdjustment = elementAbsoluteTop;

				// Virtualizer thinks in 0-based offsets
				scrollTop = Math.max(0, scrollTop - offsetAdjustment);
			}
		} else {
			const element = parentRef.current;
			scrollTop = element?.scrollTop ?? 0;
			viewportHeight = element?.clientHeight ?? 0;
		}

		return virtualizer.getVirtualItems(scrollTop, viewportHeight);
	};

	return {
		parentRef,
		virtualizer,
		getItems,
		getTotalSize: () => virtualizer.getTotalSize(),
	};
}

```

### File: packages\data\src\types\DataDisplayProps.ts

```ts
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

```

