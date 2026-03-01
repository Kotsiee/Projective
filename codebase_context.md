# Selected Codebase Context

> Included paths: ./packages/data, ./packages/fields

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
./packages/fields/
  fields/
  deno.json
  mod.ts
  src/
  components/
  ComboboxField.tsx
  DateField.tsx
  datetime/
  Calendar.tsx
  TimeClock.tsx
  DateTimeField.tsx
  FileDrop.tsx
  HelpTooltip.tsx
  MoneyField.tsx
  RichTextField.tsx
  SelectField.tsx
  SliderField.tsx
  TagInput.tsx
  TextField.tsx
  TimeField.tsx
  core/
  hooks/
  useCurrencyMask.ts
  useFieldState.ts
  useFileProcessor.ts
  useGlobalDrag.ts
  useInteraction.ts
  useSelectState.ts
  useSliderState.ts
  styles/
  components/
  fields/
  overlays/
  wrappers/
  types/
  components/
  combobox-field.ts
  date-field.ts
  datetime-field.ts
  file-drop.ts
  money-field.ts
  rich-text-field.ts
  select-field.ts
  slider-field.ts
  tag-input.ts
  text-field.ts
  time-field.ts
  core.ts
  file.ts
  wrappers.ts
  wrappers/
  AdornmentWrapper.tsx
  EffectWrapper.tsx
  FieldArrayWrapper.tsx
  GlobalFileDrop.tsx
  LabelWrapper.tsx
  MessageWrapper.tsx
  SkeletonWrapper.tsx
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

### File: packages\fields\deno.json

```json
{
  "name": "@projective/fields",
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

### File: packages\fields\mod.ts

```ts
// Types
export * from './src/types/core.ts';
// export * from './src/types/form.ts';

// Wrappers
export * from './src/wrappers/LabelWrapper.tsx';
export * from './src/wrappers/AdornmentWrapper.tsx';
export * from './src/wrappers/SkeletonWrapper.tsx';
export * from './src/wrappers/MessageWrapper.tsx';
export * from './src/wrappers/EffectWrapper.tsx';
export * from './src/wrappers/FieldArrayWrapper.tsx';

// Hooks
export * from './src/hooks/useInteraction.ts';
export * from './src/hooks/useCurrencyMask.ts';

// Components
export * from './src/components/TextField.tsx';
export * from './src/components/SelectField.tsx';
export * from './src/components/SliderField.tsx';
export * from './src/components/DateField.tsx';
export * from './src/components/TimeField.tsx';
export * from './src/components/FileDrop.tsx';
export * from './src/components/TagInput.tsx';
export * from './src/components/MoneyField.tsx';
export * from './src/components/ComboboxField.tsx';
export * from './src/components/DateTimeField.tsx';
export * from './src/components/RichTextField.tsx';
export * from './src/components/datetime/Calendar.tsx';
export * from './src/components/datetime/TimeClock.tsx';

export * from './src/components/HelpTooltip.tsx';

```

### File: packages\fields\src\components\ComboboxField.tsx

```tsx
import '../styles/fields/combobox-field.css';
import { JSX } from 'preact';
import { computed, Signal, useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { ComboboxFieldProps } from '../types/components/combobox-field.ts';
import { SelectOption } from '../types/components/select-field.ts';
import { useInteraction } from '../hooks/useInteraction.ts';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { EffectWrapper } from '../wrappers/EffectWrapper.tsx';

export function ComboboxField<T = string>(props: ComboboxFieldProps<T>) {
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		options,
		error,
		disabled,
		placeholder,
		className,
		style,
		position,
		floatingRule,
		required,
		floating,
		hint,
		warning,
		info,
	} = props;

	const containerRef = useRef<HTMLDivElement>(null);
	const menuPosition = useSignal<'down' | 'up'>('down');
	const interaction = useInteraction(
		value instanceof Signal ? value.value : value,
	);
	const isOpen = useSignal(false);
	const inputValue = useSignal('');

	const isValueSignal = value instanceof Signal;
	const internalSignal = useSignal(
		isValueSignal ? value.peek() : (value ?? defaultValue),
	);

	if (!isValueSignal && value !== undefined && value !== internalSignal.peek()) {
		internalSignal.value = value;
	}

	const signalValue = isValueSignal ? value : internalSignal;
	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const errorMessage = error instanceof Signal ? error.value : error;

	if (signalValue.value && !inputValue.value) {
		const selected = options.find((opt) => opt.value === signalValue.value);
		if (selected) {
			inputValue.value = selected.label;
		}
	}

	const filteredOptions = computed(() => {
		const term = inputValue.value.toLowerCase();
		return options.filter((opt) => opt.label.toLowerCase().includes(term));
	});

	// --- Positioning Logic ---
	useEffect(() => {
		if (isOpen.value && containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect();
			const spaceBelow = window.innerHeight - rect.bottom;
			menuPosition.value = spaceBelow < 250 ? 'up' : 'down';
		}
	}, [isOpen.value]);

	const handleInput = (e: JSX.TargetedEvent<HTMLInputElement>) => {
		inputValue.value = e.currentTarget.value;
		isOpen.value = true;
	};

	const handleOptionClick = (option: SelectOption<T>) => {
		if (option.disabled) return;

		if (isValueSignal) {
			(value as Signal<T>).value = option.value;
		} else {
			internalSignal.value = option.value;
		}
		inputValue.value = option.label;
		onChange?.(option.value);
		isOpen.value = false;
	};

	return (
		<div
			className={`field-combobox ${className || ''} ${
				menuPosition.value === 'up' ? 'field-combobox--up' : ''
			}`}
			style={style}
			ref={containerRef}
		>
			<div
				className={[
					'field-combobox__container',
					interaction.focused.value &&
					'field-combobox__container--focused',
					errorMessage && 'field-combobox__container--error',
					isDisabled && 'field-combobox__container--disabled',
				].filter(Boolean).join(' ')}
			>
				<EffectWrapper
					focused={interaction.focused}
					disabled={isDisabled}
				/>

				<input
					id={id}
					className='field-combobox__input'
					value={inputValue.value}
					onInput={handleInput}
					onFocus={(e) => {
						interaction.handleFocus(e);
						isOpen.value = true;
					}}
					onBlur={(e) => {
						setTimeout(() => {
							isOpen.value = false;
							interaction.handleBlur(e);
						}, 200);
					}}
					disabled={!!isDisabled}
					placeholder={placeholder}
				/>

				<div
					className={`field-combobox__menu ${
						isOpen.value && filteredOptions.value.length > 0 ? 'field-combobox__menu--open' : ''
					}`}
				>
					{filteredOptions.value.map((option) => (
						<div
							key={String(option.value)}
							className={[
								'field-combobox__option',
								option.value === signalValue.value &&
								'field-combobox__option--selected',
								option.disabled &&
								'field-combobox__option--disabled',
							].filter(Boolean).join(' ')}
							onMouseDown={(e) => {
								e.preventDefault();
								handleOptionClick(option);
							}}
						>
							{option.label}
						</div>
					))}
					{filteredOptions.value.length === 0 && (
						<div
							className='field-combobox__option'
							style={{
								cursor: 'default',
								color: 'var(--field-text-disabled)',
							}}
						>
							No options found
						</div>
					)}
				</div>
			</div>

			<LabelWrapper
				id={id}
				label={label}
				active={interaction.focused.value || !!inputValue.value ||
					!!placeholder}
				error={!!errorMessage}
				disabled={isDisabled}
				required={required}
				floating={floating}
				position={position}
				floatingRule={floatingRule}
			/>

			<MessageWrapper error={error} hint={hint} warning={warning} info={info} />
		</div>
	);
}

```

### File: packages\fields\src\components\DateField.tsx

```tsx
import '../styles/fields/date-field.css';
import { computed, Signal, useSignal } from '@preact/signals';
import { DateFieldProps, DateValue } from '../types/components/date-field.ts';
import { useInteraction } from '../hooks/useInteraction.ts';
import { useFieldState } from '../hooks/useFieldState.ts';
import { AdornmentWrapper } from '../wrappers/AdornmentWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { DateTime } from '@projective/types';
import { Popover } from '@projective/ui';
import { Calendar } from './datetime/Calendar.tsx';
import { TextField } from './TextField.tsx';
import { IconCalendar } from '@tabler/icons-preact';

export function DateField(props: DateFieldProps) {
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		minDate,
		maxDate,
		format = 'yyyy-MM-dd',
		error,
		disabled,
		prefix,
		suffix,
		onPrefixClick,
		onSuffixClick,
		className,
		style,
		position,
		floatingRule,
		required,
		floating,
		hint,
		warning,
		info,
		variant = 'popup', // Default to existing behavior
		selectionMode = 'single',
		modifiers,
	} = props;

	const fieldState = useFieldState({
		value,
		defaultValue,
		required,
		disabled,
		error,
		onChange,
	});

	const interaction = useInteraction(fieldState.value.value);
	const isOpen = useSignal(false);

	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const errorMessage = fieldState.error.value;

	// Computed string value for the input display
	const displayValue = computed(() => {
		const val = fieldState.value.value;
		if (!val) return '';

		if (Array.isArray(val)) {
			// Range
			if (selectionMode === 'range' && val.length === 2) {
				const start = val[0] ? val[0].toFormat(format) : '...';
				const end = val[1] ? val[1].toFormat(format) : '...';
				return `${start} - ${end}`;
			}
			// Multiple
			if (selectionMode === 'multiple') {
				return `${val.length} dates selected`;
			}
		}
		// Single
		if (val instanceof DateTime) return val.toFormat(format);

		return '';
	});

	const handleDateSelect = (date: DateValue) => {
		fieldState.setValue(date);

		// Auto-close popover rules:
		// Single: Close on select
		// Range: Close if both start/end selected? Maybe keep open for adjustments.
		// Multiple: Keep open.
		if (selectionMode === 'single') {
			isOpen.value = false;
			interaction.handleBlur();
		}
	};

	// --- Render Logic Based on Variant ---

	if (variant === 'inline') {
		return (
			<div
				className={`field-date field-date--inline ${className || ''}`}
				style={style}
			>
				<Calendar
					value={fieldState.value.value}
					onChange={handleDateSelect}
					min={minDate}
					max={maxDate}
					selectionMode={selectionMode}
					modifiers={modifiers}
					className='field-date__calendar--inline'
				/>
				<MessageWrapper
					error={error}
					hint={hint}
					warning={warning}
					info={info}
				/>
			</div>
		);
	}

	// Default: Popup Mode
	return (
		<div className={`field-date ${className || ''}`} style={style}>
			<Popover
				isOpen={isOpen.value}
				onClose={() => {
					isOpen.value = false;
					interaction.handleBlur();
				}}
				// Forward position prop if we want manual control, otherwise let Popover auto-flip
				trigger={
					<div
						onClick={() => !isDisabled && (isOpen.value = !isOpen.value)}
					>
						<TextField
							id={id}
							label={label}
							value={displayValue.value}
							placeholder={format.toUpperCase()}
							error={errorMessage}
							disabled={isDisabled}
							required={required}
							floating={floating}
							position={position}
							floatingRule={floatingRule}
							readonly // Prevent manual typing for complex modes for now
							suffix={
								<AdornmentWrapper
									position='suffix'
									onClick={(e) => {
										e.stopPropagation();
										!isDisabled &&
											(isOpen.value = !isOpen.value);
									}}
								>
									{suffix || <IconCalendar size={18} />}
								</AdornmentWrapper>
							}
							prefix={prefix}
							onPrefixClick={onPrefixClick}
							onFocus={interaction.handleFocus}
							onBlur={() => {}}
						/>
					</div>
				}
				content={
					<Calendar
						value={fieldState.value.value}
						onChange={handleDateSelect}
						min={minDate}
						max={maxDate}
						selectionMode={selectionMode}
						modifiers={modifiers}
					/>
				}
			/>
			<MessageWrapper
				error={error}
				hint={hint}
				warning={warning}
				info={info}
			/>
		</div>
	);
}

```

### File: packages\fields\src\components\datetime\Calendar.tsx

```tsx
/* #region Imports */
import '../../styles/components/calendar.css';
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-preact';
import { DateTime } from '@projective/types';
import { DateModifiers, DateSelectionMode, DateValue } from '../../types/components/date-field.ts';
/* #endregion */

export interface CalendarProps {
	value?: DateValue;
	onChange?: (date: any) => void;
	min?: DateTime;
	max?: DateTime;
	startOfWeek?: 0 | 1;
	selectionMode?: DateSelectionMode;
	modifiers?: DateModifiers;
	className?: string;
}

type CalendarScope = 'day' | 'month' | 'year';

export function Calendar(props: CalendarProps) {
	const {
		value,
		onChange,
		min,
		max,
		startOfWeek = 1,
		selectionMode = 'single',
		modifiers = {},
		className,
	} = props;

	// #region State
	const viewDate = useSignal(new DateTime());
	const scope = useSignal<CalendarScope>('day');

	// Sync internal viewDate with the selected value on mount
	useEffect(() => {
		if (value) {
			if (value instanceof DateTime) {
				viewDate.value = value;
			} else if (Array.isArray(value) && value.length > 0) {
				const start = value[0];
				if (start) viewDate.value = start;
			}
		}
	}, []);
	// #endregion

	// #region Logic Helpers
	const isDateDisabled = (date: DateTime) => {
		if (min && date.isBefore(min.startOf('day'))) return true;
		if (max && date.isAfter(max.endOf('day'))) return true;
		return modifiers.disabled?.(date) ?? false;
	};

	// Helper to set date parts (since DateTime is immutable)
	const setDatePart = (base: DateTime, unit: 'month' | 'year', val: number) => {
		const d = new Date(base.getTime());
		if (unit === 'month') d.setMonth(val);
		if (unit === 'year') d.setFullYear(val);
		return new DateTime(d);
	};

	// --- Grid Generators ---
	const getCalendarGrid = (currentDate: DateTime, weekStart: 0 | 1) => {
		const startOfMonth = currentDate.startOf('month');
		const startDay = startOfMonth.getDay();

		let lead = startDay - weekStart;
		if (lead < 0) lead += 7;

		const startDate = startOfMonth.minus(lead, 'days');
		const grid = [];

		for (let i = 0; i < 42; i++) {
			const d = startDate.add(i, 'days');
			grid.push({
				date: d,
				isCurrentMonth: d.getMonth() === currentDate.getMonth(),
				isToday: d.isSameDay(DateTime.today()),
			});
		}
		return grid;
	};

	const getWeekLabels = (weekStart: 0 | 1) => {
		const base = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		if (weekStart === 1) {
			const sun = base.shift();
			base.push(sun!);
		}
		return base;
	};
	// #endregion

	// #region Handlers
	const handlePrev = (e: Event) => {
		e.stopPropagation();
		// FIX: Use plural units ('months', 'years') to match DateTime.ts
		if (scope.value === 'day') viewDate.value = viewDate.value.minus(1, 'months');
		else if (scope.value === 'month') viewDate.value = viewDate.value.minus(1, 'years');
		else if (scope.value === 'year') viewDate.value = viewDate.value.minus(10, 'years');
	};

	const handleNext = (e: Event) => {
		e.stopPropagation();
		// FIX: Use plural units ('months', 'years') to match DateTime.ts
		if (scope.value === 'day') viewDate.value = viewDate.value.add(1, 'months');
		else if (scope.value === 'month') viewDate.value = viewDate.value.add(1, 'years');
		else if (scope.value === 'year') viewDate.value = viewDate.value.add(10, 'years');
	};

	const handleTitleClick = (e: Event) => {
		e.stopPropagation();
		if (scope.value === 'day') scope.value = 'month';
		else if (scope.value === 'month') scope.value = 'year';
	};

	const handleDaySelect = (date: DateTime) => {
		if (selectionMode === 'single') {
			onChange?.(date);
		}
	};

	const handleMonthSelect = (monthIndex: number) => {
		viewDate.value = setDatePart(viewDate.value, 'month', monthIndex);
		scope.value = 'day';
	};

	const handleYearSelect = (year: number) => {
		viewDate.value = setDatePart(viewDate.value, 'year', year);
		scope.value = 'month';
	};
	// #endregion

	// #region Renderers
	const renderHeader = () => {
		let title = '';
		if (scope.value === 'day') title = viewDate.value.toFormat('MMMM yyyy');
		else if (scope.value === 'month') title = viewDate.value.toFormat('yyyy');
		else {
			const startYear = Math.floor(viewDate.value.getYear() / 10) * 10;
			title = `${startYear} - ${startYear + 9}`;
		}

		return (
			<div className='calendar__header'>
				<button type='button' className='calendar__nav-btn' onClick={handlePrev}>
					<IconChevronLeft size={18} />
				</button>
				<button type='button' className='calendar__title' onClick={handleTitleClick}>
					{title}
				</button>
				<button type='button' className='calendar__nav-btn' onClick={handleNext}>
					<IconChevronRight size={18} />
				</button>
			</div>
		);
	};

	const renderDays = () => {
		const grid = getCalendarGrid(viewDate.value, startOfWeek);
		const weekLabels = getWeekLabels(startOfWeek);

		return (
			<>
				<div className='calendar__weekdays'>
					{weekLabels.map((day) => <div key={day} className='calendar__weekday'>{day}</div>)}
				</div>
				<div className='calendar__grid calendar__grid--days'>
					{grid.map((dayItem, idx) => {
						const isDisabled = isDateDisabled(dayItem.date);
						let isSelected = false;
						if (value instanceof DateTime) isSelected = value.isSameDay(dayItem.date);

						const classes = [
							'calendar__day',
							isDisabled ? 'calendar__day--disabled' : '',
							!dayItem.isCurrentMonth ? 'calendar__day--muted' : '',
							dayItem.isToday ? 'calendar__day--today' : '',
							isSelected ? 'calendar__day--selected' : '',
						].filter(Boolean).join(' ');

						return (
							<button
								key={idx}
								type='button'
								className={classes}
								disabled={isDisabled}
								onClick={(e) => {
									e.stopPropagation();
									handleDaySelect(dayItem.date);
								}}
							>
								{dayItem.date.getDate()}
							</button>
						);
					})}
				</div>
			</>
		);
	};

	const renderMonths = () => {
		const months = Array.from({ length: 12 }, (_, i) => {
			const d = new DateTime(new Date(2000, i, 1));
			return d.toFormat('MMM');
		});

		const currentMonth = viewDate.value.getMonth() - 1;

		return (
			<div className='calendar__grid calendar__grid--months'>
				{months.map((m, idx) => (
					<button
						key={m}
						type='button'
						className={`calendar__cell-lg ${
							idx === currentMonth ? 'calendar__cell-lg--selected' : ''
						}`}
						onClick={(e) => {
							e.stopPropagation();
							handleMonthSelect(idx);
						}}
					>
						{m}
					</button>
				))}
			</div>
		);
	};

	const renderYears = () => {
		const currentYear = viewDate.value.getYear();
		const startYear = Math.floor(currentYear / 10) * 10;
		const years = Array.from({ length: 12 }, (_, i) => startYear - 1 + i);

		return (
			<div className='calendar__grid calendar__grid--years'>
				{years.map((y) => (
					<button
						key={y}
						type='button'
						className={`calendar__cell-lg ${
							y === currentYear ? 'calendar__cell-lg--selected' : ''
						} ${y < startYear || y > startYear + 9 ? 'calendar__day--muted' : ''}`}
						onClick={(e) => {
							e.stopPropagation();
							handleYearSelect(y);
						}}
					>
						{y}
					</button>
				))}
			</div>
		);
	};
	// #endregion

	return (
		<div className={`calendar ${className || ''}`}>
			{renderHeader()}
			<div className='calendar__body'>
				{scope.value === 'day' && renderDays()}
				{scope.value === 'month' && renderMonths()}
				{scope.value === 'year' && renderYears()}
			</div>
		</div>
	);
}

```

### File: packages\fields\src\components\datetime\TimeClock.tsx

```tsx
import '../../styles/components/time-clock.css';
import { useSignal } from '@preact/signals';
import { useRef } from 'preact/hooks';
import { DateTime } from '@projective/types';
import { getAngleValue, getPosition } from '@projective/utils';

export type TimeSelectionMode = 'single' | 'multiple';

interface TimeClockProps {
	value?: DateTime | DateTime[];
	onChange?: (date: any) => void;
	selectionMode?: TimeSelectionMode;
}

type ViewMode = 'hours' | 'minutes';

export function TimeClock(props: TimeClockProps) {
	const { value, onChange, selectionMode = 'single' } = props;

	// Helper to get the primary "view" date (for header display)
	const getPrimaryDate = () => {
		if (Array.isArray(value)) {
			return value.length > 0 ? value[value.length - 1] : new DateTime();
		}
		return value || new DateTime();
	};

	const displayDate = getPrimaryDate();

	// State
	const mode = useSignal<ViewMode>('hours');
	const isPm = useSignal(displayDate.getHour() >= 12);
	const isDragging = useSignal(false);
	const clockRef = useRef<HTMLDivElement>(null);

	// Display values
	const hours12 = displayDate.getHour() % 12 || 12;
	const minutes = displayDate.getMinute();

	// --- Handlers ---

	const updateValue = (newDate: DateTime, isFinish: boolean) => {
		let result: any;

		if (selectionMode === 'single') {
			result = newDate;
		} else {
			// Multi-select logic
			const current = (Array.isArray(value) ? value : (value ? [value] : [])) as DateTime[];

			// Check if we are toggling an existing time
			// We compare based on the current mode (Hour match or Minute match)
			// Simplification: For multi-time, we usually just add the new timestamp.
			// However, UX for multi-time on a clock is tricky.
			// We will assume "Add/Update" logic.

			// For this implementation, we replace the last entry if dragging,
			// or add new if clicking fresh?
			// To keep it simple: Multi-mode on a clock usually implies picking slots.
			// We will append if it doesn't exist, remove if it does (Toggle).

			// Check for exact hour/minute match in current array
			const existsIndex = current.findIndex((d) =>
				d.getHour() === newDate.getHour() && d.getMinute() === newDate.getMinute()
			);

			if (existsIndex >= 0) {
				if (isFinish) {
					// Toggle off on release
					result = current.filter((_, i) => i !== existsIndex);
				} else {
					result = current; // Don't toggle while dragging
				}
			} else {
				result = [...current, newDate];
			}
		}

		onChange?.(result);

		// Auto-switch to minutes only in single mode
		if (isFinish && mode.value === 'hours' && selectionMode === 'single') {
			mode.value = 'minutes';
		}
	};

	const handlePointer = (e: PointerEvent, isFinish: boolean) => {
		if (!clockRef.current) return;

		const rect = clockRef.current.getBoundingClientRect();
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;
		const x = e.clientX - rect.left - centerX;
		const y = e.clientY - rect.top - centerY;

		const steps = mode.value === 'hours' ? 12 : 60;
		let val = getAngleValue(x, y, steps);

		// Calculate new date based on primary
		const d = new Date(displayDate.getTime());

		if (mode.value === 'hours') {
			if (isPm.value && val < 12) val += 12;
			if (!isPm.value && val === 12) val = 0;
			d.setHours(val);
		} else {
			d.setMinutes(val);
		}

		const newDateTime = new DateTime(d);
		updateValue(newDateTime, isFinish);
	};

	const toggleAmPm = (pm: boolean) => {
		isPm.value = pm;
		// Update ALL selected dates or just display?
		// Usually AM/PM toggles the context for future clicks.
		// For single value, we update immediately.
		if (selectionMode === 'single') {
			let h = displayDate.getHour();
			if (pm && h < 12) h += 12;
			if (!pm && h >= 12) h -= 12;

			const d = new Date(displayDate.getTime());
			d.setHours(h);
			onChange?.(new DateTime(d));
		}
	};

	// --- Rendering ---

	const renderFace = () => {
		const total = mode.value === 'hours' ? 12 : 12; // 12 visual segments
		const numbers = [];
		const radius = 100;

		// Determine highlighted values
		const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);

		for (let i = 1; i <= total; i++) {
			const numVal = mode.value === 'hours' ? i : i * 5;
			const pos = getPosition(i, 12, radius);

			// Check if this number is selected
			let isActive = false;
			let isMulti = false;

			if (mode.value === 'hours') {
				// Match hour (considering AM/PM context of the toggle)
				// We highlight if ANY selected date matches this hour in current AM/PM context
				const checkHour = isPm.value ? (i === 12 ? 12 : i + 12) : (i === 12 ? 0 : i);

				isActive = selectedValues.some((d) => d.getHour() === checkHour);
			} else {
				// Match minute (rough match for 5-min intervals)
				const checkMin = numVal === 60 ? 0 : numVal;
				isActive = selectedValues.some((d) => Math.round(d.getMinute() / 5) * 5 === checkMin);
			}

			// Style distinction for primary vs multi
			if (isActive) {
				const isPrimary = mode.value === 'hours'
					? (displayDate.getHour() % 12 || 12) === i
					: Math.round(displayDate.getMinute() / 5) * 5 === numVal;
				if (!isPrimary && selectionMode === 'multiple') isMulti = true;
			}

			numbers.push(
				<div
					key={i}
					className={`clock__number ${isActive ? 'clock__number--active' : ''} ${
						isMulti ? 'clock__number--multi' : ''
					}`}
					style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
				>
					{numVal === 60 ? '00' : numVal}
				</div>,
			);
		}

		// Hand logic (only points to primary display value)
		const currentVal = mode.value === 'hours' ? hours12 : minutes;
		const handSteps = mode.value === 'hours' ? 12 : 60;
		const handPos = getPosition(
			currentVal === 0 && mode.value === 'hours' ? 12 : currentVal,
			handSteps,
			radius,
		);

		return (
			<div
				className='clock__face'
				ref={clockRef}
				onPointerDown={(e) => {
					e.preventDefault();
					clockRef.current?.setPointerCapture(e.pointerId);
					isDragging.value = true;
					handlePointer(e, false);
				}}
				onPointerMove={(e) => {
					if (isDragging.value) handlePointer(e, false);
				}}
				onPointerUp={(e) => {
					clockRef.current?.releasePointerCapture(e.pointerId);
					isDragging.value = false;
					handlePointer(e, true);
				}}
			>
				<div className='clock__center-dot'></div>
				<div
					className='clock__hand'
					style={{
						height: `${radius}px`,
						transform: `rotate(${Math.atan2(handPos.y, handPos.x) * (180 / Math.PI) + 90}deg)`,
					}}
				>
					<div className='clock__hand-knob'></div>
				</div>
				{numbers}
			</div>
		);
	};

	return (
		<div className='time-clock'>
			<div className='time-clock__header'>
				<div className='time-clock__digital'>
					<button
						type='button'
						className={`time-clock__val ${mode.value === 'hours' ? 'time-clock__val--active' : ''}`}
						onClick={() => mode.value = 'hours'}
					>
						{hours12.toString().padStart(2, '0')}
					</button>
					<span className='time-clock__sep'>:</span>
					<button
						type='button'
						className={`time-clock__val ${
							mode.value === 'minutes' ? 'time-clock__val--active' : ''
						}`}
						onClick={() => mode.value = 'minutes'}
					>
						{minutes.toString().padStart(2, '0')}
					</button>
				</div>

				<div className='time-clock__ampm'>
					<button
						type='button'
						className={`time-clock__meridiem ${!isPm.value ? 'time-clock__meridiem--active' : ''}`}
						onClick={() => toggleAmPm(false)}
					>
						AM
					</button>
					<button
						type='button'
						className={`time-clock__meridiem ${isPm.value ? 'time-clock__meridiem--active' : ''}`}
						onClick={() => toggleAmPm(true)}
					>
						PM
					</button>
				</div>
			</div>

			<div className='time-clock__body'>
				{renderFace()}
			</div>
		</div>
	);
}

```

### File: packages\fields\src\components\DateTimeField.tsx

```tsx
import '../styles/components/datetime-field.css';
import { Signal, useSignal } from '@preact/signals';
import { IconCalendar, IconClock } from '@tabler/icons-preact';
import { DateTime } from '@projective/types';
import { DateTimeFieldProps } from '../types/components/datetime-field.ts';
import { TextField } from './TextField.tsx';
import { Calendar } from './datetime/Calendar.tsx';
import { TimeClock } from './datetime/TimeClock.tsx';
import { Popover } from '@projective/ui';

type TabView = 'date' | 'time';

export function DateTimeField(props: DateTimeFieldProps) {
	const {
		value,
		defaultValue,
		onChange,
		min,
		max,
		placeholder,
		...rest
	} = props;

	const isOpen = useSignal(false);
	const activeTab = useSignal<TabView>('date');
	const inputValue = useSignal('');

	// Normalize signal
	const isValueSignal = value instanceof Signal;
	const internalSignal = useSignal(
		isValueSignal ? value.peek() : (value ?? defaultValue),
	);

	if (
		!isValueSignal && value !== undefined && value !== internalSignal.peek()
	) {
		internalSignal.value = value;
	}

	const signalValue = isValueSignal ? value : internalSignal;

	// --- Format Helper ---
	const formatValue = (val?: DateTime) => {
		if (!val) return '';
		return val.toFormat('dd/MM/yyyy HH:mm');
	};

	// Sync Input (Unidirectional)
	// We watch signalValue
	const currentVal = signalValue.value;
	if (currentVal && !isOpen.value) {
		const formatted = formatValue(currentVal);
		if (inputValue.value !== formatted) inputValue.value = formatted;
	}

	// --- State Logic ---

	const updateDatePart = (newDate: DateTime) => {
		const current = signalValue.value || new DateTime();

		const d = new Date(current.getTime());
		d.setFullYear(newDate.getYear());
		d.setMonth(newDate.getMonth() - 1);
		d.setDate(newDate.getDate());

		const nextVal = new DateTime(d);

		if (isValueSignal) {
			(value as Signal<DateTime>).value = nextVal;
		} else {
			internalSignal.value = nextVal;
		}
		onChange?.(nextVal);
		inputValue.value = formatValue(nextVal);

		activeTab.value = 'time';
	};

	const updateTimePart = (newTime: DateTime) => {
		const current = signalValue.value || new DateTime();

		const d = new Date(current.getTime());
		d.setHours(newTime.getHour());
		d.setMinutes(newTime.getMinute());

		const nextVal = new DateTime(d);

		if (isValueSignal) {
			(value as Signal<DateTime>).value = nextVal;
		} else {
			internalSignal.value = nextVal;
		}
		onChange?.(nextVal);
		inputValue.value = formatValue(nextVal);
	};

	const handleInputChange = (val: string) => {
		inputValue.value = val;
		if (val === '') {
			// Handle clear
			// We can't set undefined to DateTime signal easily if strict?
			// But ValueFieldProps<DateTime> implies it might be undefined?
			// Let's assume we can set it to undefined if the type allows.
			// But signalValue is Signal<DateTime | undefined> (inferred).
			// Actually internalSignal is initialized with value ?? defaultValue.
			// If both undefined, it's Signal<undefined>.

			// If we want to support clearing:
			// if (isValueSignal) (value as Signal<DateTime | undefined>).value = undefined;
			// else internalSignal.value = undefined;
			// onChange?.(undefined);
			return;
		}
		try {
			const dt = new DateTime(val, 'dd/MM/yyyy HH:mm', true);
			// Check validity? DateTime constructor throws if invalid format?
			// Assuming it's valid if no throw.

			if (isValueSignal) {
				(value as Signal<DateTime>).value = dt;
			} else {
				internalSignal.value = dt;
			}
			onChange?.(dt);
		} catch {
			// Ignore invalid dates
		}
	};

	// Tabs Header
	const renderTabs = () => (
		<div className='datetime-field__tabs'>
			<button
				type='button'
				className={`datetime-field__tab ${
					activeTab.value === 'date' ? 'datetime-field__tab--active' : ''
				}`}
				onClick={() => activeTab.value = 'date'}
			>
				<IconCalendar size={16} />
				<span>Date</span>
				<span className='datetime-field__tab-val'>
					{signalValue.value ? signalValue.value.toFormat('dd MMM') : '--'}
				</span>
			</button>

			<button
				type='button'
				className={`datetime-field__tab ${
					activeTab.value === 'time' ? 'datetime-field__tab--active' : ''
				}`}
				onClick={() => activeTab.value = 'time'}
			>
				<IconClock size={16} />
				<span>Time</span>
				<span className='datetime-field__tab-val'>
					{signalValue.value ? signalValue.value.toFormat('HH:mm') : '--:--'}
				</span>
			</button>
		</div>
	);

	return (
		<div className='datetime-field'>
			<Popover
				isOpen={isOpen.value}
				onClose={() => isOpen.value = false}
				trigger={
					<TextField
						name='datetime-field'
						{...rest}
						type='text'
						placeholder={placeholder || 'DD/MM/YYYY HH:mm'}
						value={inputValue.value}
						onInput={(e) => handleInputChange(e.currentTarget.value)}
						suffix={
							<button
								type='button'
								className='datetime-field__icon-btn'
								onClick={(e) => {
									e.preventDefault();
									isOpen.value = !isOpen.value;
								}}
								tabIndex={-1}
							>
								<IconCalendar size={18} />
							</button>
						}
						onFocus={() => isOpen.value = true}
					/>
				}
				content={
					<div className='datetime-field__popup'>
						{renderTabs()}

						<div className='datetime-field__body'>
							{activeTab.value === 'date'
								? (
									<Calendar
										value={signalValue.value}
										onChange={(v) => {
											if (v instanceof DateTime) {
												updateDatePart(v);
											}
										}}
										min={min}
										max={max}
										className='datetime-field__calendar'
									/>
								)
								: (
									<div className='datetime-field__clock-wrapper'>
										<TimeClock
											value={signalValue.value}
											onChange={updateTimePart}
										/>
									</div>
								)}
						</div>
					</div>
				}
			/>
		</div>
	);
}

```

### File: packages\fields\src\components\FileDrop.tsx

```tsx
/* #region Imports */
import '../styles/fields/file-drop.css';
import { JSX } from 'preact';
import { useSignal } from '@preact/signals';
import {
	IconBooks,
	IconCloudUpload,
	IconFile,
	IconFilePlus,
	IconLoader2,
	IconPhoto,
	IconRefresh,
	IconTrash,
} from '@tabler/icons-preact';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { FileWithMeta, getFileCategory } from '@projective/types';
import { FileFieldProps } from '../types/file.ts';
import { TargetedEvent } from 'preact';
import { toast } from '@projective/ui'; // Required for notifications
/* #endregion */

export function FileDrop(props: FileFieldProps) {
	const {
		id,
		label,
		value,
		onChange,
		accept,
		multiple,
		disabled,
		className,
		style,
		error,
		required,
		variant = 'split',
		listPosition = 'below',
		onLibraryClick,
		maxSize = 10 * 1024 * 1024,
		maxFiles = 10,
		floatingRule = 'never',
		actionPosition = 'below',
	} = props;

	const isDragging = useSignal(false);
	const inputRef = useSignal<HTMLInputElement | null>(null);

	const files = value?.value || [];

	// #region Helpers
	const processFiles = (incomingFiles: File[]) => {
		if (disabled) return;

		let validFiles = incomingFiles;

		// 1. Validate File Type (Accept) - CRITICAL FOR DRAG & DROP
		if (accept) {
			const acceptedTypes = accept.split(',').map((t) => t.trim().toLowerCase());

			validFiles = validFiles.filter((f) => {
				const fType = f.type.toLowerCase();
				const fName = f.name.toLowerCase();

				const isValid = acceptedTypes.some((type) => {
					// Check extension (e.g., .png)
					if (type.startsWith('.')) return fName.endsWith(type);
					// Check mime type (e.g., image/*)
					if (type.endsWith('/*')) return fType.startsWith(type.replace('/*', ''));
					// Check exact mime type (e.g., image/png)
					return fType === type;
				});

				if (!isValid) {
					toast.error(`File "${f.name}" format is not supported.`);
					return false;
				}
				return true;
			});
		}

		// 2. Validate Max Files
		if (!multiple && validFiles.length > 1) {
			// If single mode, just take the last one dropped
			validFiles = [validFiles[validFiles.length - 1]];
		} else if (multiple && (files.length + validFiles.length) > maxFiles) {
			const slotsRemaining = maxFiles - files.length;
			if (slotsRemaining <= 0) {
				toast.error(`Maximum file limit (${maxFiles}) reached.`);
				return;
			}

			toast.warning(`Limit exceeded. Only adding ${slotsRemaining} file(s).`);
			validFiles = validFiles.slice(0, slotsRemaining);
		}

		// 3. Validate Size
		validFiles = validFiles.filter((f) => {
			if (f.size > maxSize) {
				const sizeMb = Math.round(maxSize / 1024 / 1024);
				toast.error(`"${f.name}" is too large (Max ${sizeMb}MB).`);
				return false;
			}
			return true;
		});

		if (validFiles.length === 0) return;

		// 4. Create FileWithMeta
		const processed: FileWithMeta[] = validFiles.map((f) => ({
			file: f,
			id: crypto.randomUUID(),
			status: 'pending',
			progress: 0,
			errors: [],
			type: getFileCategory(f),
			meta: {
				uploadedAt: new Date().toISOString(),
			},
		}));

		if (onChange) {
			if (multiple) {
				onChange([...files, ...processed]);
			} else {
				// Replace in single mode
				onChange([processed[processed.length - 1]]);
			}
		}
	};

	const handleRemove = (fileId: string, e?: Event) => {
		e?.stopPropagation();
		if (onChange) {
			onChange(files.filter((f) => f.id !== fileId));
		}
	};
	// #endregion

	// #region Event Handlers
	const handleDragEnter = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (!disabled) isDragging.value = true;
	};

	const handleDragLeave = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();

		// Fix: Only disable dragging if we actually left the container
		// (prevents flickering when dragging over child elements like icons)
		const container = e.currentTarget as HTMLElement;
		const enteringElement = e.relatedTarget as HTMLElement;

		if (!container.contains(enteringElement)) {
			isDragging.value = false;
		}
	};

	const handleDrop = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		isDragging.value = false;

		if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
			processFiles(Array.from(e.dataTransfer.files));
			e.dataTransfer.clearData();
		}
	};

	const handleFileInput = (e: JSX.TargetedEvent<HTMLInputElement>) => {
		if (e.currentTarget.files) {
			processFiles(Array.from(e.currentTarget.files));
			e.currentTarget.value = '';
		}
	};

	const triggerUpload = () => inputRef.value?.click();
	// #endregion

	// #region Renderers
	const renderIcon = (file: FileWithMeta) => {
		if (file.status === 'processing') {
			return <IconLoader2 size={24} className='file-drop__spinner' />;
		}
		if (file.type === 'Image') return <IconPhoto size={24} />;
		return <IconFile size={24} />;
	};

	const renderFileList = () => (
		<div className='file-drop__list'>
			{files.map((file) => (
				<div key={file.id} className='file-drop__item'>
					{file.status === 'processing' && (
						<div className='file-drop__progress-bg' style={{ width: `${file.progress}%` }} />
					)}

					<div className='file-drop__item-info'>
						{file.type === 'Image'
							? (
								<img
									src={URL.createObjectURL(file.file)}
									className='file-drop__preview-thumb'
									alt={file.file.name}
								/>
							)
							: (
								<div style={{ color: 'var(--text-secondary)' }}>
									{renderIcon(file)}
								</div>
							)}

						<div className='file-drop__meta'>
							<span className='file-drop__filename'>{file.file.name}</span>
							<span className='file-drop__filesize'>
								{(file.file.size / 1024 / 1024).toFixed(2)} MB
								{file.status === 'processing' && ` • ${Math.round(file.progress)}%`}
								{file.status === 'error' && (
									<span style={{ color: 'var(--error-500)' }}>• Failed</span>
								)}
							</span>
						</div>
					</div>

					<button
						type='button'
						className='file-drop__remove'
						onClick={(e) => handleRemove(file.id!, e)}
						title='Remove file'
					>
						<IconTrash size={18} />
					</button>
				</div>
			))}
		</div>
	);

	const renderSinglePreview = (file: FileWithMeta) => (
		<div
			className={`file-drop__container ${disabled ? 'file-drop__container--disabled' : ''}`}
			style={{ flexDirection: 'column', height: 'auto', padding: 0 }}
		>
			<div className={`file-drop__single-preview file-drop__single-preview--${actionPosition}`}>
				<img
					src={URL.createObjectURL(file.file)}
					className='file-drop__single-img'
					alt='Preview'
				/>

				{actionPosition === 'overlay' && (
					<button type='button' className='file-drop__change-btn' onClick={triggerUpload}>
						<IconRefresh size={32} />
						<span>Change Image</span>
					</button>
				)}
			</div>

			{actionPosition === 'below' && (
				<button
					type='button'
					className='file-drop__remove-bar'
					onClick={() => handleRemove(file.id!)}
				>
					<IconTrash size={16} /> Remove & Change
				</button>
			)}
		</div>
	);
	// #endregion

	const hasSingleFile = !multiple && files.length > 0;

	return (
		<div className={`field-file ${className || ''}`} style={style}>
			<LabelWrapper
				id={id}
				label={label}
				disabled={disabled}
				required={required}
				error={!!error}
				floatingRule={floatingRule}
			/>

			{/* LIST ABOVE */}
			{listPosition === 'top' && multiple && files.length > 0 && renderFileList()}

			{/* DROPZONE OR SINGLE PREVIEW */}
			{hasSingleFile
				? (
					renderSinglePreview(files[0])
				)
				: (
					<div
						className={[
							'file-drop__container',
							disabled && 'file-drop__container--disabled',
							!!error && 'file-drop__container--error',
							variant === 'single' && 'file-drop__container--single',
						].filter(Boolean).join(' ')}
						onDragEnter={handleDragEnter}
						onDragOver={(e) => {
							e.preventDefault();
							e.stopPropagation();
						}}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						onClick={variant === 'single' ? triggerUpload : undefined}
					>
						<input
							ref={(el) => (inputRef.value = el) as any}
							type='file'
							id={id}
							multiple={multiple}
							accept={accept}
							onChange={handleFileInput}
							style={{ display: 'none' }}
						/>

						{isDragging.value && (
							<div className='file-drop__overlay'>
								<div className='file-drop__overlay-content'>
									<IconFilePlus size={48} />
									<span>Drop files to add them</span>
								</div>
							</div>
						)}

						{variant === 'split' && (
							<>
								<div
									className='file-drop__split-action'
									onClick={(e) => {
										e.stopPropagation();
										triggerUpload();
									}}
								>
									<IconCloudUpload size={32} stroke={1.5} />
									<div>
										<div className='file-drop__label'>Upload from Device</div>
										<div className='file-drop__sub'>JPG, PNG, PDF (Max 10MB)</div>
									</div>
								</div>
								<div className='file-drop__divider' />
								<div
									className='file-drop__split-action'
									onClick={(e) => {
										e.stopPropagation();
										onLibraryClick?.();
									}}
								>
									<IconBooks size={32} stroke={1.5} />
									<div>
										<div className='file-drop__label'>Select from Library</div>
										<div className='file-drop__sub'>Reuse existing assets</div>
									</div>
								</div>
							</>
						)}

						{variant === 'single' && (
							<div className='file-drop__split-action' style={{ width: '100%', border: 'none' }}>
								<IconCloudUpload size={32} stroke={1.5} />
								<div className='file-drop__label'>Click to Upload</div>
							</div>
						)}
					</div>
				)}

			{/* LIST BELOW */}
			{listPosition === 'below' && multiple && files.length > 0 && renderFileList()}
		</div>
	);
}

```

### File: packages\fields\src\components\HelpTooltip.tsx

```tsx
import { JSX } from 'preact';
import { IconHelp } from '@tabler/icons-preact';
import '../styles/components/help-tooltip.css';

export interface HelpTooltipProps {
	/** The content to show in the tooltip */
	content: string | JSX.Element;
	/** Optional link to navigate to on click */
	href?: string;
	/** Optional override for the icon */
	icon?: JSX.Element;
	className?: string;
	style?: JSX.CSSProperties;
}

export function HelpTooltip({ content, href, icon, className, style }: HelpTooltipProps) {
	const Icon = icon || <IconHelp size={16} />;

	// If it's a link, we render an anchor tag
	if (href) {
		return (
			<a
				href={href}
				target='_blank'
				rel='noopener noreferrer'
				className={`help-tooltip ${className || ''}`}
				style={style}
				onClick={(e) => e.stopPropagation()} // Prevent triggering parent label clicks
			>
				<span className='help-tooltip__icon'>{Icon}</span>
				<span className='help-tooltip__popup'>
					{content}
					<span className='help-tooltip__arrow' />
				</span>
			</a>
		);
	}

	// Otherwise, just a span
	return (
		<span className={`help-tooltip ${className || ''}`} style={style}>
			<span className='help-tooltip__icon'>{Icon}</span>
			<span className='help-tooltip__popup'>
				{content}
				<span className='help-tooltip__arrow' />
			</span>
		</span>
	);
}

```

### File: packages\fields\src\components\MoneyField.tsx

```tsx
import { JSX } from 'preact';
import { Signal, useSignal } from '@preact/signals';
import { MoneyFieldProps } from '../types/components/money-field.ts';
import { TextField } from './TextField.tsx';
import { useCurrencyMask } from '../hooks/useCurrencyMask.ts';

export function MoneyField(props: MoneyFieldProps) {
	const {
		value,
		defaultValue,
		onChange,
		currency = 'USD',
		locale = 'en-US',
		...rest
	} = props;

	// Normalize signal
	const isValueSignal = value instanceof Signal;
	const internalSignal = useSignal(
		isValueSignal ? value.peek() : (value ?? defaultValue),
	);

	if (!isValueSignal && value !== undefined && value !== internalSignal.peek()) {
		internalSignal.value = value;
	}

	const signalValue = isValueSignal ? value : internalSignal;

	const { displayValue, handleBlur, handleFocus, handleChange } = useCurrencyMask(
		signalValue as Signal<number | undefined>,
		currency,
		locale,
	);

	return (
		<TextField
			{...rest}
			value={displayValue}
			onInput={(e: JSX.TargetedEvent<HTMLInputElement>) => {
				handleChange(e.currentTarget.value);
				const val = signalValue.peek();
				if (val !== undefined) {
					onChange?.(val);
				}
			}}
			onBlur={() => {
				handleBlur();
			}}
			onFocus={() => {
				handleFocus();
			}}
			prefix={
				<span style={{ fontSize: '0.9em', fontWeight: 'bold' }}>
					{new Intl.NumberFormat(locale, {
						style: 'currency',
						currency,
					}).formatToParts(0).find((p) => p.type === 'currency')
						?.value}
				</span>
			}
		/>
	);
}

```

### File: packages\fields\src\components\RichTextField.tsx

```tsx
/* #region Imports */
import '../styles/fields/rich-text-field.css';
import { useEffect, useRef } from 'preact/hooks';
import { Signal, useComputed, useSignal } from '@preact/signals';
import { RichTextFieldProps } from '../types/components/rich-text-field.ts';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
/* #endregion */

let Quill: any = null;

/**
 * @function RichTextField
 * @description A high-performance rich text editor powered by Quill, integrated
 * with the projective design system.
 * * @param {RichTextFieldProps} props - Component properties.
 * @returns {JSX.Element}
 */
export function RichTextField(props: RichTextFieldProps) {
	// #region State & Destructuring
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		outputFormat = 'delta',
		toolbar = 'basic',
		variant = 'framed',
		secureLinks = true,
		placeholder,
		readOnly,
		onImageUpload,
		error,
		hint,
		warning,
		info,
		disabled,
		required,
		minHeight = '150px',
		maxHeight,
		maxLength,
		showCount,
		className,
		style,
	} = props;

	const editorRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const quillInstance = useRef<any>(null);
	const parserRef = useRef<any>(null);

	const length = useSignal(0);

	const getRawValue = () => {
		if (value instanceof Signal) return value.value;
		return value || defaultValue || '';
	};

	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const isReadOnly = !!readOnly || isDisabled;
	const isError = error instanceof Signal ? error.value : error;
	const isWarning = warning instanceof Signal ? warning.value : warning;

	const isOverLimit = useComputed(() => maxLength ? length.value > maxLength : false);
	// #endregion

	// #region Helper Logic: Links & Images
	/**
	 * @function registerSecureLink
	 * @description Sanitizes and secures link creation within the editor.
	 */
	const registerSecureLink = (QuillArg: any) => {
		const Link = QuillArg.import('formats/link');
		class SecureLink extends Link {
			static create(value: string) {
				const node = super.create(value);
				value = this.sanitize(value);
				node.setAttribute('href', value);
				node.setAttribute('rel', 'noopener noreferrer');
				node.setAttribute('target', '_blank');
				return node;
			}
			static sanitize(url: string) {
				const protocol = url.slice(0, url.indexOf(':'));
				if (['javascript', 'vbscript', 'data'].includes(protocol.toLowerCase())) {
					return 'about:blank';
				}
				return super.sanitize(url);
			}
		}
		if (secureLinks) {
			QuillArg.register(SecureLink, true);
		}
	};

	const insertImage = (url: string) => {
		const quill = quillInstance.current;
		if (!quill) return;
		const range = quill.getSelection(true);
		quill.insertEmbed(range.index, 'image', url);
		quill.setSelection(range.index + 1);
	};

	const handleFiles = async (files: FileList | File[]) => {
		if (!onImageUpload) return;
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			if (file.type.startsWith('image/')) {
				try {
					const url = await onImageUpload(file);
					insertImage(url);
				} catch (err) {
					console.error('Image upload failed', err);
				}
			}
		}
	};

	const imageHandler = () => {
		const input = document.createElement('input');
		input.setAttribute('type', 'file');
		input.setAttribute('accept', 'image/*');
		input.click();

		input.onchange = () => {
			if (input.files && input.files[0]) {
				if (onImageUpload) {
					handleFiles([input.files[0]]);
				} else {
					const reader = new FileReader();
					reader.onload = (e) => {
						insertImage(e.target?.result as string);
					};
					reader.readAsDataURL(input.files[0]);
				}
			}
		};
	};
	// #endregion

	// #region Lifecycle: Quill Initialization
	useEffect(() => {
		if (typeof window === 'undefined' || !editorRef.current) return;

		const init = async () => {
			if (!Quill) {
				const mod = await import('quill');
				Quill = mod.default;
				registerSecureLink(Quill);
			}

			if (!parserRef.current) {
				const { MarkdownParser } = await import('../../../utils/QuillParser.ts');
				parserRef.current = new MarkdownParser();
			}

			if (quillInstance.current) {
				if (quillInstance.current.isEnabled() === isReadOnly) {
					quillInstance.current.enable(!isReadOnly);
				}
				return;
			}

			let toolbarConfig = toolbar;
			if (toolbar === 'basic') {
				toolbarConfig = [
					['bold', 'italic', 'underline', 'strike'],
					['link', 'blockquote'],
					[{ 'list': 'ordered' }, { 'list': 'bullet' }],
					['clean'],
				];
			} else if (toolbar === 'full') {
				toolbarConfig = [
					[{ 'header': [1, 2, 3, false] }],
					['bold', 'italic', 'underline', 'strike'],
					[{ 'color': [] }, { 'background': [] }],
					[{ 'script': 'sub' }, { 'script': 'super' }],
					['link', 'blockquote', 'code-block', 'image'],
					[{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
					[{ 'align': [] }],
					['clean'],
				];
			}

			const modules = {
				toolbar: isReadOnly ? false : {
					container: toolbarConfig,
					handlers: { image: imageHandler },
				},
			};

			quillInstance.current = new Quill(editorRef.current, {
				theme: 'snow',
				modules,
				placeholder: isReadOnly ? '' : placeholder,
				readOnly: isReadOnly,
			});

			const toolbarC = containerRef.current?.querySelector('.ql-toolbar');
			if (toolbarC) {
				const controls = toolbarC.querySelectorAll('button, select');
				controls.forEach((control) => control.setAttribute('tabindex', '-1'));
			}

			if (!isReadOnly) {
				quillInstance.current.root.addEventListener('drop', (e: DragEvent) => {
					if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
						e.preventDefault();
						handleFiles(e.dataTransfer.files);
					}
				});
			}

			const raw = getRawValue();
			if (raw) {
				try {
					if (typeof raw === 'object' && raw !== null) {
						quillInstance.current.setContents(raw);
					} else if (typeof raw === 'string') {
						const trimmed = raw.trim();
						if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
							quillInstance.current.setContents(JSON.parse(trimmed));
						} else if (trimmed.startsWith('<')) {
							const delta = quillInstance.current.clipboard.convert(trimmed);
							quillInstance.current.setContents(delta);
						} else {
							if (parserRef.current) {
								parserRef.current.markdownToDelta(raw).then((delta: any) => {
									quillInstance.current.setContents(delta);
								});
							} else {
								quillInstance.current.setText(raw);
							}
						}
					}
				} catch {
					quillInstance.current.setText(String(raw));
				}
			}

			length.value = Math.max(0, quillInstance.current.getLength() - 1);

			quillInstance.current.on('text-change', () => {
				const delta = quillInstance.current.getContents();
				length.value = Math.max(0, quillInstance.current.getLength() - 1);

				let output = '';
				if (outputFormat === 'delta') output = JSON.stringify(delta);
				else if (outputFormat === 'html') output = quillInstance.current.root.innerHTML;
				else if (outputFormat === 'markdown' && parserRef.current) {
					output = parserRef.current.deltaToMarkdown(delta);
				}

				if (value instanceof Signal) value.value = output;
				onChange?.(output);
			});
		};

		init();
	}, [isReadOnly]);
	// #endregion

	// #region Render
	return (
		<div
			className={`field-rich-text field-rich-text--${variant} ${
				isReadOnly ? 'field-rich-text--readonly' : ''
			} ${className || ''}`}
			style={style}
		>
			<LabelWrapper
				id={id}
				label={label}
				required={required}
				error={!!isError}
				disabled={isDisabled}
				position='top'
				floatingRule='never'
			/>

			<div
				ref={containerRef}
				className={`field-rich-text__container ${
					isError ? 'field-rich-text__container--error' : ''
				} ${isWarning ? 'field-rich-text__container--warning' : ''}`}
			>
				<div
					ref={editorRef}
					style={{
						minHeight: variant === 'inline' ? 'auto' : minHeight,
						maxHeight: maxHeight,
					}}
				/>
			</div>

			<div style={{ display: 'flex', justifyContent: 'space-between' }}>
				<div style={{ flex: 1 }}>
					<MessageWrapper error={error} hint={hint} warning={warning} info={info} />
				</div>

				{showCount && (
					<div
						className={`field-rich-text__count ${
							isOverLimit.value ? 'field-rich-text__count--limit' : ''
						}`}
					>
						{length}/{maxLength || '∞'}
					</div>
				)}
			</div>
		</div>
	);
	// #endregion
}

```

### File: packages\fields\src\components\SelectField.tsx

```tsx
import '../styles/fields/select-field.css';
import { computed, Signal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { IconCheck, IconChevronDown, IconLoader2, IconSelector, IconX } from '@tabler/icons-preact';
import { SelectFieldProps, SelectOption } from '../types/components/select-field.ts';
import { FlatOption, useSelectState } from '../hooks/useSelectState.ts';
import { useInteraction } from '../hooks/useInteraction.ts';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { EffectWrapper, useRipple } from '../wrappers/EffectWrapper.tsx';

export function SelectField<T = string>(props: SelectFieldProps<T>) {
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		options,
		error,
		disabled,
		placeholder,
		className,
		style,
		position,
		floatingRule,
		required,
		floating,
		hint,
		warning,
		info,
		multiple,
		searchable,
		clearable,
		loading,
		displayMode = 'chips-inside',
		enableSelectAll,
		groupSelectMode = 'value',
		icons,
	} = props;

	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLDivElement>(null);

	const interaction = useInteraction(
		value instanceof Signal ? value.value : value,
	);
	const { ripples, addRipple } = useRipple();

	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const errorMessage = error instanceof Signal ? error.value : error;

	const {
		isOpen,
		highlightedIndex,
		searchQuery,
		filteredOptions,
		selectedValues,
		toggleOpen,
		selectOption,
		removeValue,
		toggleSelectAll,
		handleKeyDown,
	} = useSelectState({
		options,
		value,
		onChange,
		multiple,
		disabled: !!isDisabled,
		groupSelectMode,
	});

	// --- Positioning Logic ---
	useEffect(() => {
		if (isOpen.value && containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect();
			const spaceBelow = window.innerHeight - rect.bottom;
			if (containerRef.current.classList.contains('field-select--up')) {
				if (spaceBelow > 250) containerRef.current.classList.remove('field-select--up');
			} else {
				if (spaceBelow < 250) containerRef.current.classList.add('field-select--up');
			}

			if (searchable && inputRef.current) {
				inputRef.current.focus();
			}

			if (listRef.current && highlightedIndex.value >= 0) {
				const highlightedEl = listRef.current.children[highlightedIndex.value] as HTMLElement;
				if (highlightedEl) {
					highlightedEl.scrollIntoView({ block: 'nearest' });
				}
			}
		}
	}, [isOpen.value, highlightedIndex.value]);

	// Close on click outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				toggleOpen(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	// --- Render Helpers ---

	// Find the label for a value by searching the flattened list
	// We construct a temporary map or search on fly.
	// For performance in large lists, a map is better, but here we scan.
	const getLabelForValue = (val: T) => {
		const findInTree = (opts: SelectOption<T>[]): SelectOption<T> | undefined => {
			for (const o of opts) {
				if (o.value === val) return o;
				if (o.options) {
					const found = findInTree(o.options);
					if (found) return found;
				}
			}
			return undefined;
		};
		const opt = findInTree(options);
		return opt ? opt.label : String(val);
	};

	const renderStatusIcon = () => {
		if (loading) return icons?.loading || <IconLoader2 className='field-select__spin' size={18} />;
		if (errorMessage) return icons?.invalid;
		if (isOpen.value) return icons?.arrowOpen || <IconChevronDown size={18} />;
		return icons?.arrow || <IconChevronDown size={18} />;
	};

	const renderChips = () => {
		return selectedValues.value.map((val) => {
			const label = getLabelForValue(val);
			return (
				<span key={String(val)} className='field-select__chip'>
					{label}
					<span
						className='field-select__chip-remove'
						onMouseDown={(e) => {
							e.preventDefault();
							e.stopPropagation();
							removeValue(val);
						}}
					>
						{icons?.remove || <IconX size={14} />}
					</span>
				</span>
			);
		});
	};

	const renderValue = () => {
		if (displayMode === 'count' && selectedValues.value.length > 0) {
			return <span className='field-select__summary'>{selectedValues.value.length} selected</span>;
		}

		if (multiple && displayMode === 'chips-inside') {
			return renderChips();
		}

		if (!multiple && selectedValues.value.length > 0) {
			const val = selectedValues.value[0];
			const label = getLabelForValue(val);
			// Find object for icon/avatar
			// Simple flatten for lookup
			// const opt = ... (Optimization: useSelectState could expose a value map)

			if (searchable && searchQuery.value) return null;
			return (
				<div className='field-select__single'>
					{label}
				</div>
			);
		}

		return null;
	};

	const handleContainerClick = (e: MouseEvent) => {
		if (isDisabled) return;
		if (searchable && isOpen.value && e.target === inputRef.current) return;

		addRipple(e);
		toggleOpen();
		if (!isOpen.value) interaction.handleFocus(e);
	};

	return (
		<div
			className={`field-select ${className || ''}`}
			style={style}
			ref={containerRef}
		>
			<LabelWrapper
				id={id}
				label={label}
				active={isOpen.value || selectedValues.value.length > 0 || !!placeholder ||
					!!searchQuery.value}
				error={!!errorMessage}
				disabled={isDisabled}
				required={required}
				floating={floating}
				position={position}
				floatingRule={floatingRule}
			/>

			<div
				className={[
					'field-select__container',
					isOpen.value && 'field-select__container--open',
					interaction.focused.value && 'field-select__container--focused',
					errorMessage && 'field-select__container--error',
					isDisabled && 'field-select__container--disabled',
				].filter(Boolean).join(' ')}
				onClick={handleContainerClick}
				onMouseDown={(e) => {
					if (e.target !== inputRef.current) e.preventDefault();
				}}
			>
				<EffectWrapper focused={interaction.focused} disabled={isDisabled} />

				<div
					className='field-ripple-container'
					style={{
						position: 'absolute',
						inset: 0,
						overflow: 'hidden',
						pointerEvents: 'none',
						borderRadius: 'inherit',
					}}
				>
					{ripples.value.map((r) => (
						<span key={r.id} className='field-ripple' style={{ left: r.x, top: r.y }} />
					))}
				</div>

				<div className='field-select__content'>
					{renderValue()}

					{(searchable || (selectedValues.value.length === 0 && placeholder)) && (
						<input
							ref={inputRef}
							className='field-select__input'
							value={searchQuery.value}
							placeholder={selectedValues.value.length === 0
								? (placeholder || (floating ? '' : 'Select...'))
								: ''}
							onInput={(e) => searchQuery.value = e.currentTarget.value}
							onKeyDown={handleKeyDown}
							onFocus={interaction.handleFocus}
							onBlur={() => {
								setTimeout(() => interaction.handleBlur(), 100);
							}}
							disabled={!!isDisabled}
							readOnly={!searchable}
						/>
					)}
				</div>

				{clearable && !loading && selectedValues.value.length > 0 && (
					<div
						className='field-select__clear'
						onClick={(e) => {
							e.stopPropagation();
							if (multiple) {
								if (value instanceof Signal) value.value = [];
								onChange?.([]);
							} else {
								if (value instanceof Signal) value.value = undefined as any;
								onChange?.(undefined as any);
							}
						}}
					>
						<IconX size={16} />
					</div>
				)}

				<div className={`field-select__arrow ${isOpen.value ? 'field-select__arrow--flip' : ''}`}>
					{renderStatusIcon()}
				</div>

				{/* Dropdown Menu */}
				<div
					className={`field-select__menu ${isOpen.value ? 'field-select__menu--open' : ''}`}
					ref={listRef}
				>
					{multiple && enableSelectAll && filteredOptions.value.length > 0 && (
						<div
							className='field-select__action-bar'
							onClick={(e) => {
								e.stopPropagation();
								toggleSelectAll();
							}}
						>
							<IconSelector size={16} />
							<span>Select All</span>
						</div>
					)}

					{filteredOptions.value.length === 0
						? <div className='field-select__no-options'>No options found</div>
						: (
							filteredOptions.value.map((option, index) => {
								const isHighlighted = index === highlightedIndex.value;

								// Selection Check Logic
								let isSelected = false;
								if (option.isGroup && groupSelectMode === 'members' && multiple) {
									// Group is selected if all descendants are selected
									isSelected = option.descendantValues.length > 0 &&
										option.descendantValues.every((v) => selectedValues.value.includes(v));
								} else {
									isSelected = selectedValues.value.includes(option.value);
								}

								return (
									<div
										key={String(option.value) + index}
										className={[
											'field-select__option',
											isSelected && 'field-select__option--selected',
											isHighlighted && 'field-select__option--highlighted',
											option.disabled && 'field-select__option--disabled',
											option.isGroup && 'field-select__option--group',
										].filter(Boolean).join(' ')}
										style={{ paddingLeft: `${(option.depth * 12) + 12}px` }} // Indentation
										onClick={(e) => {
											e.stopPropagation();
											selectOption(option);
										}}
										onMouseEnter={() => highlightedIndex.value = index}
									>
										{option.icon && (
											<span className='field-select__option-icon'>{option.icon}</span>
										)}
										{option.avatarUrl && (
											<img src={option.avatarUrl} className='field-select__avatar' />
										)}

										<span className='field-select__option-label'>{option.label}</span>

										{isSelected && (
											<span className='field-select__check'>
												{icons?.check || <IconCheck size={16} />}
											</span>
										)}
									</div>
								);
							})
						)}
				</div>
			</div>

			{/* Chips Below Mode */}
			{multiple && displayMode === 'chips-below' && selectedValues.value.length > 0 && (
				<div className='field-select__chips-external'>
					{renderChips()}
				</div>
			)}

			<MessageWrapper error={error} hint={hint} warning={warning} info={info} />
		</div>
	);
}

```

### File: packages\fields\src\components\SliderField.tsx

```tsx
import '../styles/fields/slider-field.css';
import { Signal } from '@preact/signals';
import { SliderFieldProps, SliderMark } from '../types/components/slider-field.ts';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { useSliderState } from '../hooks/useSliderState.ts';
import { valueToPercent, valueToPercentLog } from '@projective/utils';

export function SliderField(props: SliderFieldProps) {
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		min = 0,
		max = 100,
		step = 1,
		disabled,
		className,
		style,
		position,
		floatingRule,
		required,
		floating,
		hint,
		warning,
		info,
		error,
		range,
		marks,
		snapToMarks,
		vertical,
		scale,
		minDistance,
		passthrough,
	} = props;

	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const errorMessage = error instanceof Signal ? error.value : error;

	const rawValue = value instanceof Signal ? value.value : (value ?? defaultValue);

	const {
		trackRef,
		internalValues,
		activeHandleIdx,
		handleStyles,
		trackFillStyle,
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
		handleTrackClick,
	} = useSliderState({
		value: rawValue,
		onChange: (val) => {
			if (value instanceof Signal) {
				(value as Signal<number | number[]>).value = val;
			}
			onChange?.(val);
		},
		min,
		max,
		step,
		range,
		disabled: !!isDisabled,
		marks,
		snapToMarks,
		vertical,
		scale,
		minDistance,
		passthrough,
	});

	const renderMarks = () => {
		if (!marks) return null;
		let points: SliderMark[] = [];
		if (Array.isArray(marks)) {
			points = marks.map((m) => (typeof m === 'number' ? { value: m } : m));
		} else if (marks === true) {
			if (scale === 'logarithmic') return null;
			const count = (max - min) / step;
			if (count > 100) return null;
			for (let i = min; i <= max; i += step) points.push({ value: i });
		}

		return (
			<div className='field-slider__marks'>
				{points.map((mark, i) => {
					const pct = scale === 'logarithmic'
						? valueToPercentLog(mark.value, min, max)
						: valueToPercent(mark.value, min, max);
					if (pct < 0 || pct > 100) return null;

					const markStyle = vertical
						? { bottom: `${pct}%`, left: '50%' }
						: { left: `${pct}%`, top: '50%' };

					const markClass = ['field-slider__mark', mark.className].filter(Boolean).join(' ');

					return (
						<div key={i} className={markClass} style={markStyle}>
							<div className='field-slider__mark-tick'></div>
							{mark.label && <div className='field-slider__mark-label'>{mark.label}</div>}
						</div>
					);
				})}
			</div>
		);
	};

	const containerClasses = [
		'field-slider',
		className,
		isDisabled ? 'field-slider--disabled' : '',
		range ? 'field-slider--range' : '',
		marks ? 'field-slider--has-marks' : '',
		vertical ? 'field-slider--vertical' : '',
	].filter(Boolean).join(' ');

	const wrapperStyle = vertical && props.height ? { height: props.height } : {};

	return (
		<div className={containerClasses} style={style}>
			<LabelWrapper
				id={id}
				label={label}
				disabled={isDisabled}
				position={position}
				floatingRule={floatingRule ?? 'never'}
				required={required}
				floating={floating}
			/>

			<div className='field-slider__control' style={wrapperStyle}>
				<div
					className='field-slider__container'
					onClick={(e: MouseEvent) => handleTrackClick(e as PointerEvent)}
				>
					<div className='field-slider__track' ref={trackRef}>
						<div className='field-slider__fill' style={trackFillStyle.value}></div>

						{renderMarks()}

						{handleStyles.value.map((thumbStyle, index) => {
							const isActive = activeHandleIdx.value === index;
							const val = internalValues.value[index];

							return (
								<div
									key={index}
									className={`field-slider__thumb ${isActive ? 'field-slider__thumb--active' : ''}`}
									style={thumbStyle}
									tabIndex={isDisabled ? -1 : 0}
									role='slider'
									aria-orientation={vertical ? 'vertical' : 'horizontal'}
									aria-valuemin={min}
									aria-valuemax={max}
									aria-valuenow={val}
									onPointerDown={(e) => {
										(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
										handlePointerDown(index, e);
									}}
									onPointerMove={handlePointerMove}
									onPointerUp={(e) => {
										(e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
										handlePointerUp(e);
									}}
									onContextMenu={(e) => e.preventDefault()}
								>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			<MessageWrapper error={errorMessage} hint={hint} warning={warning} info={info} />
		</div>
	);
}

```

### File: packages\fields\src\components\TagInput.tsx

```tsx
import '../styles/fields/tag-input.css';
import { Signal, useSignal } from '@preact/signals';
import { TagInputProps } from '../types/components/tag-input.ts';
import { useInteraction } from '../hooks/useInteraction.ts';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { EffectWrapper } from '../wrappers/EffectWrapper.tsx';

export function TagInput(props: TagInputProps) {
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		error,
		disabled,
		placeholder,
		className,
		style,
		position,
		floatingRule,
		required,
		floating,
		hint,
		warning,
		info,
	} = props;

	const interaction = useInteraction(
		value instanceof Signal ? value.value : value,
	);
	const inputValue = useSignal('');

	const isValueSignal = value instanceof Signal;
	const internalSignal = useSignal(
		isValueSignal ? value.peek() : (value ?? defaultValue ?? []),
	);

	if (!isValueSignal && value !== undefined && value !== internalSignal.peek()) {
		internalSignal.value = value;
	}

	const signalValue = isValueSignal ? value : internalSignal;
	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const errorMessage = error instanceof Signal ? error.value : error;

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			const val = inputValue.value.trim();
			if (val) {
				const currentTags = signalValue.value || [];
				if (!currentTags.includes(val)) {
					const newTags = [...currentTags, val];
					if (isValueSignal) {
						(value as Signal<string[]>).value = newTags;
					} else {
						internalSignal.value = newTags;
					}
					onChange?.(newTags);
				}
				inputValue.value = '';
			}
		} else if (
			e.key === 'Backspace' && !inputValue.value &&
			signalValue.value?.length
		) {
			const newTags = signalValue.value.slice(0, -1);
			if (isValueSignal) {
				(value as Signal<string[]>).value = newTags;
			} else {
				internalSignal.value = newTags;
			}
			onChange?.(newTags);
		}
	};

	const removeTag = (tagToRemove: string) => {
		const currentTags = signalValue.value || [];
		const newTags = currentTags.filter((tag) => tag !== tagToRemove);
		if (isValueSignal) {
			(value as Signal<string[]>).value = newTags;
		} else {
			internalSignal.value = newTags;
		}
		onChange?.(newTags);
	};

	const handleContainerClick = (e: MouseEvent) => {
		if (isDisabled) return;
		const input = (e.currentTarget as HTMLElement).querySelector('input');
		input?.focus();
	};

	return (
		<div className={`field-tag ${className || ''}`} style={style}>
			<div
				className={[
					'field-tag__container',
					interaction.focused.value &&
					'field-tag__container--focused',
					errorMessage && 'field-tag__container--error',
					isDisabled && 'field-tag__container--disabled',
				].filter(Boolean).join(' ')}
				onClick={handleContainerClick}
			>
				<EffectWrapper
					focused={interaction.focused}
					disabled={isDisabled}
				/>

				{signalValue.value?.map((tag) => (
					<div key={tag} className='field-tag__chip'>
						<span>{tag}</span>
						<span
							className='field-tag__chip-remove'
							onClick={(e) => {
								e.stopPropagation();
								removeTag(tag);
							}}
						>
							&times;
						</span>
					</div>
				))}

				<input
					id={id}
					className='field-tag__input'
					value={inputValue.value}
					onInput={(e) => inputValue.value = e.currentTarget.value}
					onKeyDown={handleKeyDown}
					onFocus={interaction.handleFocus}
					onBlur={interaction.handleBlur}
					disabled={!!isDisabled}
					placeholder={signalValue.value?.length ? '' : placeholder}
				/>
			</div>

			{/* FIX: LabelWrapper moved to end */}
			<LabelWrapper
				id={id}
				label={label}
				active={interaction.focused.value ||
					(signalValue.value && signalValue.value.length > 0) ||
					!!placeholder}
				error={!!errorMessage}
				disabled={isDisabled}
				required={required}
				floating={floating}
				position={position}
				floatingRule={floatingRule}
			/>

			<MessageWrapper error={error} hint={hint} warning={warning} info={info} />
		</div>
	);
}

```

### File: packages\fields\src\components\TextField.tsx

```tsx
import '../styles/fields/text-field.css';
import { JSX } from 'preact';
import { computed, Signal, useSignal } from '@preact/signals';
import { TextFieldProps } from '../types/components/text-field.ts';
import { useFieldState } from '../hooks/useFieldState.ts';
import { useInteraction } from '../hooks/useInteraction.ts';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { EffectWrapper } from '../wrappers/EffectWrapper.tsx';
import { AdornmentWrapper } from '../wrappers/AdornmentWrapper.tsx';

export function TextField(props: TextFieldProps) {
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		error,
		disabled,
		placeholder,
		className,
		style,
		position,
		floatingRule,
		required,
		floating,
		hint,
		warning,
		info,
		help,
		helpLink,
		helpPosition, // NEW
		type = 'text',
		multiline,
		rows = 3,
		maxRows,
		autoComplete,
		pattern,
		min,
		max,
		minLength,
		maxLength,
		showCount,
		prefix,
		suffix,
		onPrefixClick,
		onSuffixClick,
		onInput,
		onFocus,
		onBlur,
	} = props;

	// 1. State Management
	const fieldState = useFieldState({
		value,
		defaultValue: defaultValue ?? '',
		required,
		disabled,
		error,
		onChange,
	});

	const interaction = useInteraction(fieldState.value.value);

	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const errorMessage = fieldState.error.value;
	const val = fieldState.value.value || '';

	// 2. Computed
	const length = computed(() => val.length);
	const isOverLimit = computed(() => maxLength ? length.value > maxLength : false);

	// 3. Handlers
	const handleContainerClick = (e: MouseEvent) => {
		if (isDisabled) return;
		const input = (e.currentTarget as HTMLElement).querySelector<
			HTMLInputElement | HTMLTextAreaElement
		>('.field-text__input');
		input?.focus();
	};

	const handleInput = (e: JSX.TargetedEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const newValue = e.currentTarget.value;
		fieldState.setValue(newValue);
		interaction.handleChange(newValue);
		onInput?.(e);
	};

	// 4. Render Helpers
	const renderInput = () => {
		const commonProps = {
			id,
			className: 'field-text__input',
			value: val,
			onInput: handleInput,
			onFocus: (e: any) => {
				interaction.handleFocus(e);
				onFocus?.(e);
			},
			onBlur: (e: any) => {
				interaction.handleBlur(e);
				fieldState.validate();
				onBlur?.(e);
			},
			disabled: !!isDisabled,
			placeholder: placeholder,
			autoComplete,
			maxLength,
			minLength,
			min,
			max,
		};

		if (multiline) {
			return (
				<textarea
					{...commonProps}
					rows={rows}
					style={maxRows ? { maxHeight: `${maxRows * 1.5}em` } : undefined}
				/>
			);
		}

		return (
			<input
				{...commonProps}
				type={type}
				pattern={pattern}
			/>
		);
	};

	return (
		<div className={`field-text ${className || ''}`} style={style}>
			<div
				className={[
					'field-text__container',
					interaction.focused.value && 'field-text__container--focused',
					errorMessage && 'field-text__container--error',
					isDisabled && 'field-text__container--disabled',
				].filter(Boolean).join(' ')}
				onClick={handleContainerClick}
			>
				<EffectWrapper
					focused={interaction.focused}
					disabled={isDisabled}
				/>

				<AdornmentWrapper
					position='prefix'
					onClick={onPrefixClick}
				>
					{prefix}
				</AdornmentWrapper>

				<LabelWrapper
					id={id}
					label={label}
					active={interaction.focused.value || !!val || !!placeholder}
					error={!!errorMessage}
					disabled={isDisabled}
					required={required}
					floating={floating}
					position={position}
					floatingRule={floatingRule}
					multiline={multiline}
					help={help}
					helpLink={helpLink}
					helpPosition={helpPosition} // Passed down
				/>

				{renderInput()}

				<AdornmentWrapper
					position='suffix'
					onClick={onSuffixClick}
				>
					{suffix}
				</AdornmentWrapper>
			</div>

			<div style={{ display: 'flex', justifyContent: 'space-between' }}>
				<div style={{ flex: 1 }}>
					<MessageWrapper
						error={fieldState.error}
						hint={hint}
						warning={warning}
						info={info}
					/>
				</div>

				{showCount && maxLength && (
					<div
						className={`field-text__count ${isOverLimit.value ? 'field-text__count--limit' : ''}`}
					>
						{length}/{maxLength}
					</div>
				)}
			</div>
		</div>
	);
}

```

### File: packages\fields\src\components\TimeField.tsx

```tsx
import '../styles/fields/date-field.css';
import { computed, Signal, useSignal } from '@preact/signals';
import { TimeFieldProps, TimeValue } from '../types/components/time-field.ts';
import { useInteraction } from '../hooks/useInteraction.ts';
import { useFieldState } from '../hooks/useFieldState.ts';
import { AdornmentWrapper } from '../wrappers/AdornmentWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { DateTime } from '@projective/types';
import { Popover } from '@projective/ui';
import { TimeClock } from './datetime/TimeClock.tsx';
import { TextField } from './TextField.tsx';
import { IconClock } from '@tabler/icons-preact';

export function TimeField(props: TimeFieldProps) {
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		error,
		disabled,
		placeholder,
		className,
		style,
		position,
		floatingRule,
		required,
		floating,
		hint,
		warning,
		info,
		variant = 'popup',
		selectionMode = 'single',
	} = props;

	// FIX: Explicitly type the field state to allow DateTime arrays
	const fieldState = useFieldState<TimeValue | undefined>({
		value,
		defaultValue,
		required,
		disabled,
		error,
		onChange: onChange as (val: TimeValue | undefined) => void,
	});

	const interaction = useInteraction(fieldState.value.value);
	const isOpen = useSignal(false);

	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const errorMessage = fieldState.error.value;

	const displayValue = computed(() => {
		const val = fieldState.value.value;
		if (!val) return '';

		if (Array.isArray(val)) {
			if (val.length === 0) return '';
			if (val.length === 1) return val[0].toFormat('HH:mm');
			return `${val.length} times selected`;
		}

		return (val as DateTime).toFormat('HH:mm');
	});

	const handleTimeSelect = (date: TimeValue) => {
		fieldState.setValue(date);

		// Auto-close logic
		if (selectionMode === 'single' && !Array.isArray(date)) {
			// Small delay to allow visual feedback
			setTimeout(() => {
				isOpen.value = false;
				interaction.handleBlur();
			}, 100);
		}
	};

	// --- Inline Variant ---
	if (variant === 'inline') {
		return (
			<div
				className={`field-date field-date--inline ${className || ''}`}
				style={style}
			>
				<TimeClock
					value={fieldState.value.value}
					onChange={handleTimeSelect}
					selectionMode={selectionMode}
				/>
				<MessageWrapper
					error={error}
					hint={hint}
					warning={warning}
					info={info}
				/>
			</div>
		);
	}

	// --- Popup Variant ---
	return (
		<div className={`field-date ${className || ''}`} style={style}>
			<Popover
				isOpen={isOpen.value}
				onClose={() => {
					isOpen.value = false;
					interaction.handleBlur();
				}}
				trigger={
					<div
						onClick={() => !isDisabled && (isOpen.value = !isOpen.value)}
					>
						<TextField
							id={id}
							label={label}
							value={displayValue.value}
							placeholder={placeholder || 'HH:MM'}
							error={errorMessage}
							disabled={isDisabled}
							required={required}
							floating={floating}
							position={position}
							floatingRule={floatingRule}
							readonly
							suffix={
								<AdornmentWrapper
									position='suffix'
									onClick={(e) => {
										e.stopPropagation();
										!isDisabled &&
											(isOpen.value = !isOpen.value);
									}}
								>
									<IconClock size={18} />
								</AdornmentWrapper>
							}
							onFocus={interaction.handleFocus}
							onBlur={() => {}}
						/>
					</div>
				}
				content={
					<TimeClock
						value={fieldState.value.value}
						onChange={handleTimeSelect}
						selectionMode={selectionMode}
					/>
				}
			/>
			<MessageWrapper
				error={error}
				hint={hint}
				warning={warning}
				info={info}
			/>
		</div>
	);
}

```

### File: packages\fields\src\hooks\useCurrencyMask.ts

```ts
import { Signal, useSignal } from '@preact/signals';

export function useCurrencyMask(
	value: Signal<number | undefined>,
	currency = 'USD',
	locale = 'en-US',
) {
	const displayValue = useSignal('');

	const formatCurrency = (val: number) => {
		return new Intl.NumberFormat(locale, {
			style: 'currency',
			currency: currency,
		}).format(val);
	};

	const parseCurrency = (val: string): number => {
		// Remove non-numeric characters except decimal point
		const clean = val.replace(/[^0-9.-]+/g, '');
		return parseFloat(clean);
	};

	const handleBlur = () => {
		if (value.value !== undefined && !isNaN(value.value)) {
			displayValue.value = formatCurrency(value.value);
		} else {
			displayValue.value = '';
		}
	};

	const handleFocus = () => {
		if (value.value !== undefined && !isNaN(value.value)) {
			displayValue.value = value.value.toString();
		} else {
			displayValue.value = '';
		}
	};

	const handleChange = (val: string) => {
		displayValue.value = val;
		const parsed = parseCurrency(val);
		if (!isNaN(parsed)) {
			value.value = parsed;
		} else {
			value.value = undefined;
		}
	};

	// Initialize display value
	if (value.value !== undefined && !displayValue.value) {
		displayValue.value = formatCurrency(value.value);
	}

	return {
		displayValue,
		handleBlur,
		handleFocus,
		handleChange,
	};
}

```

### File: packages\fields\src\hooks\useFieldState.ts

```ts
import { Signal, useSignal } from '@preact/signals';

export interface FieldStateProps<T> {
	value?: T | Signal<T>;
	defaultValue?: T;
	required?: boolean;
	disabled?: boolean | Signal<boolean>;
	error?: string | Signal<string | undefined>;
	onChange?: (value: T) => void;
}

export interface FieldState<T> {
	value: Signal<T>;
	error: Signal<string | undefined>;
	dirty: Signal<boolean>;
	touched: Signal<boolean>;
	setValue: (newValue: T) => void;
	validate: () => boolean;
}

export function useFieldState<T>(props: FieldStateProps<T>): FieldState<T> {
	// Normalize value signal
	const isValueSignal = props.value instanceof Signal;
	const internalValue = useSignal<T>(
		isValueSignal ? (props.value as Signal<T>).peek() : (props.value ?? props.defaultValue) as T,
	);

	// Sync if prop changes and is not a signal
	if (!isValueSignal && props.value !== undefined && props.value !== internalValue.peek()) {
		internalValue.value = props.value as T;
	}

	const valueSignal = isValueSignal ? (props.value as Signal<T>) : internalValue;

	const errorSignal = useSignal<string | undefined>(
		props.error instanceof Signal ? props.error.peek() : props.error,
	);

	// Sync error prop
	if (
		props.error !== undefined && !(props.error instanceof Signal) &&
		props.error !== errorSignal.peek()
	) {
		errorSignal.value = props.error;
	}

	const dirty = useSignal(false);
	const touched = useSignal(false);

	const validate = () => {
		if (props.required) {
			const val = valueSignal.value;
			const isEmpty = val === undefined || val === null || val === '' ||
				(Array.isArray(val) && val.length === 0);
			if (isEmpty) {
				errorSignal.value = 'This field is required';
				return false;
			}
		}
		// Clear error if it was "This field is required" but now has value
		if (errorSignal.value === 'This field is required') {
			errorSignal.value = undefined;
		}
		return true;
	};

	const setValue = (newValue: T) => {
		valueSignal.value = newValue;
		dirty.value = true;
		props.onChange?.(newValue);
		if (touched.value) {
			validate();
		}
	};

	return {
		value: valueSignal,
		error: errorSignal,
		dirty,
		touched,
		setValue,
		validate,
	};
}

```

### File: packages\fields\src\hooks\useFileProcessor.ts

```ts
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { FileProcessor, FileWithMeta } from '../types/file.ts';

// Simple ID generator if uuid not available
const generateId = () => Math.random().toString(36).substring(2, 15);

export function useFileProcessor(
	files: FileWithMeta[],
	processors: FileProcessor[] = [],
	onChange: (files: FileWithMeta[]) => void,
) {
	const processingQueue = useSignal<string[]>([]);

	useEffect(() => {
		const pendingFiles = files.filter(
			(f) => f.status === 'pending' && !processingQueue.value.includes(f.id),
		);

		if (pendingFiles.length === 0) return;

		pendingFiles.forEach((fileMeta) => {
			processFile(fileMeta);
		});
	}, [files]);

	const processFile = async (fileMeta: FileWithMeta) => {
		// Add to queue
		processingQueue.value = [...processingQueue.value, fileMeta.id];

		// Update status to processing
		updateFile(fileMeta.id, { status: 'processing', progress: 0 });

		// Find matching processor
		const processor = processors.find((p) => p.match(fileMeta.file));

		if (!processor) {
			// No processor found, mark as ready (or error if strict?)
			// For now, just ready
			updateFile(fileMeta.id, { status: 'ready', progress: 100 });
			removeFromQueue(fileMeta.id);
			return;
		}

		try {
			const result = await processor.process(fileMeta.file, (pct) => {
				updateFile(fileMeta.id, { progress: pct });
			});

			updateFile(fileMeta.id, {
				file: result.file,
				processingMeta: result.metadata,
				status: 'ready',
				progress: 100,
			});
		} catch (err: any) {
			updateFile(fileMeta.id, {
				status: 'error',
				errors: [{ code: 'PROCESSING_ERROR', message: err.message || 'Unknown error' }],
			});
		} finally {
			removeFromQueue(fileMeta.id);
		}
	};

	const updateFile = (id: string, updates: Partial<FileWithMeta>) => {
		const newFiles = files.map((f) => (f.id === id ? { ...f, ...updates } : f));
		onChange(newFiles);
	};

	const removeFromQueue = (id: string) => {
		processingQueue.value = processingQueue.value.filter((pid) => pid !== id);
	};

	const addFiles = (newFiles: File[]) => {
		const newFileMetas: FileWithMeta[] = newFiles.map((f) => ({
			file: f,
			originalFile: f,
			id: generateId(),
			status: 'pending',
			progress: 0,
			errors: [],
		}));

		onChange([...files, ...newFileMetas]);
	};

	const removeFile = (id: string) => {
		onChange(files.filter((f) => f.id !== id));
	};

	return {
		addFiles,
		removeFile,
	};
}

```

### File: packages\fields\src\hooks\useGlobalDrag.ts

```ts
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';

export function useGlobalDrag() {
	const isDragging = useSignal(false);

	useEffect(() => {
		let dragCounter = 0;

		const handleDragEnter = (e: DragEvent) => {
			e.preventDefault();
			dragCounter++;
			if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
				isDragging.value = true;
			}
		};

		const handleDragLeave = (e: DragEvent) => {
			e.preventDefault();
			dragCounter--;
			if (dragCounter === 0) {
				isDragging.value = false;
			}
		};

		const handleDragOver = (e: DragEvent) => {
			e.preventDefault();
		};

		const handleDrop = (e: DragEvent) => {
			e.preventDefault();
			dragCounter = 0;
			isDragging.value = false;
		};

		globalThis.addEventListener('dragenter', handleDragEnter);
		globalThis.addEventListener('dragleave', handleDragLeave);
		globalThis.addEventListener('dragover', handleDragOver);
		globalThis.addEventListener('drop', handleDrop);

		return () => {
			globalThis.removeEventListener('dragenter', handleDragEnter);
			globalThis.removeEventListener('dragleave', handleDragLeave);
			globalThis.removeEventListener('dragover', handleDragOver);
			globalThis.removeEventListener('drop', handleDrop);
		};
	}, []);

	return isDragging;
}

```

### File: packages\fields\src\hooks\useInteraction.ts

```ts
import { Signal, useSignal } from '@preact/signals';

export interface InteractionState {
	focused: Signal<boolean>;
	hovered: Signal<boolean>;
	active: Signal<boolean>;
	dirty: Signal<boolean>;
	touched: Signal<boolean>;
	handleFocus: (e?: FocusEvent | MouseEvent) => void;
	handleBlur: (e?: FocusEvent | MouseEvent) => void;
	handleMouseEnter: (e: MouseEvent) => void;
	handleMouseLeave: (e: MouseEvent) => void;
	handleMouseDown: (e: MouseEvent) => void;
	handleMouseUp: (e: MouseEvent) => void;
	handleChange: (value: unknown) => void;
}

export function useInteraction(initialValue?: unknown): InteractionState {
	const focused = useSignal(false);
	const hovered = useSignal(false);
	const active = useSignal(false);
	const dirty = useSignal(false);
	const touched = useSignal(false);

	// Track initial value to determine dirty state
	const _initialValue = initialValue;

	const handleFocus = (_e?: FocusEvent | MouseEvent) => {
		focused.value = true;
		touched.value = true;
	};

	const handleBlur = (_e?: FocusEvent | MouseEvent) => {
		focused.value = false;
	};

	const handleMouseEnter = (_e: MouseEvent) => {
		hovered.value = true;
	};

	const handleMouseLeave = (_e: MouseEvent) => {
		hovered.value = false;
		active.value = false; // Ensure active is cleared
	};

	const handleMouseDown = (_e: MouseEvent) => {
		active.value = true;
	};

	const handleMouseUp = (_e: MouseEvent) => {
		active.value = false;
	};

	const handleChange = (value: unknown) => {
		dirty.value = value !== _initialValue;
	};

	return {
		focused,
		hovered,
		active,
		dirty,
		touched,
		handleFocus,
		handleBlur,
		handleMouseEnter,
		handleMouseLeave,
		handleMouseDown,
		handleMouseUp,
		handleChange,
	};
}

```

### File: packages\fields\src\hooks\useSelectState.ts

```ts
import { computed, Signal, useSignal } from '@preact/signals';
import { SelectOption } from '../types/components/select-field.ts';

interface UseSelectStateProps<T> {
	options: SelectOption<T>[];
	value?: T | T[] | Signal<T | T[]>;
	onChange?: (val: T | T[]) => void;
	multiple?: boolean;
	disabled?: boolean;
	groupSelectMode?: 'value' | 'members';
}

// Internal Interface for the flattened list
export interface FlatOption<T> extends SelectOption<T> {
	depth: number;
	isGroup: boolean;
	// Cache all descendant values for quick "select all members" logic
	descendantValues: T[];
}

export function useSelectState<T>({
	options,
	value,
	onChange,
	multiple,
	disabled,
	groupSelectMode = 'value',
}: UseSelectStateProps<T>) {
	const isOpen = useSignal(false);
	const highlightedIndex = useSignal(-1);
	const searchQuery = useSignal('');

	// Helper: Flatten tree to list
	const flattenOptions = (
		opts: SelectOption<T>[],
		depth = 0,
		accum: FlatOption<T>[] = [],
	): FlatOption<T>[] => {
		for (const opt of opts) {
			const isGroup = !!(opt.options && opt.options.length > 0);

			// Recursively get descendants if it's a group
			let descendantValues: T[] = [];
			let childrenFlat: FlatOption<T>[] = [];

			if (isGroup && opt.options) {
				childrenFlat = flattenOptions(opt.options, depth + 1);
				// Collect leaf values from children
				descendantValues = childrenFlat
					.filter((c) => !c.isGroup || groupSelectMode === 'value') // If mode is value, groups are valid values too
					.map((c) => c.value);

				// Also include children's descendants
				childrenFlat.forEach((c) => {
					if (c.isGroup) descendantValues.push(...c.descendantValues);
				});

				// Dedup
				descendantValues = Array.from(new Set(descendantValues));
			}

			accum.push({
				...opt,
				depth,
				isGroup,
				descendantValues,
			});

			if (isGroup) {
				accum.push(...childrenFlat);
			}
		}
		return accum;
	};

	// Flatten once (memoized by computed if options change)
	const flatOptions = computed(() => flattenOptions(options));

	const selectedValues = computed(() => {
		const val = value instanceof Signal ? value.value : (value ?? []);
		return Array.isArray(val) ? val : (val ? [val] : []);
	});

	const filteredOptions = computed(() => {
		const query = searchQuery.value.toLowerCase();
		if (!query) return flatOptions.value;
		return flatOptions.value.filter((opt) => opt.label.toLowerCase().includes(query));
	});

	const toggleOpen = (forceState?: boolean) => {
		if (disabled) return;
		const newState = forceState !== undefined ? forceState : !isOpen.value;
		isOpen.value = newState;

		if (newState) {
			// Find first selected index to highlight
			const firstSelected = filteredOptions.value.findIndex((o) =>
				selectedValues.value.includes(o.value)
			);
			highlightedIndex.value = firstSelected >= 0 ? firstSelected : 0;
		} else {
			searchQuery.value = '';
			highlightedIndex.value = -1;
		}
	};

	const selectOption = (option: FlatOption<T>) => {
		if (option.disabled) return;

		let newValue: T | T[];

		if (multiple) {
			const current = selectedValues.value as T[];

			// Logic for Group Members Selection
			if (option.isGroup && groupSelectMode === 'members') {
				const targets = option.descendantValues;
				const allSelected = targets.every((v) => current.includes(v));

				if (allSelected) {
					// Deselect all members
					newValue = current.filter((v) => !targets.includes(v));
				} else {
					// Select all members (union)
					const toAdd = targets.filter((v) => !current.includes(v));
					newValue = [...current, ...toAdd];
				}
			} else {
				// Standard Toggle
				const exists = current.includes(option.value);
				if (exists) {
					newValue = current.filter((v) => v !== option.value);
				} else {
					newValue = [...current, option.value];
				}
			}

			searchQuery.value = '';
			if (value instanceof Signal) value.value = newValue;
		} else {
			// Single Select
			// If clicking a group in 'members' mode, do nothing or expand?
			// Usually single select can't select multiple members, so we treat group as unselectable label
			// or we treat it as selecting the group value itself if allowGroupSelection is true.

			if (option.isGroup && groupSelectMode === 'members') {
				// In single mode, 'members' doesn't make sense for assignment.
				// We assume clicking it does nothing or perhaps expands (if we had collapsible).
				return;
			}

			newValue = option.value;
			if (value instanceof Signal) value.value = newValue;
			toggleOpen(false);
		}

		onChange?.(newValue);
	};

	const removeValue = (valToRemove: T) => {
		if (!multiple) {
			if (value instanceof Signal) value.value = undefined as any;
			onChange?.(undefined as any);
			return;
		}

		const current = selectedValues.value as T[];
		const newValue = current.filter((v) => v !== valToRemove);

		if (value instanceof Signal) value.value = newValue;
		onChange?.(newValue);
	};

	const toggleSelectAll = () => {
		if (!multiple) return;

		// Filter out groups if we are only selecting leaf nodes, OR select everything if mode is value
		const candidateOptions = filteredOptions.value.filter((o) =>
			!o.disabled && (!o.isGroup || groupSelectMode === 'value')
		);

		const enabledValues = candidateOptions.map((o) => o.value);
		const current = selectedValues.value as T[];

		const allSelected = enabledValues.every((v) => current.includes(v));

		let newValue: T[];
		if (allSelected) {
			newValue = current.filter((v) => !enabledValues.includes(v));
		} else {
			const toAdd = enabledValues.filter((v) => !current.includes(v));
			newValue = [...current, ...toAdd];
		}

		if (value instanceof Signal) value.value = newValue;
		onChange?.(newValue);
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (disabled) return;

		if (!isOpen.value && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
			e.preventDefault();
			toggleOpen(true);
			return;
		}

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				if (highlightedIndex.value < filteredOptions.value.length - 1) {
					highlightedIndex.value++;
				}
				break;
			case 'ArrowUp':
				e.preventDefault();
				if (highlightedIndex.value > 0) {
					highlightedIndex.value--;
				}
				break;
			case 'Enter':
				e.preventDefault();
				if (isOpen.value && highlightedIndex.value >= 0) {
					const opt = filteredOptions.value[highlightedIndex.value];
					if (opt) selectOption(opt);
				}
				break;
			case 'Escape':
				e.preventDefault();
				toggleOpen(false);
				break;
			case 'Backspace':
				if (searchQuery.value === '' && multiple && selectedValues.value.length > 0) {
					const last = selectedValues.value[selectedValues.value.length - 1];
					removeValue(last);
				}
				break;
			case 'Tab':
				if (isOpen.value) toggleOpen(false);
				break;
		}
	};

	return {
		isOpen,
		highlightedIndex,
		searchQuery,
		filteredOptions,
		selectedValues,
		toggleOpen,
		selectOption,
		removeValue,
		toggleSelectAll,
		handleKeyDown,
	};
}

```

### File: packages\fields\src\hooks\useSliderState.ts

```ts
import { useComputed, useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import {
	clamp,
	percentToValue,
	percentToValueLog,
	roundToStep,
	snapToClosest,
	valueToPercent,
	valueToPercentLog,
} from '@projective/utils';
import { SliderMark } from '../types/components/slider-field.ts';

interface UseSliderStateProps {
	value?: number | number[];
	onChange?: (val: number | number[]) => void;
	min: number;
	max: number;
	step: number;
	range?: boolean;
	disabled?: boolean;
	marks?: boolean | number[] | SliderMark[];
	snapToMarks?: boolean;
	vertical?: boolean;
	scale?: 'linear' | 'logarithmic';
	minDistance?: number;
	passthrough?: boolean;
}

export function useSliderState({
	value,
	onChange,
	min,
	max,
	step,
	range,
	disabled,
	marks,
	snapToMarks,
	vertical,
	scale = 'linear',
	minDistance = 0,
	passthrough = false,
}: UseSliderStateProps) {
	const trackRef = useRef<HTMLDivElement>(null);
	const activeHandleIdx = useSignal<number | null>(null);
	const internalValues = useSignal<number[]>([]);

	const isLog = scale === 'logarithmic';

	useEffect(() => {
		if (activeHandleIdx.value !== null) return;
		if (range) {
			if (Array.isArray(value)) internalValues.value = value;
			else internalValues.value = [min, max];
		} else {
			if (typeof value === 'number') internalValues.value = [value];
			else internalValues.value = [min];
		}
	}, [value, range, min, max, activeHandleIdx.value]);

	const snapPoints = useComputed(() => {
		if (!snapToMarks || !marks) return null;
		if (Array.isArray(marks)) {
			return marks.map((m) => (typeof m === 'number' ? m : m.value));
		}
		return null;
	});

	const calcValueFromPointer = (e: { clientX: number; clientY: number }) => {
		if (!trackRef.current) return min;
		const rect = trackRef.current.getBoundingClientRect();

		let percent = 0;
		if (vertical) {
			percent = ((rect.bottom - e.clientY) / rect.height) * 100;
		} else {
			percent = ((e.clientX - rect.left) / rect.width) * 100;
		}

		const rawValue = isLog
			? percentToValueLog(percent, min, max)
			: percentToValue(percent, min, max);

		if (snapToMarks && snapPoints.value) {
			return snapToClosest(rawValue, snapPoints.value);
		}
		return roundToStep(rawValue, step);
	};

	const handlePointerDown = (index: number, e: PointerEvent) => {
		if (disabled) return;
		e.preventDefault();
		e.stopPropagation();

		const target = e.target as HTMLElement;
		target.setPointerCapture(e.pointerId);
		activeHandleIdx.value = index;
		target.focus();
	};

	const handleTrackClick = (e: PointerEvent) => {
		if (disabled || activeHandleIdx.value !== null) return;

		const val = calcValueFromPointer(e);
		const current = internalValues.value;

		let closestIdx = 0;
		let minDiff = Infinity;

		current.forEach((v, i) => {
			const diff = Math.abs(v - val);
			if (diff < minDiff) {
				minDiff = diff;
				closestIdx = i;
			}
		});

		updateValue(closestIdx, val);
	};

	const handlePointerMove = (e: PointerEvent) => {
		if (activeHandleIdx.value === null || disabled) return;
		const newVal = calcValueFromPointer(e);
		updateValue(activeHandleIdx.value, newVal);
	};

	const handlePointerUp = (e: PointerEvent) => {
		if (activeHandleIdx.value !== null) {
			const target = e.target as HTMLElement;
			target.releasePointerCapture(e.pointerId);
			activeHandleIdx.value = null;
		}
	};

	const updateValue = (index: number, rawNewValue: number) => {
		const current = [...internalValues.value];
		let newValue = clamp(rawNewValue, min, max);

		// Collision / Passthrough Logic
		if (!passthrough) {
			const dist = minDistance;

			// Check Previous
			if (index > 0) {
				const prevVal = current[index - 1];
				if (newValue < prevVal + dist) newValue = prevVal + dist;
			}

			// Check Next
			if (index < current.length - 1) {
				const nextVal = current[index + 1];
				if (newValue > nextVal - dist) newValue = nextVal - dist;
			}
		}

		newValue = clamp(newValue, min, max);

		if (current[index] !== newValue) {
			current[index] = newValue;
			internalValues.value = current;
			if (range) onChange?.(current);
			else onChange?.(current[0]);
		}
	};

	const handleStyles = useComputed(() => {
		return internalValues.value.map((v) => {
			const pct = isLog ? valueToPercentLog(v, min, max) : valueToPercent(v, min, max);

			return vertical ? { bottom: `${pct}%`, left: '50%' } : { left: `${pct}%`, top: '50%' };
		});
	});

	const trackFillStyle = useComputed(() => {
		const count = internalValues.value.length;
		if (count === 0) return {};

		// For Track Fill, we always want min to max visually,
		// regardless of which handle is which (if passthrough is on).
		const values = [...internalValues.value].sort((a, b) => a - b);
		const firstVal = values[0];
		const lastVal = values[count - 1];

		const startPct = range
			? (isLog ? valueToPercentLog(firstVal, min, max) : valueToPercent(firstVal, min, max))
			: 0;

		const endPct = isLog ? valueToPercentLog(lastVal, min, max) : valueToPercent(lastVal, min, max);

		const size = Math.abs(endPct - startPct);
		const startPos = Math.min(startPct, endPct);

		return vertical
			? { bottom: `${startPos}%`, height: `${size}%`, left: 0, width: '100%' }
			: { left: `${startPos}%`, width: `${size}%`, top: 0, height: '100%' };
	});

	return {
		trackRef,
		internalValues,
		activeHandleIdx,
		handleStyles,
		trackFillStyle,
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
		handleTrackClick,
	};
}

```

### File: packages\fields\src\types\components\combobox-field.ts

```ts
import { SelectFieldProps } from './select-field.ts';

/**
 * ComboboxField specific props.
 */
export interface ComboboxFieldProps<T = string> extends SelectFieldProps<T> {
	// Combobox specific props
}

```

### File: packages\fields\src\types\components\date-field.ts

```ts
import { ComponentChildren } from 'preact';
import { AdornmentProps, ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';
import { DateTime } from '@projective/types';

export type DateSelectionMode = 'single' | 'multiple' | 'range';
export type DateFieldVariant = 'popup' | 'inline' | 'input';

// The value type changes based on mode
export type SingleDateValue = DateTime | null;
export type MultipleDateValue = DateTime[];
export type RangeDateValue = [DateTime | null, DateTime | null];

export type DateValue = SingleDateValue | MultipleDateValue | RangeDateValue;

/**
 * Modifiers allow external logic to style specific dates.
 * e.g. { disabled: (d) => d.isWeekend(), highlighted: (d) => d.day === 1 }
 */
export type DateModifiers = {
	disabled?: (date: DateTime) => boolean;
	highlighted?: (date: DateTime) => boolean;
	hidden?: (date: DateTime) => boolean;
	[key: string]: ((date: DateTime) => boolean) | undefined;
};

export interface DateFieldProps extends
	// We override ValueFieldProps because 'value' is dynamic here
	Omit<ValueFieldProps<any>, 'value' | 'onChange'>,
	AdornmentProps,
	Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
	Omit<MessageWrapperProps, 'error' | 'hint'> {
	value?: DateValue;
	onChange?: (value: any) => void; // Typed loosely here, narrowed in component

	/**
	 * How the component behaves.
	 * - popup: Standard input with dropdown (Default)
	 * - inline: Calendar rendered directly in page
	 * - input: Text input only (validation only)
	 */
	variant?: DateFieldVariant;

	/**
	 * Selection logic.
	 * - single: One date
	 * - multiple: Array of dates
	 * - range: [Start, End]
	 */
	selectionMode?: DateSelectionMode;

	/**
	 * External logic to style/disable dates.
	 * Use this for "Every Monday" or "Blocked Dates" logic.
	 */
	modifiers?: DateModifiers;

	minDate?: DateTime;
	maxDate?: DateTime;
	format?: string;
}

```

### File: packages\fields\src\types\components\datetime-field.ts

```ts
import { AdornmentProps, ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';
import { DateTime } from '@projective/types';

/**
 * DateTimeField specific props.
 */
export interface DateTimeFieldProps
	extends
		ValueFieldProps<DateTime>,
		AdornmentProps,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	min?: DateTime;
	max?: DateTime;
	clearable?: boolean;
}

```

### File: packages\fields\src\types\components\file-drop.ts

```ts
import { BaseFieldProps, ValueFieldProps } from '../core.ts';
import { Signal } from '@preact/signals';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

/**
 * FileDrop specific props.
 */
export interface FileDropProps
	extends
		ValueFieldProps<File[]>,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	accept?: string;
	multiple?: boolean;
	maxSize?: number;
	maxFiles?: number;
}

```

### File: packages\fields\src\types\components\money-field.ts

```ts
import { ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

/**
 * MoneyField specific props.
 */
export interface MoneyFieldProps
	extends
		ValueFieldProps<number>,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	currency?: string;
	locale?: string;
}

```

### File: packages\fields\src\types\components\rich-text-field.ts

```ts
import { JSX } from 'preact';
import { Signal } from '@preact/signals';
import { ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

export type RichTextFormat = 'delta' | 'html' | 'markdown';
export type RichTextVariant = 'framed' | 'inline';

export interface RichTextFieldProps
	extends
		ValueFieldProps<string>,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	outputFormat?: RichTextFormat;

	toolbar?: 'basic' | 'full' | any[];
	variant?: RichTextVariant;
	secureLinks?: boolean;

	onImageUpload?: (file: File) => Promise<string>;

	placeholder?: string;
	readOnly?: boolean;

	/** Minimum height of the editor area (e.g. "150px") */
	minHeight?: string | number;

	/** Maximum height before scrolling occurs (e.g. "300px") */
	maxHeight?: string | number;

	/** Soft limit for character count. Shows red counter if exceeded. */
	maxLength?: number;

	/** Whether to show the character counter */
	showCount?: boolean;
}

```

### File: packages\fields\src\types\components\select-field.ts

```ts
import { JSX } from 'preact';
import { AdornmentProps, ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

/**
 * Select option interface.
 */
export interface SelectOption<T = string> {
	label: string;
	value: T;
	disabled?: boolean;
	icon?: JSX.Element;
	avatarUrl?: string;
	/**
	 * Nested options for groups.
	 */
	options?: SelectOption<T>[];
	/**
	 * Legacy flat grouping (deprecated in favor of options nesting)
	 */
	group?: string;
}

export type SelectDisplayMode = 'chips-inside' | 'chips-below' | 'count' | 'text';

/**
 * SelectField specific props.
 */
export interface SelectFieldProps<T = string> extends
	// We allow T | T[] for value
	Omit<ValueFieldProps<T | T[]>, 'value' | 'onChange'>,
	AdornmentProps,
	Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
	Omit<MessageWrapperProps, 'error' | 'hint'> {
	// Value & Change override for generics
	value?: T | T[] | any;
	onChange?: (value: T | T[]) => void;

	options: SelectOption<T>[];
	multiple?: boolean;
	searchable?: boolean;
	clearable?: boolean;
	loading?: boolean;

	// Multi-select config
	displayMode?: SelectDisplayMode;
	enableSelectAll?: boolean;

	/**
	 * Defines behavior when a group option is clicked.
	 * - 'value': Selects the group's own value (treated as a selectable item).
	 * - 'members': Selects/Deselects all descendant leaf options (only valid if multiple=true).
	 * @default 'value'
	 */
	groupSelectMode?: 'value' | 'members';

	// Custom Icons
	icons?: {
		arrow?: JSX.Element;
		arrowOpen?: JSX.Element;
		check?: JSX.Element;
		remove?: JSX.Element;
		loading?: JSX.Element;
		invalid?: JSX.Element;
		valid?: JSX.Element;
	};
}

```

### File: packages\fields\src\types\components\slider-field.ts

```ts
import { ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

/**
 * SliderField specific props.
 */
export interface SliderMark {
	value: number;
	label?: string;
	className?: string; // ADDED: Allows custom CSS targeting per mark type
}

/**
 * SliderField specific props.
 */
export interface SliderFieldProps
	extends
		ValueFieldProps<number | number[]>,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	min?: number;
	max?: number;
	step?: number;
	marks?: boolean | number[] | SliderMark[];
	range?: boolean;
	vertical?: boolean;
	scale?: 'linear' | 'logarithmic';
	minDistance?: number;
	snapToMarks?: boolean;
	height?: string;
	passthrough?: boolean;
}

```

### File: packages\fields\src\types\components\tag-input.ts

```ts
import { ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

/**
 * TagInput specific props.
 */
export interface TagInputProps
	extends
		ValueFieldProps<string[]>,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	// Tag specific props can be added here
}

```

### File: packages\fields\src\types\components\text-field.ts

```ts
import { AdornmentProps, ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

/**
 * TextField specific props.
 * Extends BaseFieldProps (via ValueFieldProps) and Wrapper Props.
 */
export interface TextFieldProps
	extends
		ValueFieldProps<string>,
		AdornmentProps,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search';
	multiline?: boolean;
	rows?: number;
	maxRows?: number;
	autoComplete?: string;
	pattern?: string;
	/** Minimum value (for type="number" or "date" etc.) */
	min?: number | string;
	/** Maximum value (for type="number" or "date" etc.) */
	max?: number | string;
	/** Minimum character length */
	minLength?: number;
	/** Maximum character length */
	maxLength?: number;
	showCount?: boolean;
	onInput?: (e: any) => void;
	onBlur?: (e: any) => void;
	onFocus?: (e: any) => void;
}

```

### File: packages\fields\src\types\components\time-field.ts

```ts
import { DateTime } from '@projective/types';
import { AdornmentProps, ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

export type TimeSelectionMode = 'single' | 'multiple';
export type TimeValue = DateTime | DateTime[];

/**
 * TimeField specific props.
 */
export interface TimeFieldProps extends
	// Override generic ValueFieldProps to support arrays
	Omit<ValueFieldProps<any>, 'value' | 'onChange'>,
	AdornmentProps,
	Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
	Omit<MessageWrapperProps, 'error' | 'hint'> {
	value?: TimeValue;
	onChange?: (value: TimeValue) => void;

	/**
	 * Visual variant
	 * @default 'popup'
	 */
	variant?: 'popup' | 'inline' | 'input';

	/**
	 * Selection mode
	 * @default 'single'
	 */
	selectionMode?: TimeSelectionMode;
}

```

### File: packages\fields\src\types\core.ts

```ts
import { Signal } from '@preact/signals';
import { CSSProperties, JSX } from 'preact';

/**
 * Base properties shared by all form fields.
 */
export interface BaseFieldProps {
	id?: string;
	name?: string;
	label?: string;
	placeholder?: string;
	disabled?: boolean | Signal<boolean>;
	readonly?: boolean | Signal<boolean>;
	loading?: boolean | Signal<boolean>;
	required?: boolean;
	floating?: boolean;
	className?: string;
	style?: CSSProperties;
}

/**
 * Visual variants for fields.
 */
export type FieldVariant = 'outlined' | 'filled' | 'standard';

/**
 * Density/Size variants.
 */
export type FieldDensity = 'compact' | 'normal' | 'comfortable';

/**
 * Validation status.
 */
export type ValidationStatus =
	| 'success'
	| 'warning'
	| 'error'
	| 'info'
	| 'neutral';

/**
 * Generic interface for fields that hold a value.
 */
export interface ValueFieldProps<T> extends BaseFieldProps {
	value?: T | Signal<T>;
	defaultValue?: T;
	onChange?: (value: T) => void;
	error?: string | Signal<string | undefined>;
	hint?: string;
}

/**
 * Interface for fields that support adornments (icons/text).
 */
export interface AdornmentProps {
	prefix?: JSX.Element | string;
	suffix?: JSX.Element | string;
	onPrefixClick?: (e: MouseEvent) => void;
	onSuffixClick?: (e: MouseEvent) => void;
}

```

### File: packages\fields\src\types\file.ts

```ts
import { FileWithMeta } from '@projective/types';
import { ValueFieldProps } from './core.ts';
import { LabelWrapperProps, MessageWrapperProps } from './wrappers.ts';
import { Signal } from '@preact/signals';

export type FileStatus = 'pending' | 'processing' | 'ready' | 'error';

export interface FileError {
	code: string;
	message: string;
}

export interface FileProcessor {
	id: string;
	name: string;
	match: (file: File) => boolean;
	process: (
		file: File,
		onProgress?: (pct: number) => void,
	) => Promise<{ file: File; metadata?: any }>;
}

export interface FileFieldProps
	extends
		ValueFieldProps<FileWithMeta[]>,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	accept?: string;
	maxSize?: number;
	maxFiles?: number;
	multiple?: boolean;
	layout?: 'list' | 'grid';
	dropzoneLabel?: string;
	processors?: FileProcessor[];
	onDrop?: (acceptedFiles: File[], rejectedFiles: FileWithMeta[]) => void;
	value?: Signal<FileWithMeta[]>;
	onChange?: (files: FileWithMeta[]) => void;
	variant?: 'split' | 'single';
	onLibraryClick?: () => void;
	listPosition?: 'top' | 'bottom' | 'none';
	actionPosition?: 'below' | 'overlay';
}

```

### File: packages\fields\src\types\wrappers.ts

```ts
import { Signal } from '@preact/signals';
import { JSX } from 'preact';

export type HelpPosition = 'inline' | 'top-right' | 'bottom-right' | 'bottom-left';

/**
 * Props for the LabelWrapper component.
 */
export interface LabelWrapperProps {
	id?: string;
	label?: string;
	required?: boolean;
	floating?: boolean;

	/**
	 * Tooltip text to display.
	 */
	help?: string | JSX.Element;

	/**
	 * Optional URL to navigate to when the help icon is clicked.
	 */
	helpLink?: string;

	/**
	 * Position of the help icon.
	 * - 'inline': Next to the label text (moves with label).
	 * - 'top-right': Fixed to the top-right of the component.
	 * - 'bottom-right': Fixed to the bottom-right.
	 * - 'bottom-left': Fixed to the bottom-left.
	 * @default 'inline'
	 */
	helpPosition?: HelpPosition;

	active?: boolean | Signal<boolean>;
	error?: boolean | Signal<boolean>;
	disabled?: boolean | Signal<boolean>;
	className?: string;
	/** Inline styles for precise control */
	style?: JSX.CSSProperties;
	/**
	 * Position of the label relative to the field.
	 * @default "top"
	 */
	position?: 'top' | 'left' | 'right' | 'bottom';
	/**
	 * Floating behavior rules.
	 * - auto: Floats when focused or has value (default)
	 * - always: Always floating (static top)
	 * - never: Never floats (placeholder style)
	 */
	floatingRule?: 'auto' | 'always' | 'never';
	/**
	 * Origin point for floating animation.
	 * - top-left: Standard Material (default)
	 * - center: Starts as placeholder, moves up
	 */
	floatingOrigin?: 'top-left' | 'center';
	/**
	 * If true, adjusts start position for textareas (top aligned vs center aligned)
	 */
	multiline?: boolean;
}

/**
 * Props for the AdornmentWrapper component.
 */
export interface AdornmentWrapperProps {
	children?: JSX.Element | string;
	position?: 'prefix' | 'suffix';
	onClick?: (e: MouseEvent) => void;
	className?: string;
}

/**
 * Props for the MessageWrapper component.
 */
export interface MessageWrapperProps {
	error?: string | Signal<string | undefined>;
	warning?: string | Signal<string | undefined>;
	info?: string | Signal<string | undefined>;
	hint?: string;
}

/**
 * Props for the SkeletonWrapper component.
 */
export interface SkeletonWrapperProps {
	loading?: boolean | Signal<boolean>;
	variant?: 'rect' | 'circle' | 'pill';
	width?: string | number;
	height?: string | number;
	className?: string;
}

/**
 * Props for the EffectWrapper component.
 */
export interface EffectWrapperProps {
	focused?: boolean | Signal<boolean>;
	disabled?: boolean | Signal<boolean>;
	children?: JSX.Element | JSX.Element[];
}

/**
 * Props for the FieldArrayWrapper component.
 */
export interface FieldArrayWrapperProps<T> {
	items: T[] | Signal<T[]>;
	onAdd?: () => void;
	onRemove?: (index: number) => void;
	renderItem: (item: T, index: number) => JSX.Element;
	renderAddButton?: (onClick: () => void) => JSX.Element;
	renderRemoveButton?: (onClick: () => void) => JSX.Element;
	className?: string;
	maxItems?: number;
}

```

### File: packages\fields\src\wrappers\AdornmentWrapper.tsx

```tsx
import { JSX } from 'preact';
import '../styles/wrappers/adornment-wrapper.css';

interface AdornmentWrapperProps {
	children?: JSX.Element | string;
	position: 'prefix' | 'suffix';
	onClick?: (e: MouseEvent) => void;
	className?: string;
}

export function AdornmentWrapper(props: AdornmentWrapperProps) {
	if (!props.children) return null;

	const classes = [
		'field-adornment',
		`field-adornment--${props.position}`,
		props.onClick && 'field-adornment--interactive',
		props.className,
	]
		.filter(Boolean)
		.join(' ');

	return (
		<div className={classes} onClick={props.onClick}>
			{props.children}
		</div>
	);
}

```

### File: packages\fields\src\wrappers\EffectWrapper.tsx

```tsx
import { JSX } from 'preact';
import { Signal } from '@preact/signals';
import { useRipple } from '@projective/ui';
import '../styles/wrappers/effect-wrapper.css';

interface EffectWrapperProps {
	focused?: boolean | Signal<boolean>;
	disabled?: boolean | Signal<boolean>;
	children?: JSX.Element | JSX.Element[]; // To allow wrapping content if needed, though usually it's an overlay
}

export function EffectWrapper(props: EffectWrapperProps) {
	const isFocused = props.focused instanceof Signal ? props.focused.value : props.focused;
	const isDisabled = props.disabled instanceof Signal ? props.disabled.value : props.disabled;

	const { ripples } = useRipple();

	if (isDisabled) return null;

	// We attach the click listener to the parent in the Field component usually,
	// but here we just render the visual effects.
	// The consumer of EffectWrapper should call addRipple.
	// Actually, to make it self-contained, we might need to attach to parent,
	// but for now let's expose the ripple mechanism or assume the parent handles the click
	// and we just render the ripples.

	// Wait, the requirement says "Handle Ripple effects".
	// Usually this is an overlay that captures clicks or is absolutely positioned.
	// Let's make it an overlay that passes through clicks but registers ripples.

	return (
		<>
			<div
				className={`field-focus-ring ${isFocused ? 'field-focus-ring--active' : ''}`}
			/>
			<div
				className='field-ripple-container'
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					overflow: 'hidden',
					pointerEvents: 'none',
					borderRadius: 'inherit',
				}}
			>
				{ripples.value.map((r) => (
					<span
						key={r.id}
						className='field-ripple'
						style={{ left: r.x, top: r.y }}
					/>
				))}
			</div>
		</>
	);
}

// We also need to export the hook so components can use it if they want manual control
export { useRipple };

```

### File: packages\fields\src\wrappers\FieldArrayWrapper.tsx

```tsx
import { JSX } from 'preact';
import { Signal } from '@preact/signals';
import '../styles/wrappers/field-array-wrapper.css';

interface FieldArrayWrapperProps<T> {
	items: T[] | Signal<T[]>;
	onAdd?: () => void;
	onRemove?: (index: number) => void;
	renderItem: (item: T, index: number) => JSX.Element;
	renderAddButton?: (onClick: () => void) => JSX.Element;
	renderRemoveButton?: (onClick: () => void) => JSX.Element;
	className?: string;
	maxItems?: number;
}

export function FieldArrayWrapper<T>(props: FieldArrayWrapperProps<T>) {
	const items = props.items instanceof Signal ? props.items.value : props.items;

	return (
		<div className={`field-array ${props.className || ''}`}>
			{items.map((item, index) => (
				<div key={index} className='field-array__item'>
					<div style={{ flex: 1 }}>
						{props.renderItem(item, index)}
					</div>
					{props.onRemove && (
						<div className='field-array__action'>
							{props.renderRemoveButton
								? (
									props.renderRemoveButton(() => props.onRemove!(index))
								)
								: (
									<button
										type='button'
										onClick={() => props.onRemove!(index)}
										className='field-array__remove-btn'
										aria-label='Remove item'
									>
										&times;
									</button>
								)}
						</div>
					)}
				</div>
			))}

			{props.onAdd &&
				(!props.maxItems || items.length < props.maxItems) && (
				<div className='field-array__add'>
					{props.renderAddButton
						? (
							props.renderAddButton(props.onAdd)
						)
						: (
							<button
								type='button'
								onClick={props.onAdd}
								className='field-array__add-btn'
							>
								+ Add Item
							</button>
						)}
				</div>
			)}
		</div>
	);
}

```

### File: packages\fields\src\wrappers\GlobalFileDrop.tsx

```tsx
import { ComponentChildren } from 'preact';
import { useGlobalDrag } from '../hooks/useGlobalDrag.ts';
import { FileFieldProps } from '../types/file.ts';
import { FileDrop } from '../components/FileDrop.tsx';

interface GlobalFileDropProps extends FileFieldProps {
	children: ComponentChildren;
	overlayText?: string;
}

export default function GlobalFileDrop(props: GlobalFileDropProps) {
	const isDragging = useGlobalDrag();
	const { children, overlayText, ...fileDropProps } = props;

	return (
		<div
			className='global-drop-wrapper'
			style={{ position: 'relative', height: '100%', minHeight: '100vh' }}
		>
			{/* 1. Main Content */}
			<div className='global-drop-content'>
				{children}
			</div>

			{/* 2. Overlay (Visible on Drag) */}
			{isDragging.value && (
				<div
					className='global-drop-overlay'
					style={{
						position: 'fixed',
						inset: 0,
						zIndex: 9999,
						background: 'rgba(255, 255, 255, 0.9)',
						backdropFilter: 'blur(4px)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: '3rem',
					}}
				>
					{
						/* We reuse FileDrop but apply specific styles to make it fill the modal
            and hide the default list, acting purely as a target.
          */
					}
					<div style={{ width: '100%', height: '100%', maxWidth: '800px', maxHeight: '600px' }}>
						<FileDrop
							{...fileDropProps}
							className='file-drop--global-active'
							dropzoneLabel={overlayText || 'Drop files anywhere to upload'}
							layout='list'
						/>
					</div>
				</div>
			)}
		</div>
	);
}

```

### File: packages\fields\src\wrappers\LabelWrapper.tsx

```tsx
import '../styles/wrappers/label-wrapper.css';
import '../styles/components/help-tooltip.css';
import { Signal } from '@preact/signals';
import { LabelWrapperProps } from '../types/wrappers.ts';
import { HelpTooltip } from '../components/HelpTooltip.tsx';

export function LabelWrapper(props: LabelWrapperProps) {
	if (!props.label) return null;

	const isActive = props.active instanceof Signal ? props.active.value : props.active;
	const isError = props.error instanceof Signal ? props.error.value : props.error;
	const isDisabled = props.disabled instanceof Signal ? props.disabled.value : props.disabled;

	const {
		position = 'top',
		floatingRule = 'auto',
		floatingOrigin = 'top-left',
		helpPosition = 'inline',
	} = props;

	// Determine if floating styles should be applied (Absolute positioning)
	const canFloat = position === 'top' && floatingRule !== 'never';
	const isFloating = canFloat;

	// Determine if the label is currently in the "up" (active) state
	const isFloatedUp = floatingRule === 'always' || (floatingRule === 'auto' && isActive);

	const labelClasses = [
		'field-label',
		`field-label--pos-${position}`,
		isFloating && 'field-label--floating',
		isFloating && `field-label--float-from-${floatingOrigin}`,
		props.multiline && 'field-label--multiline',
		isFloatedUp && 'field-label--active',
		isError && 'field-label--error',
		isDisabled && 'field-label--disabled',
		props.className,
	]
		.filter(Boolean)
		.join(' ');

	// Render Helper
	const tooltip = props.help
		? (
			<HelpTooltip
				content={props.help}
				href={props.helpLink}
				className={helpPosition !== 'inline' ? `help-tooltip--${helpPosition}` : ''}
			/>
		)
		: null;

	return (
		<>
			<div className={labelClasses} style={props.style}>
				<label htmlFor={props.id}>
					{props.label}
					{props.required && <span className='field-label__required'>*</span>}
				</label>

				{/* Render inline if position is inline */}
				{helpPosition === 'inline' && tooltip}
			</div>

			{/* Render outside if position is corner-based (Detached from label transforms) */}
			{helpPosition !== 'inline' && tooltip}
		</>
	);
}

```

### File: packages\fields\src\wrappers\MessageWrapper.tsx

```tsx
import { Signal } from '@preact/signals';
import '../styles/wrappers/message-wrapper.css';

interface MessageWrapperProps {
	error?: string | Signal<string | undefined>;
	warning?: string | Signal<string | undefined>;
	info?: string | Signal<string | undefined>;
	hint?: string;
}

export function MessageWrapper(props: MessageWrapperProps) {
	const error = props.error instanceof Signal ? props.error.value : props.error;
	const warning = props.warning instanceof Signal ? props.warning.value : props.warning;
	const info = props.info instanceof Signal ? props.info.value : props.info;

	// Priority: Error > Warning > Info > Hint
	const message = error || warning || info || props.hint;
	const type = error ? 'error' : warning ? 'warning' : info ? 'info' : 'hint';

	if (!message) {
		return (
			<div
				className='field-message field-message--hidden'
				aria-hidden='true'
			/>
		);
	}

	const classes = [
		'field-message',
		`field-message--${type}`,
	].join(' ');

	return (
		<div className={classes} role={type === 'error' ? 'alert' : 'status'}>
			{message}
		</div>
	);
}

```

### File: packages\fields\src\wrappers\SkeletonWrapper.tsx

```tsx
import { Signal } from '@preact/signals';
import '../styles/wrappers/skeleton-wrapper.css';

interface SkeletonWrapperProps {
	loading?: boolean | Signal<boolean>;
	variant?: 'rect' | 'circle' | 'pill';
	width?: string | number;
	height?: string | number;
	className?: string;
}

export function SkeletonWrapper(props: SkeletonWrapperProps) {
	const isLoading = props.loading instanceof Signal ? props.loading.value : props.loading;

	if (!isLoading) return null;

	const classes = [
		'field-skeleton',
		'field-skeleton--pulse',
		`field-skeleton--${props.variant || 'rect'}`,
		props.className,
	]
		.filter(Boolean)
		.join(' ');

	const style = {
		width: props.width,
		height: props.height,
	};

	return <div className={classes} style={style} aria-hidden='true' />;
}

```

