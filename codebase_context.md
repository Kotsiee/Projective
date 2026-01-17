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
./packages/fields/
  fields/
  deno.json
  mod.ts
  src/
  components/
  accordion/
  Accordion.tsx
  AccordionContent.tsx
  AccordionItem.tsx
  AccordionTrigger.tsx
  index.ts
  ComboboxField.tsx
  DateField.tsx
  datetime/
  Calendar.tsx
  TimeClock.tsx
  DateTimeField.tsx
  feedback/
  toast/
  FileDrop.tsx
  HelpTooltip.tsx
  MoneyField.tsx
  overlays/
  Popover.tsx
  RichTextField.tsx
  SelectField.tsx
  SliderField.tsx
  splitter/
  index.ts
  Splitter.tsx
  SplitterGutter.tsx
  SplitterPane.tsx
  stepper/
  index.ts
  Step.tsx
  Stepper.tsx
  StepperContent.tsx
  StepperFooter.tsx
  StepperHeader.tsx
  StepperPanel.tsx
  TagInput.tsx
  TextField.tsx
  TimeField.tsx
  core/
  toast.ts
  hooks/
  useAccordion.ts
  useCurrencyMask.ts
  useFieldState.ts
  useFileProcessor.ts
  useGlobalDrag.ts
  useInteraction.ts
  useRipple.ts
  useSelectState.ts
  useSliderState.ts
  useSplitter.ts
  useStepper.ts
  styles/
  components/
  accordion.css
  calendar.css
  datetime-field.css
  help-tooltip.css
  splitter.css
  stepper.css
  time-clock.css
  toast.css
  fields/
  combobox-field.css
  date-field.css
  file-drop.css
  rich-text-field.css
  select-field.css
  slider-field.css
  tag-input.css
  text-field.css
  overlays/
  popover.css
  theme.css
  wrappers/
  adornment-wrapper.css
  effect-wrapper.css
  field-array-wrapper.css
  label-wrapper.css
  message-wrapper.css
  skeleton-wrapper.css
  types/
  components/
  accordion.ts
  combobox-field.ts
  date-field.ts
  datetime-field.ts
  file-drop.ts
  money-field.ts
  rich-text-field.ts
  select-field.ts
  slider-field.ts
  splitter.ts
  stepper.ts
  tag-input.ts
  text-field.ts
  time-field.ts
  toast.ts
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

```

### File: packages\data\src\components\DataDisplay.tsx

```tsx
import { useMemo, useState } from 'preact/hooks';
import type { CSSProperties, JSX } from 'preact';

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
	style?: CSSProperties;
	interactive?: boolean;
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
	interactive,
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
							interactive={interactive}
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
		let end = visibleRange.end + PREFETCH;

		// 3. CLAMP: If we know the total count, never ask for more than exists.
		// This stops the infinite loop where we keep asking for index 100, 101, etc.
		if (dataset.totalCount !== null) {
			end = Math.min(end, dataset.totalCount - 1);
		}

		// If our view is completely out of bounds (e.g. initial render with 0 items),
		// ensure we at least try to fetch page 0.
		if (end < start && dataset.totalCount === null) {
			end = Math.max(end, pageSize - 1);
		} else if (end < start) {
			// We are past the end of data
			return;
		}

		// 4. Find what's missing
		const gaps = findGaps(Math.floor(start), Math.ceil(end), dataset.order);

		if (gaps.length === 0) return;

		// 5. Optimize requests
		const optimizedGaps = mergeRanges(gaps).map((gap) => {
			const pageStart = Math.floor(gap.start / pageSize) * pageSize;
			// Clamp page end as well to be safe
			let pageEnd = Math.ceil((gap.start + gap.length) / pageSize) * pageSize;

			if (dataset.totalCount !== null) {
				pageEnd = Math.min(pageEnd, dataset.totalCount);
			}

			return { start: pageStart, length: pageEnd - pageStart };
		});

		// 6. Execute Fetch
		optimizedGaps.forEach((range) => {
			if (range.length <= 0) return;

			const reqKey = `${range.start}-${range.length}`;
			if (pendingRequests.current.has(reqKey)) return;

			pendingRequests.current.add(reqKey);
			setIsFetching(true);

			dataSource.fetch(range)
				.then((result) => {
					setDataset(
						mergeItems(
							dataset,
							result.items,
							range.start,
							dataSource,
							result.meta?.totalCount,
							range.length,
						),
					);
				})
				.catch((err) => {
					console.error('Fetch failed', err);
				})
				.finally(() => {
					pendingRequests.current.delete(reqKey);
					// Simple debounce on the spinner to prevent flickering
					if (pendingRequests.current.size === 0) {
						setIsFetching(false);
					}
				});
		});
	}, [visibleRange.start, visibleRange.end, dataset.order, dataset.totalCount, dataSource]);

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
    /* padding: 8px 12px; */
    cursor: default;
    transition: background-color var(--data-transition);
    border-bottom: 1px solid transparent;
    position: relative;
    display: flex;
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
// Styles
import './src/styles/theme.css';

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
export * from './src/hooks/useRipple.ts';
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
export * from './src/components/overlays/Popover.tsx';
export * from './src/components/accordion/index.ts';
export * from './src/components/splitter/index.ts';
export * from './src/components/stepper/index.ts';
export * from './src/components/HelpTooltip.tsx';
export * from './src/components/feedback/toast/index.ts';

```

### File: packages\fields\src\components\accordion\Accordion.tsx

```tsx
import { createContext } from 'preact';
import { useContext, useRef } from 'preact/hooks';
import { AccordionContextValue, AccordionProps } from '../../types/components/accordion.ts';
import { useAccordion } from '../../hooks/useAccordion.ts';

const AccordionContext = createContext<AccordionContextValue | null>(null);

export function useAccordionContext() {
	const ctx = useContext(AccordionContext);
	if (!ctx) throw new Error('Accordion components must be used within an <Accordion>');
	return ctx;
}

export function Accordion({
	children,
	type = 'single',
	value,
	defaultValue,
	onValueChange,
	collapsible = false,
	disabled = false,
	variant = 'outlined',
	density = 'normal',
	className,
	style,
}: AccordionProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	const { expandedValues, toggle, expandAll, collapseAll, isDisabled } = useAccordion({
		value,
		defaultValue,
		onValueChange,
		type,
		collapsible,
		disabled,
	});

	// --- Keyboard Navigation ---
	const handleKeyDown = (e: KeyboardEvent) => {
		if (!containerRef.current) return;

		const key = e.key;
		const navKeys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
		if (!navKeys.includes(key)) return;

		// Find all triggers belonging to THIS accordion instance
		// We use scoped selector to try and avoid nested ones,
		// though strict nesting requires stopPropagation on the child.
		const triggers = Array.from(
			containerRef.current.querySelectorAll<HTMLButtonElement>(
				'[data-accordion-trigger]:not([disabled])',
			),
		);

		const activeElement = document.activeElement as HTMLButtonElement;
		const index = triggers.indexOf(activeElement);

		// If focus isn't on a trigger, ignore
		if (index === -1) return;

		e.preventDefault();
		e.stopPropagation(); // Stop parent accordions from handling this

		let nextIndex = index;
		switch (key) {
			case 'ArrowDown':
				nextIndex = (index + 1) % triggers.length;
				break;
			case 'ArrowUp':
				nextIndex = (index - 1 + triggers.length) % triggers.length;
				break;
			case 'Home':
				nextIndex = 0;
				break;
			case 'End':
				nextIndex = triggers.length - 1;
				break;
		}

		triggers[nextIndex]?.focus();
	};

	return (
		<AccordionContext.Provider
			value={{
				expandedValues,
				toggle,
				expandAll,
				collapseAll,
				disabled: isDisabled,
				collapsible,
				type,
				variant,
				density,
			}}
		>
			<div
				ref={containerRef}
				className={`accordion accordion--${variant} accordion--${density} ${className || ''}`}
				style={style}
				onKeyDown={handleKeyDown}
			>
				{children}
			</div>
		</AccordionContext.Provider>
	);
}

```

### File: packages\fields\src\components\accordion\AccordionContent.tsx

```tsx
import { AccordionContentProps } from '../../types/components/accordion.ts';
import { useAccordionItemContext } from './AccordionItem.tsx';

export function AccordionContent({
	children,
	className,
	style,
	keepMounted = true,
}: AccordionContentProps) {
	const { isOpen } = useAccordionItemContext();

	// Performance optimization:
	// If keepMounted is false, we unmount the DOM nodes when closed.
	// Note: CSS Grid animations only work if the element exists.
	// Unmounting removes the exit animation.
	if (!keepMounted && !isOpen.value) {
		return null;
	}

	return (
		<div
			className={`accordion__content ${isOpen.value ? 'accordion__content--open' : ''} ${
				className || ''
			}`}
			style={style}
			data-state={isOpen.value ? 'open' : 'closed'}
			role='region'
		>
			<div className='accordion__content-inner'>
				{children}
			</div>
		</div>
	);
}

```

### File: packages\fields\src\components\accordion\AccordionItem.tsx

```tsx
import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { useComputed } from '@preact/signals';
import { AccordionItemContextValue, AccordionItemProps } from '../../types/components/accordion.ts';
import { useAccordionContext } from './Accordion.tsx';

const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

export function useAccordionItemContext() {
	const ctx = useContext(AccordionItemContext);
	if (!ctx) throw new Error('Accordion Sub-components must be within an AccordionItem');
	return ctx;
}

export function AccordionItem({
	value,
	children,
	disabled,
	className,
	style,
}: AccordionItemProps) {
	const { expandedValues, disabled: rootDisabled } = useAccordionContext();

	const isOpen = useComputed(() => expandedValues.value.has(value));

	const isDisabled = useComputed(() => {
		const localDisabled = disabled instanceof Object && 'value' in disabled
			? disabled.value
			: disabled;
		return rootDisabled.value || !!localDisabled;
	});

	return (
		<AccordionItemContext.Provider value={{ value, isOpen, disabled: isDisabled }}>
			<div
				className={`accordion__item ${isOpen.value ? 'accordion__item--open' : ''} ${
					isDisabled.value ? 'accordion__item--disabled' : ''
				} ${className || ''}`}
				data-state={isOpen.value ? 'open' : 'closed'}
				style={style}
			>
				{children}
			</div>
		</AccordionItemContext.Provider>
	);
}

```

### File: packages\fields\src\components\accordion\AccordionTrigger.tsx

```tsx
import { TargetedMouseEvent } from 'preact';
import { IconChevronDown } from '@tabler/icons-preact';
import { AccordionTriggerProps } from '../../types/components/accordion.ts';
import { useAccordionContext } from './Accordion.tsx';
import { useAccordionItemContext } from './AccordionItem.tsx';

export function AccordionTrigger({
	children,
	className,
	style,
	subtitle,
	startIcon,
	actions,
	icon,
	rotateIcon = true,
}: AccordionTriggerProps) {
	const { toggle } = useAccordionContext();
	const { value, isOpen, disabled } = useAccordionItemContext();

	const handleClick = (_e: TargetedMouseEvent<HTMLButtonElement>) => {
		if (disabled.value) return;
		toggle(value);
	};

	const handleActionClick = (e: TargetedMouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
	};

	const chevron = icon === undefined ? <IconChevronDown size={18} /> : icon;

	return (
		<h3 className='accordion__header'>
			<button
				type='button'
				className={`accordion__trigger ${className || ''}`}
				style={style}
				onClick={handleClick}
				aria-expanded={isOpen.value}
				disabled={disabled.value}
				data-state={isOpen.value ? 'open' : 'closed'}
				data-accordion-trigger='' // Hook for keyboard nav
			>
				{/* 1. Start Icon */}
				{startIcon && (
					<span className='accordion__start-icon'>
						{startIcon}
					</span>
				)}

				{/* 2. Main Content */}
				<div className='accordion__trigger-text'>
					<span className='accordion__title'>{children}</span>
					{subtitle && <span className='accordion__subtitle'>{subtitle}</span>}
				</div>

				{/* 3. Actions & Chevron */}
				<div className='accordion__end-section'>
					{actions && (
						<div
							className='accordion__actions'
							onClick={handleActionClick}
							onKeyDown={(e) => e.stopPropagation()} // Stop Enter/Space from toggling accordion
						>
							{actions}
						</div>
					)}

					{chevron && (
						<span
							className={`accordion__icon ${
								rotateIcon && isOpen.value ? 'accordion__icon--rotated' : ''
							}`}
							aria-hidden='true'
						>
							{chevron}
						</span>
					)}
				</div>
			</button>
		</h3>
	);
}

```

### File: packages\fields\src\components\accordion\index.ts

```ts
import '../../styles/components/accordion.css';

export * from './Accordion.tsx';
export * from './AccordionItem.tsx';
export * from './AccordionTrigger.tsx';
export * from './AccordionContent.tsx';

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
import { Popover } from './overlays/Popover.tsx';
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
			<div className={`field-date field-date--inline ${className || ''}`} style={style}>
				<Calendar
					value={fieldState.value.value}
					onChange={handleDateSelect}
					min={minDate}
					max={maxDate}
					selectionMode={selectionMode}
					modifiers={modifiers}
					className='field-date__calendar--inline'
				/>
				<MessageWrapper error={error} hint={hint} warning={warning} info={info} />
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
					<div onClick={() => !isDisabled && (isOpen.value = !isOpen.value)}>
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
										!isDisabled && (isOpen.value = !isOpen.value);
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
			<MessageWrapper error={error} hint={hint} warning={warning} info={info} />
		</div>
	);
}

```

### File: packages\fields\src\components\datetime\Calendar.tsx

```tsx
import '../../styles/components/calendar.css';
import { useComputed, useSignal } from '@preact/signals';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-preact';
import { DateTime } from '@projective/types';
import {
	DateModifiers,
	DateSelectionMode,
	DateValue,
	RangeDateValue,
} from '../../types/components/date-field.ts';
import { getCalendarGrid, getWeekdayLabels } from '../../../../utils/date-math.ts';

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

	// --- State ---
	const getInitialView = () => {
		if (Array.isArray(value)) {
			// Range or Multiple
			const first = value[0];
			return first ? first : new DateTime();
		}
		return value || new DateTime();
	};

	const viewDate = useSignal(getInitialView());
	const hoverDate = useSignal<DateTime | null>(null);
	const viewScope = useSignal<'days' | 'months' | 'years'>('days');

	// --- Grid Generation ---
	const rawDays = useComputed(() => {
		const ghostDate = selectionMode === 'range' ? hoverDate.value : null;

		return getCalendarGrid(
			viewDate.value,
			value,
			ghostDate,
			min,
			max,
			startOfWeek,
		);
	});

	const weekLabels = getWeekdayLabels(startOfWeek);

	// --- Modifiers Logic ---
	const getModifierClasses = (date: DateTime) => {
		const classes: string[] = [];
		for (const [key, check] of Object.entries(modifiers)) {
			if (check && check(date)) {
				classes.push(`calendar__day--${key}`);
			}
		}
		return classes;
	};

	const checkDisabled = (date: DateTime, baseDisabled: boolean) => {
		if (baseDisabled) return true;
		if (modifiers.disabled && modifiers.disabled(date)) return true;
		return false;
	};

	// --- Interaction Handlers ---
	const handleDayClick = (date: DateTime) => {
		if (checkDisabled(date, false)) return;

		let newValue: any;

		if (selectionMode === 'single') {
			newValue = date;
		} else if (selectionMode === 'multiple') {
			const current = (value as DateTime[]) || [];
			const exists = current.find((d) => d.isSameDay(date));
			if (exists) {
				newValue = current.filter((d) => !d.isSameDay(date));
			} else {
				newValue = [...current, date];
			}
		} else if (selectionMode === 'range') {
			const current = (value as RangeDateValue) || [null, null];
			const [start, end] = current;

			if (!start || (start && end)) {
				// Reset start
				newValue = [date, null];
			} else {
				// Complete range
				if (date.isBefore(start)) {
					newValue = [date, start];
				} else {
					newValue = [start, date];
				}
			}
		}

		onChange?.(newValue);
	};

	const handleNav = (dir: -1 | 1) => {
		if (viewScope.value === 'days') viewDate.value = viewDate.value.add(dir, 'months');
		else if (viewScope.value === 'months') viewDate.value = viewDate.value.add(dir, 'years');
		else viewDate.value = viewDate.value.add(dir * 10, 'years');
	};

	const handleMonthSelect = (monthIndex: number) => {
		// Update viewDate to the selected month, keeping year same, clamping day if needed
		const current = viewDate.value;
		// JS Date month is 0-indexed
		const d = new Date(current.getTime());
		d.setMonth(monthIndex);
		viewDate.value = new DateTime(d);
		viewScope.value = 'days';
	};

	const handleYearSelect = (year: number) => {
		const d = new Date(viewDate.value.getTime());
		d.setFullYear(year);
		viewDate.value = new DateTime(d);
		viewScope.value = 'months';
	};

	// --- Render ---
	const renderDays = () => (
		<>
			<div className='calendar__weekdays'>
				{weekLabels.map((day) => <span key={day} className='calendar__weekday'>{day}</span>)}
			</div>
			<div className='calendar__grid calendar__grid--days'>
				{rawDays.value.map((dayItem, idx) => {
					const isDisabled = checkDisabled(dayItem.date, dayItem.isDisabled);
					const modClasses = getModifierClasses(dayItem.date);

					// Range Hover Preview Logic
					let isRangeHover = false;
					if (selectionMode === 'range' && hoverDate.value && !isDisabled) {
						const [start, end] = (value as RangeDateValue) || [null, null];
						if (start && !end) {
							if (
								dayItem.date.isAfter(start) && dayItem.date.isBefore(hoverDate.value)
							) isRangeHover = true;
							if (
								dayItem.date.isBefore(start) && dayItem.date.isAfter(hoverDate.value)
							) isRangeHover = true;
							if (dayItem.date.isSameDay(hoverDate.value)) isRangeHover = true;
						}
					}

					const classes = [
						'calendar__day',
						!dayItem.isCurrentMonth ? 'calendar__day--muted' : '',
						dayItem.isToday ? 'calendar__day--today' : '',
						isDisabled ? 'calendar__day--disabled' : '',
						dayItem.isSelected ? 'calendar__day--selected' : '',
						dayItem.isRangeStart ? 'calendar__day--range-start' : '',
						dayItem.isRangeEnd ? 'calendar__day--range-end' : '',
						dayItem.isRangeMiddle ? 'calendar__day--range-middle' : '',
						isRangeHover ? 'calendar__day--range-hover' : '',
						...modClasses,
					].filter(Boolean).join(' ');

					return (
						<button
							key={`${idx}`}
							type='button'
							className={classes}
							disabled={isDisabled}
							onClick={(e) => {
								e.preventDefault();
								handleDayClick(dayItem.date);
							}}
							onMouseEnter={() => hoverDate.value = dayItem.date}
						>
							{dayItem.date.getDate()}
						</button>
					);
				})}
			</div>
		</>
	);

	const renderMonths = () => {
		const months = [
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Oct',
			'Nov',
			'Dec',
		];
		const currentMonth = new DateTime().getMonth(); // 1-12
		const currentYear = new DateTime().getYear();
		const viewYear = viewDate.value.getYear();
		const selectedMonth = viewDate.value.getMonth(); // 1-12

		return (
			<div className='calendar__grid calendar__grid--months'>
				{months.map((m, i) => {
					const monthIndex = i; // 0-11
					const isToday = currentYear === viewYear && currentMonth === (monthIndex + 1);
					const isSelected = selectedMonth === (monthIndex + 1);

					return (
						<button
							key={m}
							type='button'
							className={`calendar__cell-lg ${isToday ? 'calendar__cell-lg--today' : ''} ${
								isSelected ? 'calendar__cell-lg--selected' : ''
							}`}
							onClick={(e) => {
								e.preventDefault();
								handleMonthSelect(monthIndex);
							}}
						>
							{m}
						</button>
					);
				})}
			</div>
		);
	};

	const renderYears = () => {
		const currentViewYear = viewDate.value.getYear();
		const startDecade = Math.floor(currentViewYear / 10) * 10;
		const years = Array.from({ length: 12 }, (_, i) => startDecade - 1 + i);
		const todayYear = new DateTime().getYear();

		return (
			<div className='calendar__grid calendar__grid--years'>
				{years.map((y) => {
					const isToday = y === todayYear;
					const isSelected = y === currentViewYear;
					const isMuted = y < startDecade || y > startDecade + 9;

					return (
						<button
							key={y}
							type='button'
							className={`calendar__cell-lg ${isToday ? 'calendar__cell-lg--today' : ''} ${
								isSelected ? 'calendar__cell-lg--selected' : ''
							} ${isMuted ? 'calendar__cell-lg--muted' : ''}`}
							onClick={(e) => {
								e.preventDefault();
								handleYearSelect(y);
							}}
						>
							{y}
						</button>
					);
				})}
			</div>
		);
	};

	// Header Label Logic
	let headerLabel = '';
	if (viewScope.value === 'days') {
		headerLabel = viewDate.value.toFormat('MMMM yyyy');
	} else if (viewScope.value === 'months') {
		headerLabel = viewDate.value.toFormat('yyyy');
	} else {
		// Years view: show decade range
		const currentViewYear = viewDate.value.getYear();
		const startDecade = Math.floor(currentViewYear / 10) * 10;
		headerLabel = `${startDecade} - ${startDecade + 9}`;
	}

	return (
		<div className={`calendar ${className || ''}`} onMouseLeave={() => hoverDate.value = null}>
			<div className='calendar__header'>
				<button type='button' className='calendar__nav-btn' onClick={() => handleNav(-1)}>
					<IconChevronLeft size={20} />
				</button>
				<button
					type='button'
					className='calendar__title-btn'
					onClick={() => {
						if (viewScope.value === 'days') viewScope.value = 'months';
						else if (viewScope.value === 'months') viewScope.value = 'years';
					}}
				>
					{headerLabel}
				</button>
				<button type='button' className='calendar__nav-btn' onClick={() => handleNav(1)}>
					<IconChevronRight size={20} />
				</button>
			</div>
			<div className='calendar__body'>
				{viewScope.value === 'days' && renderDays()}
				{viewScope.value === 'months' && renderMonths()}
				{viewScope.value === 'years' && renderYears()}
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
import { Popover } from './overlays/Popover.tsx';

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

	if (!isValueSignal && value !== undefined && value !== internalSignal.peek()) {
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
											if (v instanceof DateTime) updateDatePart(v);
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

### File: packages\fields\src\components\feedback\toast\index.ts

```ts
import '../../../styles/components/toast.css';
export * from './Toast.tsx';
export * from './ToastProvider.tsx';
export { toast } from '../../../core/toast.ts';

```

### File: packages\fields\src\components\feedback\toast\Toast.tsx

```tsx
import { useEffect, useRef, useState } from 'preact/hooks';
import {
	IconAlertCircle,
	IconAlertTriangle,
	IconCheck,
	IconInfoCircle,
	IconLoader2,
	IconX,
} from '@tabler/icons-preact';
import { ToastData } from '../../../types/components/toast.ts';
import { toast } from '../../../core/toast.ts';

interface ToastProps {
	data: ToastData;
	defaultDuration?: number;
}

export function Toast({ data, defaultDuration = 5000 }: ToastProps) {
	const { id, type, title, message, duration, dismissible, icon, action } = data;
	const [isPaused, setIsPaused] = useState(false);
	const [swipeOffset, setSwipeOffset] = useState(0);
	const [isSwiping, setIsSwiping] = useState(false);

	// --- Timer Logic ---
	const timerRef = useRef<number>();
	const startTimeRef = useRef<number>(Date.now());
	const remainingRef = useRef<number>(duration ?? defaultDuration);

	const startTimer = () => {
		if (remainingRef.current === Infinity) return;

		timerRef.current = setTimeout(() => {
			toast.dismiss(id);
		}, remainingRef.current);

		startTimeRef.current = Date.now();
	};

	const pauseTimer = () => {
		if (timerRef.current) clearTimeout(timerRef.current);
		const elapsed = Date.now() - startTimeRef.current;
		remainingRef.current -= elapsed;
	};

	// Reset timer when type or message changes (Morphing)
	useEffect(() => {
		remainingRef.current = duration ?? defaultDuration;
		startTimeRef.current = Date.now();

		if (!isPaused && !isSwiping) {
			startTimer();
		}
		return () => clearTimeout(timerRef.current);
	}, [duration, type, message, isPaused, isSwiping]); // Added type/message deps

	// --- Swipe Logic ---
	const touchStartRef = useRef<number>(0);

	const handleTouchStart = (e: TouchEvent) => {
		if (!dismissible) return;
		touchStartRef.current = e.touches[0].clientX;
		setIsSwiping(true);
	};

	const handleTouchMove = (e: TouchEvent) => {
		if (!isSwiping) return;
		const currentX = e.touches[0].clientX;
		const diff = currentX - touchStartRef.current;
		if (diff > 0) {
			e.preventDefault();
			setSwipeOffset(diff);
		}
	};

	const handleTouchEnd = () => {
		if (!isSwiping) return;
		setIsSwiping(false);
		if (swipeOffset > 100) {
			setSwipeOffset(window.innerWidth);
			setTimeout(() => toast.dismiss(id), 200);
		} else {
			setSwipeOffset(0);
		}
	};

	const getIcon = () => {
		if (icon) return icon;
		switch (type) {
			case 'success':
				return <IconCheck />;
			case 'error':
				return <IconAlertCircle />;
			case 'warning':
				return <IconAlertTriangle />;
			case 'info':
				return <IconInfoCircle />;
			case 'loading':
				return <IconLoader2 className='stepper__spin' />;
			default:
				return null;
		}
	};

	return (
		<div
			className={`toast toast--${type}`}
			role='alert'
			aria-live={type === 'error' ? 'assertive' : 'polite'}
			onMouseEnter={() => setIsPaused(true)}
			onMouseLeave={() => setIsPaused(false)}
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleTouchEnd}
			style={{
				transform: swipeOffset ? `translateX(${swipeOffset}px)` : undefined,
				opacity: swipeOffset ? 1 - (swipeOffset / 300) : 1,
			}}
		>
			<div className='toast__icon'>
				{getIcon()}
			</div>

			<div className='toast__content'>
				{title && <div className='toast__title'>{title}</div>}
				<div className='toast__message'>{message}</div>
			</div>

			{action && (
				<button
					className='toast__action'
					onClick={(e) => {
						e.stopPropagation();
						action.onClick(e as any);
						// Optional: dismiss on action click?
						// toast.dismiss(id);
					}}
				>
					{action.label}
				</button>
			)}

			{dismissible && (
				<button
					className='toast__close'
					onClick={() => toast.dismiss(id)}
					aria-label='Dismiss'
				>
					<IconX size={18} />
				</button>
			)}
		</div>
	);
}

```

### File: packages\fields\src\components\feedback\toast\ToastProvider.tsx

```tsx
import { ToastProviderProps } from '../../../types/components/toast.ts';
import { toast } from '../../../core/toast.ts';
import { Toast } from './Toast.tsx';

export function ToastProvider({
	position = 'bottom-right',
	limit = 5,
	defaultDuration = 5000,
	className,
	style,
}: ToastProviderProps) {
	const toasts = toast.$state.value;
	const isTop = position.includes('top');
	const visibleToasts = toasts.slice(-limit);

	const renderToasts = isTop ? [...visibleToasts].reverse() : visibleToasts;

	return (
		<div
			className={`toast-viewport toast-viewport--${position} ${className || ''}`}
			style={style}
		>
			{renderToasts.map((t) => (
				<Toast
					key={t.id}
					data={t}
					defaultDuration={defaultDuration}
				/>
			))}
		</div>
	);
}

```

### File: packages\fields\src\components\FileDrop.tsx

```tsx
import '../styles/fields/file-drop.css';
import { JSX } from 'preact';
import { Signal, useSignal } from '@preact/signals';
import { FileFieldProps, FileWithMeta } from '../types/file.ts';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { useFileProcessor } from '../hooks/useFileProcessor.ts';

export function FileDrop(props: FileFieldProps) {
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		accept,
		multiple,
		maxSize,
		maxFiles,
		disabled,
		className,
		style,
		position,
		floatingRule,
		required,
		floating,
		processors,
		onDrop,
		error,
		hint,
		warning,
		info,
		dropzoneLabel,
	} = props;

	// Internal state for files if not controlled
	const internalFiles = useSignal<FileWithMeta[]>([]);

	// Determine if controlled
	const isControlled = value !== undefined;
	const currentFiles = isControlled ? (value || []) : internalFiles.value;

	const handleFilesChange = (newFiles: FileWithMeta[]) => {
		if (!isControlled) {
			internalFiles.value = newFiles;
		}
		onChange?.(newFiles);
	};

	const { addFiles, removeFile } = useFileProcessor(
		currentFiles,
		processors,
		handleFilesChange,
	);

	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const inputRef = useSignal<HTMLInputElement | null>(null);
	const isDragging = useSignal(false);

	const handleDragOver = (e: DragEvent) => {
		e.preventDefault();
		if (isDisabled) return;
		isDragging.value = true;
	};

	const handleDragLeave = (e: DragEvent) => {
		e.preventDefault();
		isDragging.value = false;
	};

	const handleDrop = (e: DragEvent) => {
		e.preventDefault();
		isDragging.value = false;
		if (isDisabled) return;

		if (e.dataTransfer?.files) {
			const dropped = Array.from(e.dataTransfer.files);
			// TODO: Validate maxSize/maxFiles here before adding
			addFiles(dropped);
			onDrop?.(dropped, []); // TODO: Separate rejected
		}
	};

	const handleFileInput = (e: JSX.TargetedEvent<HTMLInputElement>) => {
		if (e.currentTarget.files) {
			const selected = Array.from(e.currentTarget.files);
			addFiles(selected);
		}
	};

	const handleClick = () => {
		if (!isDisabled && inputRef.value) {
			inputRef.value.click();
		}
	};

	return (
		<div className={`field-file ${className || ''}`} style={style}>
			{
				/* <LabelWrapper
				id={id}
				label={label}
				disabled={isDisabled}
				position={position}
				// FIX: Default to 'never' so label is static
				floatingRule={floatingRule ?? 'never'}
				required={required}
				floating={floating}
			/> */
			}

			<div
				className={[
					'field-file__dropzone',
					isDragging.value && 'field-file__dropzone--dragging',
					isDisabled && 'field-file__dropzone--disabled',
				].filter(Boolean).join(' ')}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onClick={handleClick}
			>
				<input
					id={id}
					ref={(el) => {
						inputRef.value = el;
					}}
					type='file'
					className='field-file__input'
					onChange={handleFileInput}
					accept={accept}
					multiple={multiple}
					disabled={!!isDisabled}
				/>

				<div className='field-file__content'>
					<div className='field-file__text'>
						{dropzoneLabel || 'Drag & drop files or click to upload'}
					</div>
				</div>
			</div>

			{/* File List */}
			{
				/* {currentFiles.length > 0 && (
				<div className='field-file__list'>
					{currentFiles.map((file) => (
						<div key={file.id} className='field-file__item'>
							<div className='field-file__item-info'>
								<span className='field-file__item-name'>{file.file.name}</span>
								<span className='field-file__item-size'>
									{(file.file.size / 1024).toFixed(1)} KB
								</span>
							</div>

							{file.status === 'processing' && (
								<div className='field-file__progress'>
									<div
										className='field-file__progress-bar'
										style={{ width: `${file.progress}%` }}
									/>
								</div>
							)}

							{file.status === 'error' && (
								<div className='field-file__error'>
									{file.errors[0]?.message}
								</div>
							)}

							<button
								type='button'
								className='field-file__remove'
								onClick={() => removeFile(file.id)}
								disabled={!!isDisabled}
							>
								×
							</button>
						</div>
					))}
				</div>
			)} */
			}

			<MessageWrapper error={error} hint={hint} warning={warning} info={info} />
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

### File: packages\fields\src\components\overlays\Popover.tsx

```tsx
import { useEffect, useRef, useState } from 'preact/hooks';
import { ComponentChildren } from 'preact';
import '../../styles/overlays/popover.css';

interface PopoverProps {
	isOpen: boolean;
	onClose: () => void;
	trigger: ComponentChildren;
	content: ComponentChildren;
	className?: string;
	/** Force a position or leave auto */
	position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

export function Popover({
	isOpen,
	onClose,
	trigger,
	content,
	className,
	position,
}: PopoverProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const [calculatedPos, setCalculatedPos] = useState<'top' | 'bottom'>('bottom');

	// Auto-Flip Logic
	useEffect(() => {
		if (isOpen && containerRef.current && contentRef.current) {
			const rect = containerRef.current.getBoundingClientRect();
			const contentHeight = 350; // Approx max height of calendar
			const spaceBelow = window.innerHeight - rect.bottom;

			// If explicit override is not set, calculate
			if (!position) {
				if (spaceBelow < contentHeight && rect.top > contentHeight) {
					setCalculatedPos('top');
				} else {
					setCalculatedPos('bottom');
				}
			}
		}
	}, [isOpen, position]);

	// Click Outside & Escape
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				isOpen &&
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				onClose();
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (isOpen && event.key === 'Escape') {
				onClose();
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [isOpen, onClose]);

	// Resolve final classes
	const align = position?.includes('right') ? 'right' : 'left';
	const vert = position?.includes('top')
		? 'top'
		: (position?.includes('bottom') ? 'bottom' : calculatedPos);

	return (
		<div className={`popover-wrapper ${className || ''}`} ref={containerRef}>
			<div className='popover-trigger'>
				{trigger}
			</div>

			<div
				ref={contentRef}
				className={`popover-content popover-content--${vert} popover-content--${align} ${
					isOpen ? 'popover-content--open' : ''
				}`}
			>
				{content}
			</div>
		</div>
	);
}

```

### File: packages\fields\src\components\RichTextField.tsx

```tsx
import { useEffect, useRef } from 'preact/hooks';
import { Signal, useComputed, useSignal } from '@preact/signals';
import { RichTextFieldProps } from '../types/components/rich-text-field.ts';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import '../styles/fields/rich-text-field.css';

let Quill: any = null;

export function RichTextField(props: RichTextFieldProps) {
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

	// Signals for local state
	const length = useSignal(0);

	const getRawValue = () => {
		if (value instanceof Signal) return value.value;
		return value || defaultValue || '';
	};

	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const isReadOnly = !!readOnly || isDisabled;
	const isError = error instanceof Signal ? error.value : error;
	const isWarning = warning instanceof Signal ? warning.value : warning;

	// Computed for character limit style
	const isOverLimit = useComputed(() => maxLength ? length.value > maxLength : false);

	// --- Link Security Blot ---
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

	// --- Image Upload Logic ---
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
					handlers: {
						image: imageHandler,
					},
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
				// Select buttons and dropdowns (selects)
				const controls = toolbarC.querySelectorAll('button, select');
				controls.forEach((control) => {
					control.setAttribute('tabindex', '-1');
				});
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
				} catch (e) {
					// Fallback for non-parseable strings
					quillInstance.current.setText(String(raw));
				}
			}

			// Initial length check
			length.value = Math.max(0, quillInstance.current.getLength() - 1);

			// --- Change Listener ---
			quillInstance.current.on('text-change', () => {
				const delta = quillInstance.current.getContents();
				// Update char count (Quill adds trailing newline)
				length.value = Math.max(0, quillInstance.current.getLength() - 1);

				let output = '';

				if (outputFormat === 'delta') {
					output = JSON.stringify(delta);
				} else if (outputFormat === 'html') {
					output = quillInstance.current.root.innerHTML;
				} else if (outputFormat === 'markdown' && parserRef.current) {
					output = parserRef.current.deltaToMarkdown(delta);
				}

				if (value instanceof Signal) {
					value.value = output;
				}
				onChange?.(output);
			});
		};

		init();
	}, [isReadOnly]);

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
						maxHeight: maxHeight, // Apply scrolling limit
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

	// Unwrap signal value if present, or use raw value
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

					const style = vertical
						? { bottom: `${pct}%`, left: '50%' }
						: { left: `${pct}%`, top: '50%' };

					return (
						<div key={i} className='field-slider__mark' style={style}>
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
				// FIX: Default to 'never' for sliders so label is static above
				floatingRule={floatingRule ?? 'never'}
				required={required}
				floating={floating}
			/>

			{/* Control Wrapper */}
			<div className='field-slider__control' style={wrapperStyle}>
				<div
					className='field-slider__container'
					onClick={(e: MouseEvent) => handleTrackClick(e as PointerEvent)}
				>
					<div className='field-slider__track' ref={trackRef}>
						{/* Fill */}
						<div className='field-slider__fill' style={trackFillStyle.value}></div>

						{/* Marks */}
						{renderMarks()}

						{/* Handles */}
						{handleStyles.value.map((style, index) => {
							const isActive = activeHandleIdx.value === index;
							const val = internalValues.value[index];

							return (
								<div
									key={index}
									className={`field-slider__thumb ${isActive ? 'field-slider__thumb--active' : ''}`}
									style={style}
									tabIndex={isDisabled ? -1 : 0}
									role='slider'
									aria-orientation={vertical ? 'vertical' : 'horizontal'}
									aria-valuemin={min}
									aria-valuemax={max}
									aria-valuenow={val}
									onPointerDown={(e) => handlePointerDown(index, e)}
									onPointerMove={handlePointerMove}
									onPointerUp={handlePointerUp}
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

### File: packages\fields\src\components\splitter\index.ts

```ts
import '../../styles/components/splitter.css';

export * from './Splitter.tsx';
export * from './SplitterPane.tsx';
export * from './SplitterGutter.tsx';

```

### File: packages\fields\src\components\splitter\Splitter.tsx

```tsx
import { createContext, toChildArray, VNode } from 'preact';
import { useContext, useEffect, useMemo, useState } from 'preact/hooks';
import {
	SplitterContextValue,
	SplitterPaneProps,
	SplitterProps,
} from '../../types/components/splitter.ts';
import { useSplitter } from '../../hooks/useSplitter.ts';
import { SplitterGutter } from './SplitterGutter.tsx';

const SplitterContext = createContext<SplitterContextValue | null>(null);

export function useSplitterContext() {
	const ctx = useContext(SplitterContext);
	if (!ctx) throw new Error('Splitter Sub-components must be within a <Splitter>');
	return ctx;
}

export function Splitter({
	children,
	direction = 'horizontal',
	initialSizes,
	minPaneSize = 10,
	breakpoint = 0,
	className,
	style,
	onResizeEnd,
}: SplitterProps) {
	// 1. Process Children to extract configs
	const validChildren = toChildArray(children).filter(Boolean) as VNode<SplitterPaneProps>[];
	const count = validChildren.length;

	// Extract constraints to pass to hook
	const paneConfigs = useMemo(() => {
		return validChildren.map((child) => ({
			minSize: child.props.minSize,
			maxSize: child.props.maxSize,
			collapsible: child.props.collapsible,
			defaultCollapsed: child.props.defaultCollapsed,
		}));
	}, [validChildren]);

	// 2. Hook
	const {
		sizes,
		isResizing,
		containerRef,
		startResize,
		moveSplitter, // <-- Now destructured
		toggleCollapse,
	} = useSplitter({
		count,
		direction,
		initialSizes,
		minPaneSize,
		paneConfigs,
		onResizeEnd,
	});

	// 3. Responsive Logic
	const [isResponsiveStack, setResponsiveStack] = useState(false);

	useEffect(() => {
		if (!breakpoint || !containerRef.current) return;

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const width = entry.contentRect.width;
				setResponsiveStack(width < breakpoint);
			}
		});

		observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, [breakpoint]);

	const activeDirection = isResponsiveStack ? 'vertical' : direction;

	return (
		<SplitterContext.Provider
			value={{
				direction: activeDirection,
				sizes,
				startResize,
				moveSplitter, // <-- Passed to context
				toggleCollapse,
				isResizing,
			}}
		>
			<div
				ref={containerRef}
				className={`splitter splitter--${activeDirection} ${
					isResizing.value ? 'splitter--resizing' : ''
				} ${className || ''}`}
				style={style}
			>
				{validChildren.map((child, index) => {
					const isLast = index === count - 1;
					// Force 100% size if stacked, else use calculated percentage
					const sizeStyle = isResponsiveStack
						? { flexBasis: 'auto', flexGrow: 1 }
						: { flexBasis: `${sizes.value[index]}%` };

					// Hide if collapsed (size 0)
					const isCollapsed = !isResponsiveStack && sizes.value[index] === 0;

					return (
						<>
							<div
								className={`splitter__pane-wrapper ${
									isCollapsed ? 'splitter__pane-wrapper--collapsed' : ''
								}`}
								style={sizeStyle}
							>
								{child}
							</div>

							{!isLast && !isResponsiveStack && (
								<SplitterGutter index={index} direction={activeDirection} />
							)}
							{/* In stack mode, we might want a simple border instead of a resize handle */}
							{!isLast && isResponsiveStack && <div className='splitter__divider-stack' />}
						</>
					);
				})}
			</div>
		</SplitterContext.Provider>
	);
}

```

### File: packages\fields\src\components\splitter\SplitterGutter.tsx

```tsx
import { JSX } from 'preact';
import { useSplitterContext } from './Splitter.tsx';
import { SplitterGutterProps } from '../../types/components/splitter.ts';

export function SplitterGutter({ index, direction }: SplitterGutterProps) {
	const { startResize, moveSplitter, toggleCollapse } = useSplitterContext();

	// Mouse
	const handleMouseDown = (e: JSX.TargetedMouseEvent<HTMLDivElement>) => {
		if (e.button !== 0) return;
		e.preventDefault();
		startResize(index, e.clientX, e.clientY);
	};

	// Touch
	const handleTouchStart = (e: JSX.TargetedTouchEvent<HTMLDivElement>) => {
		// Prevent default to stop scrolling/selection
		// e.preventDefault();
		// Actually, we preventDefault on move, usually okay on start unless it blocks scrolling
		// If we want to allow scrolling if they miss the handle, we don't preventDefault here.
		// BUT for a splitter, grabbing it usually means intent to resize.
		if (e.touches.length === 1) {
			const touch = e.touches[0];
			startResize(index, touch.clientX, touch.clientY);
		}
	};

	const handleDblClick = (e: MouseEvent) => {
		e.preventDefault();
		toggleCollapse(index);
	};

	// Keyboard
	const handleKeyDown = (e: JSX.TargetedKeyboardEvent<HTMLDivElement>) => {
		let delta = 0;
		const step = 2; // 2% per keypress
		const largeStep = 10; // Shift key

		const val = e.shiftKey ? largeStep : step;

		if (direction === 'horizontal') {
			if (e.key === 'ArrowLeft') delta = -val;
			if (e.key === 'ArrowRight') delta = val;
		} else {
			if (e.key === 'ArrowUp') delta = -val;
			if (e.key === 'ArrowDown') delta = val;
		}

		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			toggleCollapse(index);
			return;
		}

		if (delta !== 0) {
			e.preventDefault();
			moveSplitter(index, delta);
		}
	};

	return (
		<div
			className={`splitter__gutter splitter__gutter--${direction}`}
			onMouseDown={handleMouseDown}
			onTouchStart={handleTouchStart}
			onDblClick={handleDblClick}
			onKeyDown={handleKeyDown}
			// Accessibility
			role='separator'
			aria-orientation={direction}
			aria-label='Resize Splitter'
			aria-controls={`pane-${index} pane-${index + 1}`}
			tabIndex={0}
		>
			<div className='splitter__gutter-handle' />
			{/* Invisible Hit Area for easier touch/mouse grabbing */}
			<div className='splitter__gutter-hitbox' />
		</div>
	);
}

```

### File: packages\fields\src\components\splitter\SplitterPane.tsx

```tsx
import { SplitterPaneProps } from '../../types/components/splitter.ts';

export function SplitterPane({ children, className, style }: SplitterPaneProps) {
	return (
		<div className={`splitter__pane ${className || ''}`} style={style}>
			{children}
		</div>
	);
}

```

### File: packages\fields\src\components\stepper\index.ts

```ts
import '../../styles/components/stepper.css';

export * from './Stepper.tsx';
export * from './StepperHeader.tsx';
export * from './Step.tsx';
export * from './StepperContent.tsx';
export * from './StepperPanel.tsx';
export * from './StepperFooter.tsx';

```

### File: packages\fields\src\components\stepper\Step.tsx

```tsx
import { IconCheck, IconExclamationCircle } from '@tabler/icons-preact';
import { useStepperContext } from './Stepper.tsx';
import { StepProps } from '../../types/components/stepper.ts';

export function Step({
	label,
	description,
	icon,
	error,
	disabled,
	optional,
	index = 0,
	isLast,
	className,
	style,
}: StepProps) {
	const { activeStep, goTo, linear, stepErrors, variant } = useStepperContext();

	const isActive = activeStep.value === index;
	const isCompleted = activeStep.value > index;
	const hasError = error || stepErrors.value.has(index);
	const isClickable = !disabled && (!linear || index <= activeStep.value + 1);

	const handleClick = () => {
		if (isClickable) goTo(index);
	};

	// --- Icon Logic ---
	let statusIcon = icon;

	// If variant is 'dot', we don't render numbers inside, just specific icons for states
	if (variant === 'dot') {
		if (hasError) statusIcon = <IconExclamationCircle size={14} />;
		else if (isCompleted) statusIcon = <IconCheck size={12} />;
		else statusIcon = null; // Just a dot
	} else {
		// Standard 'circle' variant
		if (!statusIcon) {
			if (hasError) statusIcon = <IconExclamationCircle size={20} />;
			else if (isCompleted) statusIcon = <IconCheck size={18} />;
			else statusIcon = <span className='stepper__step-number'>{index + 1}</span>;
		}
	}

	const classes = [
		'stepper__step',
		isActive && 'stepper__step--active',
		isCompleted && 'stepper__step--completed',
		hasError && 'stepper__step--error',
		disabled && 'stepper__step--disabled',
		isClickable && 'stepper__step--clickable',
		className,
	].filter(Boolean).join(' ');

	return (
		<div className={classes} style={style} onClick={handleClick}>
			<div className='stepper__step-indicator'>
				{statusIcon}
			</div>

			<div className='stepper__step-content'>
				<div className='stepper__step-title'>
					{label}
					{optional && <span className='stepper__step-optional'>(Optional)</span>}
				</div>
				{description && <div className='stepper__step-desc'>{description}</div>}
			</div>

			{!isLast && (
				<div className={`stepper__connector ${isCompleted ? 'stepper__connector--active' : ''}`} />
			)}
		</div>
	);
}

```

### File: packages\fields\src\components\stepper\Stepper.tsx

```tsx
import { createContext } from 'preact';
import { useContext, useEffect, useRef, useState } from 'preact/hooks';
import { StepperContextValue, StepperProps } from '../../types/components/stepper.ts';
import { useStepper } from '../../hooks/useStepper.ts';

const StepperContext = createContext<StepperContextValue | null>(null);

export function useStepperContext() {
	const ctx = useContext(StepperContext);
	if (!ctx) throw new Error('Stepper components must be within <Stepper>');
	return ctx;
}

export function Stepper({
	children,
	activeStep,
	defaultActiveStep,
	orientation = 'horizontal',
	variant = 'circle',
	responsive, // New prop
	linear = true,
	keepMounted = true,
	onStepChange,
	onComplete,
	beforeStepChange,
	className,
	style,
}: StepperProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [isCompact, setCompact] = useState(false);

	const {
		activeStep: currentStep,
		totalSteps,
		isLoading,
		stepErrors,
		next,
		back,
		goTo,
		setTotalSteps,
		setStepError,
	} = useStepper({
		activeStep,
		defaultActiveStep,
		linear,
		onStepChange,
		onComplete,
		beforeStepChange,
	});

	// --- Responsive Logic ---
	useEffect(() => {
		if (!responsive || !containerRef.current) return;

		const breakpoint = typeof responsive === 'number' ? responsive : 600;

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				setCompact(entry.contentRect.width < breakpoint);
			}
		});

		observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, [responsive]);

	// Calculate final orientation based on props + responsive state
	const activeOrientation = isCompact ? 'vertical' : orientation;

	return (
		<StepperContext.Provider
			value={{
				activeStep: currentStep,
				orientation: activeOrientation,
				variant,
				linear,
				keepMounted,
				next,
				back,
				goTo,
				totalSteps,
				setTotalSteps,
				isLoading,
				stepErrors,
				setStepError,
			}}
		>
			<div
				ref={containerRef}
				className={`stepper stepper--${activeOrientation} stepper--${variant} ${className || ''}`}
				style={style}
			>
				{children}
			</div>
		</StepperContext.Provider>
	);
}

```

### File: packages\fields\src\components\stepper\StepperContent.tsx

```tsx
import { cloneElement, ComponentChildren, toChildArray, VNode } from 'preact';

interface StepperContentProps {
	children: ComponentChildren;
	className?: string;
}

export function StepperContent({ children, className }: StepperContentProps) {
	const panels = toChildArray(children);

	return (
		<div className={`stepper__content ${className || ''}`}>
			{panels.map((child, index) => {
				if (typeof child !== 'object' || child === null) return child;
				return cloneElement(child as VNode<any>, { index });
			})}
		</div>
	);
}

```

### File: packages\fields\src\components\stepper\StepperFooter.tsx

```tsx
import { ComponentChildren } from 'preact';
import { IconLoader2 } from '@tabler/icons-preact';
import { useStepperContext } from './Stepper.tsx';

interface StepperFooterProps {
	children?: ComponentChildren;
	className?: string;
}

export function StepperFooter({ children, className }: StepperFooterProps) {
	const { next, back, activeStep, totalSteps, isLoading } = useStepperContext();
	const isFirst = activeStep.value === 0;
	const isLast = activeStep.value === totalSteps.value - 1;

	if (children) {
		return <div className={`stepper__footer ${className || ''}`}>{children}</div>;
	}

	return (
		<div className={`stepper__footer ${className || ''}`}>
			<button
				className='btn btn--secondary'
				onClick={back}
				disabled={isFirst || isLoading.value}
			>
				Back
			</button>
			<button
				className='btn btn--primary'
				onClick={next}
				disabled={isLoading.value}
				style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
			>
				{isLoading.value && <IconLoader2 className='stepper__spin' size={16} />}
				{isLast ? 'Finish' : 'Next'}
			</button>
		</div>
	);
}

```

### File: packages\fields\src\components\stepper\StepperHeader.tsx

```tsx
import { cloneElement, ComponentChildren, toChildArray, VNode } from 'preact';
import { useEffect } from 'preact/hooks';
import { useStepperContext } from './Stepper.tsx';

interface StepperHeaderProps {
	children: ComponentChildren;
	className?: string;
}

export function StepperHeader({ children, className }: StepperHeaderProps) {
	const { setTotalSteps } = useStepperContext();
	const steps = toChildArray(children);

	useEffect(() => {
		setTotalSteps(steps.length);
	}, [steps.length]);

	return (
		<div className={`stepper__header ${className || ''}`}>
			{steps.map((child, index) => {
				if (typeof child !== 'object' || child === null) return child;
				return cloneElement(child as VNode<any>, {
					index,
					isLast: index === steps.length - 1,
				});
			})}
		</div>
	);
}

```

### File: packages\fields\src\components\stepper\StepperPanel.tsx

```tsx
import { useStepperContext } from './Stepper.tsx';
import { StepperPanelProps } from '../../types/components/stepper.ts';

export function StepperPanel({ children, index, className, style }: StepperPanelProps) {
	const { activeStep, keepMounted } = useStepperContext();
	const isActive = activeStep.value === index;

	if (!keepMounted && !isActive) return null;

	return (
		<div
			className={`stepper__panel ${isActive ? 'stepper__panel--active' : ''} ${className || ''}`}
			style={{
				display: isActive ? 'block' : 'none',
				...style,
			}}
			role='tabpanel'
			aria-hidden={!isActive}
		>
			{children}
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
import { Popover } from './overlays/Popover.tsx';
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
			<div className={`field-date field-date--inline ${className || ''}`} style={style}>
				<TimeClock
					value={fieldState.value.value}
					onChange={handleTimeSelect}
					selectionMode={selectionMode}
				/>
				<MessageWrapper error={error} hint={hint} warning={warning} info={info} />
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
					<div onClick={() => !isDisabled && (isOpen.value = !isOpen.value)}>
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
										!isDisabled && (isOpen.value = !isOpen.value);
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
			<MessageWrapper error={error} hint={hint} warning={warning} info={info} />
		</div>
	);
}

```

### File: packages\fields\src\core\toast.ts

```ts
import { signal } from '@preact/signals';
import {
	PromiseData,
	PromiseT,
	ToastData,
	ToastOptions,
	ToastType,
} from '../types/components/toast.ts';

// --- State ---
const toasts = signal<ToastData[]>([]);

const generateId = () => Math.random().toString(36).substring(2, 9);

// --- Actions ---

function addToast(type: ToastType, message: string, options: ToastOptions = {}) {
	const isDuplicate = toasts.value.some((t) =>
		t.message === message && t.type === type && !t.exiting
	);
	if (isDuplicate) return options.id || ''; // Return existing ID if implied, or empty
	const id = options.id || generateId();

	// 2. Update existing if ID matches (Morphing)
	const existingIndex = toasts.value.findIndex((t) => t.id === id);
	const newToast: ToastData = {
		id,
		type,
		message: options.description || message,
		title: options.description ? message : undefined,
		duration: options.duration,
		dismissible: options.dismissible ?? true,
		icon: options.icon,
		action: options.action,
		createdAt: Date.now(),
		exiting: false,
	};

	if (existingIndex !== -1) {
		// Update in place (keeping position)
		const updated = [...toasts.value];
		updated[existingIndex] = newToast;
		toasts.value = updated;
	} else {
		// Append new
		toasts.value = [...toasts.value, newToast];
	}

	return id;
}

function dismissToast(id: string) {
	toasts.value = toasts.value.filter((t) => t.id !== id);
}

function dismissAll() {
	toasts.value = [];
}

// --- Promise Handler ---

function promise<T>(promise: PromiseT<T>, data: PromiseData<T>, options?: ToastOptions) {
	const id = addToast('loading', String(data.loading), { ...options, duration: Infinity });

	const p = promise instanceof Function ? promise() : promise;

	p.then((response) => {
		const successMessage = typeof data.success === 'function'
			? data.success(response)
			: data.success;

		addToast('success', String(successMessage), {
			...options,
			id, // Reuse ID to morph
			duration: 4000, // Reset duration for success state
		});
	}).catch((error) => {
		const errorMessage = typeof data.error === 'function' ? data.error(error) : data.error;

		addToast('error', String(errorMessage), {
			...options,
			id,
			duration: 5000,
		});
	});

	return p;
}

// --- Public API ---

export const toast = {
	// Basic Methods
	success: (message: string, options?: ToastOptions) => addToast('success', message, options),
	error: (message: string, options?: ToastOptions) => addToast('error', message, options),
	warning: (message: string, options?: ToastOptions) => addToast('warning', message, options),
	info: (message: string, options?: ToastOptions) => addToast('info', message, options),
	loading: (message: string, options?: ToastOptions) =>
		addToast('loading', message, { ...options, duration: Infinity }),

	// Advanced
	promise,
	custom: (type: ToastType, message: string, options?: ToastOptions) =>
		addToast(type, message, options),

	// Controls
	dismiss: dismissToast,
	dismissAll: dismissAll,

	// State Access
	$state: toasts,
};

```

### File: packages\fields\src\hooks\useAccordion.ts

```ts
import { Signal, useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { AccordionProps } from '../types/components/accordion.ts';

interface UseAccordionProps
	extends
		Pick<
			AccordionProps,
			'value' | 'defaultValue' | 'onValueChange' | 'type' | 'collapsible' | 'disabled'
		> {}

export function useAccordion({
	value,
	defaultValue,
	onValueChange,
	type = 'single',
	collapsible = false,
	disabled = false,
}: UseAccordionProps) {
	// Internal storage for O(1) lookups
	const expandedValues = useSignal<Set<string>>(new Set());
	const isDisabled = useSignal(false);

	// Sync disabled state
	useEffect(() => {
		isDisabled.value = disabled instanceof Signal ? disabled.value : disabled;
	}, [disabled]);

	// Initialize state (Uncontrolled)
	useEffect(() => {
		if (value === undefined && defaultValue !== undefined) {
			const arr = Array.isArray(defaultValue) ? defaultValue : [defaultValue];
			expandedValues.value = new Set(arr);
		}
	}, []);

	// Sync controlled state
	useEffect(() => {
		if (value !== undefined) {
			const arr = Array.isArray(value) ? value : [value];
			const newSet = new Set(arr);
			const current = expandedValues.value;

			const isDifferent = newSet.size !== current.size ||
				[...newSet].some((x) => !current.has(x));

			if (isDifferent) {
				expandedValues.value = newSet;
			}
		}
	}, [value]);

	const emitChange = (nextSet: Set<string>) => {
		expandedValues.value = nextSet;
		if (onValueChange) {
			const out = type === 'single' ? (nextSet.values().next().value ?? '') : Array.from(nextSet);
			onValueChange(out);
		}
	};

	const toggle = (itemValue: string) => {
		if (isDisabled.value) return;

		const next = new Set(expandedValues.value);
		const isOpen = next.has(itemValue);

		if (type === 'single') {
			if (isOpen) {
				if (collapsible) next.clear();
				else return;
			} else {
				next.clear();
				next.add(itemValue);
			}
		} else {
			if (isOpen) next.delete(itemValue);
			else next.add(itemValue);
		}
		emitChange(next);
	};

	const expandAll = (allValues: string[]) => {
		if (isDisabled.value || type === 'single') return;
		emitChange(new Set(allValues));
	};

	const collapseAll = () => {
		if (isDisabled.value) return;
		// If single and not collapsible, we technically shouldn't collapse all,
		// but usually collapseAll implies a reset.
		// For strict compliance:
		if (type === 'single' && !collapsible) return;

		emitChange(new Set());
	};

	return {
		expandedValues,
		toggle,
		expandAll,
		collapseAll,
		isDisabled,
	};
}

```

### File: packages\fields\src\hooks\useCurrencyMask.ts

```ts
import { Signal, useSignal } from "@preact/signals";

export function useCurrencyMask(
    value: Signal<number | undefined>,
    currency = "USD",
    locale = "en-US",
) {
    const displayValue = useSignal("");

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat(locale, {
            style: "currency",
            currency: currency,
        }).format(val);
    };

    const parseCurrency = (val: string): number => {
        // Remove non-numeric characters except decimal point
        const clean = val.replace(/[^0-9.-]+/g, "");
        return parseFloat(clean);
    };

    const handleBlur = () => {
        if (value.value !== undefined && !isNaN(value.value)) {
            displayValue.value = formatCurrency(value.value);
        } else {
            displayValue.value = "";
        }
    };

    const handleFocus = () => {
        if (value.value !== undefined && !isNaN(value.value)) {
            displayValue.value = value.value.toString();
        } else {
            displayValue.value = "";
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

### File: packages\fields\src\hooks\useRipple.ts

```ts
import { signal, useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";

export interface Ripple {
    x: number;
    y: number;
    id: number;
}

export function useRipple() {
    const ripples = useSignal<Ripple[]>([]);

    const addRipple = (e: MouseEvent | TouchEvent) => {
        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();

        let clientX, clientY;
        if (e instanceof MouseEvent) {
            clientX = e.clientX;
            clientY = e.clientY;
        } else {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const id = Date.now();

        ripples.value = [...ripples.value, { x, y, id }];

        // Clean up ripple after animation
        setTimeout(() => {
            ripples.value = ripples.value.filter((r) => r.id !== id);
        }, 600);
    };

    return { ripples, addRipple };
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

### File: packages\fields\src\hooks\useSplitter.ts

```ts
import { Signal, useSignal } from '@preact/signals';
import { useCallback, useEffect, useRef } from 'preact/hooks';
import { SplitterDirection } from '../types/components/splitter.ts';

interface PaneConfig {
	minSize?: number;
	maxSize?: number;
	collapsible?: boolean;
	defaultCollapsed?: boolean;
}

interface UseSplitterProps {
	count: number;
	direction: SplitterDirection;
	initialSizes?: number[];
	minPaneSize?: number;
	paneConfigs: PaneConfig[];
	onResizeEnd?: (sizes: number[]) => void;
	onCollapse?: (index: number, collapsed: boolean) => void;
}

export function useSplitter({
	count,
	direction,
	initialSizes,
	minPaneSize = 10,
	paneConfigs,
	onResizeEnd,
	onCollapse,
}: UseSplitterProps) {
	const sizes = useSignal<number[]>([]);
	const isResizing = useSignal(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const collapsedState = useRef<Map<number, number>>(new Map());

	// FIX: Use ref for configs to avoid stale closures in event listeners
	const configsRef = useRef(paneConfigs);
	useEffect(() => {
		configsRef.current = paneConfigs;
	}, [paneConfigs]);

	const dragRef = useRef<
		{
			index: number;
			startPos: number;
			startSizes: number[];
		} | null
	>(null);

	// --- Initialization ---
	useEffect(() => {
		let newSizes: number[] = [];
		if (initialSizes && initialSizes.length === count) {
			newSizes = [...initialSizes];
		} else {
			const even = 100 / count;
			newSizes = new Array(count).fill(even);
		}

		// Apply default collapsed states using the CURRENT configs
		paneConfigs.forEach((conf, idx) => {
			if (conf.defaultCollapsed && conf.collapsible) {
				collapsedState.current.set(idx, newSizes[idx]);
				newSizes[idx] = 0;
				if (idx < count - 1) newSizes[idx + 1] += newSizes[idx];
				else if (idx > 0) newSizes[idx - 1] += newSizes[idx];
			}
		});
		sizes.value = newSizes;
	}, [count, initialSizes]); // Intentionally exclude paneConfigs to prevent reset on config change

	// --- Core Calculation Logic ---
	const calculateMove = useCallback((index: number, deltaPercent: number, baseSizes: number[]) => {
		const leftIdx = index;
		const rightIdx = index + 1;

		const newSizes = [...baseSizes];
		let p1 = baseSizes[leftIdx] + deltaPercent;
		let p2 = baseSizes[rightIdx] - deltaPercent;

		// FIX: Read from ref to get fresh configs during drag
		const config1 = configsRef.current[leftIdx] || {};
		const config2 = configsRef.current[rightIdx] || {};

		const min1 = config1.minSize ?? minPaneSize;
		const max1 = config1.maxSize ?? 100;
		const min2 = config2.minSize ?? minPaneSize;
		const max2 = config2.maxSize ?? 100;

		// Constraints
		if (p1 < min1) {
			const diff = min1 - p1;
			p1 = min1;
			p2 -= diff;
		}
		if (p2 < min2) {
			const diff = min2 - p2;
			p2 = min2;
			p1 -= diff;
		}
		if (p1 > max1) {
			const diff = p1 - max1;
			p1 = max1;
			p2 += diff;
		}
		if (p2 > max2) {
			const diff = p2 - max2;
			p2 = max2;
			p1 += diff;
		}

		newSizes[leftIdx] = p1;
		newSizes[rightIdx] = p2;
		return newSizes;
	}, [minPaneSize]);

	// --- Handlers ---
	const processDrag = (currentPos: number) => {
		if (!dragRef.current || !containerRef.current) return;
		const { index, startPos, startSizes } = dragRef.current;
		const rect = containerRef.current.getBoundingClientRect();

		// Handle 0 size container edge case
		const containerSize = direction === 'horizontal' ? rect.width : rect.height;
		if (containerSize === 0) return;

		const deltaPx = currentPos - startPos;
		const deltaPercent = (deltaPx / containerSize) * 100;

		sizes.value = calculateMove(index, deltaPercent, startSizes);
	};

	const moveSplitter = useCallback((index: number, deltaPercent: number) => {
		sizes.value = calculateMove(index, deltaPercent, sizes.value);
		if (onResizeEnd) onResizeEnd(sizes.value);
	}, [calculateMove, onResizeEnd]);

	// Listeners
	const handleMove = useCallback((e: MouseEvent) => {
		if (!dragRef.current) return;
		const clientPos = direction === 'horizontal' ? e.clientX : e.clientY;
		processDrag(clientPos);
	}, [direction]);

	const handleTouchMove = useCallback((e: TouchEvent) => {
		if (!dragRef.current) return;
		e.preventDefault();
		const touch = e.touches[0];
		const clientPos = direction === 'horizontal' ? touch.clientX : touch.clientY;
		processDrag(clientPos);
	}, [direction]);

	const handleEnd = useCallback(() => {
		isResizing.value = false;
		dragRef.current = null;

		document.removeEventListener('mousemove', handleMove);
		document.removeEventListener('mouseup', handleEnd);
		document.removeEventListener('touchmove', handleTouchMove);
		document.removeEventListener('touchend', handleEnd);

		document.body.style.cursor = '';
		document.body.style.userSelect = '';

		if (onResizeEnd) onResizeEnd(sizes.value);
	}, [onResizeEnd, handleMove, handleTouchMove]);

	const startResize = useCallback((index: number, clientX: number, clientY: number) => {
		isResizing.value = true;
		const startPos = direction === 'horizontal' ? clientX : clientY;

		dragRef.current = {
			index,
			startPos,
			startSizes: [...sizes.value],
		};

		document.addEventListener('mousemove', handleMove);
		document.addEventListener('mouseup', handleEnd);
		document.addEventListener('touchmove', handleTouchMove, { passive: false });
		document.addEventListener('touchend', handleEnd);

		document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
		document.body.style.userSelect = 'none';
	}, [sizes, direction, handleMove, handleTouchMove, handleEnd]);

	const toggleCollapse = useCallback((index: number) => {
		const config = configsRef.current[index];
		if (!config?.collapsible) return;

		const currentSizes = [...sizes.value];
		const currentSize = currentSizes[index];
		let isCollapsed = false;

		let neighborIdx = index + 1;
		if (neighborIdx >= count) neighborIdx = index - 1;

		if (currentSize > 0.5) {
			collapsedState.current.set(index, currentSize);
			currentSizes[neighborIdx] += currentSize;
			currentSizes[index] = 0;
			isCollapsed = true;
		} else {
			let restoreSize = collapsedState.current.get(index) || config.minSize || minPaneSize || 10;
			const neighborSize = currentSizes[neighborIdx];
			const neighborMin = configsRef.current[neighborIdx]?.minSize ?? minPaneSize;

			if (neighborSize - restoreSize < neighborMin) {
				restoreSize = Math.max(0, neighborSize - neighborMin);
			}

			if (restoreSize > 0) {
				currentSizes[neighborIdx] -= restoreSize;
				currentSizes[index] = restoreSize;
			}
		}

		sizes.value = currentSizes;
		if (onResizeEnd) onResizeEnd(sizes.value);
		if (onCollapse) onCollapse(index, isCollapsed);
	}, [sizes, count, minPaneSize, onResizeEnd, onCollapse]);

	return { sizes, isResizing, containerRef, startResize, moveSplitter, toggleCollapse };
}

```

### File: packages\fields\src\hooks\useStepper.ts

```ts
import { Signal, useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { StepperProps } from '../types/components/stepper.ts';

export function useStepper({
	activeStep,
	defaultActiveStep = 0,
	onStepChange,
	onComplete,
	beforeStepChange,
	linear = true,
}: Pick<
	StepperProps,
	'activeStep' | 'defaultActiveStep' | 'onStepChange' | 'onComplete' | 'linear' | 'beforeStepChange'
>) {
	const currentStep = useSignal(defaultActiveStep);
	const totalSteps = useSignal(0);
	const isLoading = useSignal(false);
	const stepErrors = useSignal<Set<number>>(new Set());

	// Sync controlled prop
	useEffect(() => {
		if (activeStep !== undefined) {
			currentStep.value = activeStep;
		}
	}, [activeStep]);

	const setStepError = (index: number, hasError: boolean) => {
		const next = new Set(stepErrors.value);
		if (hasError) next.add(index);
		else next.delete(index);
		stepErrors.value = next;
	};

	const changeStep = async (newStep: number) => {
		if (newStep < 0 || newStep >= totalSteps.value) return;
		if (isLoading.value) return; // Prevent double clicks

		// Linear constraints
		if (linear && newStep > currentStep.value + 1) {
			return;
		}

		// Guard Clause (Async Validation)
		if (beforeStepChange) {
			const result = beforeStepChange(newStep, currentStep.value);

			if (result === false) return; // Blocked synchronously

			if (result instanceof Promise) {
				isLoading.value = true;
				try {
					const allowed = await result;
					if (!allowed) return; // Blocked asynchronously
				} catch (e) {
					console.error('Step validation failed', e);
					return; // Block on error
				} finally {
					isLoading.value = false;
				}
			}
		}

		currentStep.value = newStep;
		onStepChange?.(newStep);
	};

	const next = () => {
		if (currentStep.value < totalSteps.value - 1) {
			changeStep(currentStep.value + 1);
		} else {
			// Validate final step before completing?
			// Usually onComplete handles final submission
			if (!isLoading.value) onComplete?.();
		}
	};

	const back = () => {
		// Usually we don't validate going back, but we can if needed.
		// For now, allow free back travel without async guard unless strictly required.
		if (currentStep.value > 0) {
			// Bypass async guard for back? Usually yes for UX.
			// If we want guard on back, call changeStep.
			// Here we just set logic directly to avoid 'saving' when cancelling.
			currentStep.value = currentStep.value - 1;
			onStepChange?.(currentStep.value);
		}
	};

	const goTo = (step: number) => {
		changeStep(step);
	};

	return {
		activeStep: currentStep,
		totalSteps,
		isLoading,
		stepErrors,
		next,
		back,
		goTo,
		setTotalSteps: (count: number) => {
			totalSteps.value = count;
		},
		setStepError,
	};
}

```

### File: packages\fields\src\styles\components\accordion.css

```css
/* --- Root --- */
.accordion {
    display: flex;
    flex-direction: column;
    width: 100%;
    --accordion-padding-x: 1rem;
    --accordion-padding-y: 1rem;
    --accordion-radius: var(--field-radius);
    --accordion-border-color: var(--field-border);
}

/* --- Densities --- */
.accordion--compact {
    --accordion-padding-y: 0.5rem;
    --accordion-padding-x: 0.75rem;
}

.accordion--spacious {
    --accordion-padding-y: 1.5rem;
    --accordion-padding-x: 1.5rem;
}

/* --- Variants --- */

/* Outlined (Default) */
.accordion--outlined {
    border: 1px solid var(--accordion-border-color);
    border-radius: var(--accordion-radius);
    background-color: var(--field-bg);
}

.accordion--outlined .accordion__item {
    border-bottom: 1px solid var(--accordion-border-color);
}

.accordion--outlined .accordion__item:last-child {
    border-bottom: none;
}

/* Filled */
.accordion--filled {
    background-color: var(--gray-50);
    border-radius: var(--accordion-radius);
}

.accordion--filled .accordion__item--open {
    background-color: var(--gray-0);
    /* Highlight open items */
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    margin-bottom: 2px;
    /* Visual separation */
    border-radius: var(--accordion-radius);
}

/* Ghost (Minimal) */
.accordion--ghost {
    background-color: transparent;
    border: none;
}

.accordion--ghost .accordion__item {
    border-bottom: 1px solid var(--gray-200);
}

/* --- Header & Trigger --- */
.accordion__header {
    margin: 0;
    padding: 0;
    display: flex;
}

.accordion__trigger {
    all: unset;
    flex: 1;
    display: flex;
    align-items: center;
    /* Center vertically */
    gap: 0.75rem;
    padding: var(--accordion-padding-y) var(--accordion-padding-x);
    font-family: var(--field-font-family);
    font-size: var(--field-font-size);
    color: var(--field-text);
    background-color: transparent;
    cursor: pointer;
    transition: background-color 0.2s;
    min-height: 24px;
}

.accordion__trigger:hover {
    background-color: var(--field-bg-hover);
}

.accordion__trigger:focus-visible {
    outline: 2px solid var(--field-border-focus);
    outline-offset: -2px;
    z-index: 1;
}

/* --- Trigger Layout --- */
.accordion__start-icon {
    display: flex;
    align-items: center;
    color: var(--field-text-placeholder);
}

.accordion__trigger-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.accordion__title {
    font-weight: 500;
    line-height: 1.2;
}

.accordion__subtitle {
    font-size: 0.85em;
    color: var(--field-text-label);
    margin-top: 2px;
    font-weight: 400;
}

.accordion__end-section {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.accordion__actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* --- Chevron Icon --- */
.accordion__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--field-text-placeholder);
    transition: transform 0.2s cubic-bezier(0.87, 0, 0.13, 1);
}

.accordion__icon--rotated {
    transform: rotate(180deg);
}

/* --- Content --- */
.accordion__content {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.3s cubic-bezier(0.87, 0, 0.13, 1);
    background-color: inherit;
    /* Match parent variant */
    visibility: hidden;
}

.accordion__content--open {
    grid-template-rows: 1fr;
    visibility: visible;
}

.accordion__content-inner {
    overflow: hidden;
    padding: 0 var(--accordion-padding-x) var(--accordion-padding-y) var(--accordion-padding-x);
    min-height: 0;
    color: var(--field-text-label);
    line-height: 1.5;
}

/* Disabled State */
.accordion__item--disabled {
    opacity: 0.6;
    pointer-events: none;
}
```

### File: packages\fields\src\styles\components\calendar.css

```css
/* --- Base --- */
.calendar {
  display: flex;
  flex-direction: column;
  width: 320px;
  background-color: var(--bg-overlay);
  border: none;
  /* Border handled by popover usually, but safe to keep 0 */
  padding: 1rem;
  user-select: none;
  font-family: inherit;
}

/* --- Header --- */
.calendar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  height: 32px;
}

.calendar__title-btn {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.calendar__title-btn:hover {
  background-color: var(--bg-surface-active);
}

.calendar__nav-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s;
}

.calendar__nav-btn:hover {
  background-color: var(--bg-surface-active);
  color: var(--text-primary);
}

/* --- Body Wrapper --- */
.calendar__body {
  min-height: 240px;
}

/* --- Weekdays --- */
.calendar__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 0.5rem;
  text-align: center;
}

.calendar__weekday {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
}

/* --- Grids --- */
.calendar__grid--days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.calendar__grid--months,
.calendar__grid--years {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  height: 100%;
}

/* --- Day Cell (Small) --- */
.calendar__day {
  height: 2.25rem;
  width: 100%;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s;
}

.calendar__day:hover:not(:disabled) {
  background-color: var(--bg-surface-active);
}

.calendar__day--muted {
  color: var(--text-tertiary);
}

.calendar__day--today {
  font-weight: 700;
  color: var(--text-brand);
}

.calendar__day--selected {
  background-color: var(--bg-brand-solid) !important;
  color: var(--text-on-brand) !important;
}

.calendar__day--disabled {
  opacity: 0.3;
  cursor: not-allowed;
  text-decoration: line-through;
}

/* Range Styling */
.calendar__day--range-start {
  background-color: var(--bg-brand-solid);
  color: var(--text-on-brand);
  border-top-left-radius: 0.375rem;
  border-bottom-left-radius: 0.375rem;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.calendar__day--range-end {
  background-color: var(--bg-brand-solid);
  color: var(--text-on-brand);
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.calendar__day--range-start.calendar__day--range-end {
  border-radius: 0.375rem;
}

.calendar__day--range-middle {
  background-color: var(--bg-brand-subtle);
  border-radius: 0;
}

.calendar__day--range-middle:hover {
  background-color: var(--primary-100);
}

/* --- Large Cells --- */
.calendar__cell-lg {
  height: 3.5rem;
  width: 100%;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s;
}

.calendar__cell-lg:hover {
  background-color: var(--bg-surface-active);
  border-color: var(--border-subtle);
}

.calendar__cell-lg--today {
  font-weight: 700;
  color: var(--text-brand);
  border-color: var(--border-focus);
}

.calendar__cell-lg--selected {
  background-color: var(--bg-brand-solid) !important;
  color: var(--text-on-brand) !important;
}

.calendar__cell-lg--muted {
  color: var(--text-tertiary);
}
```

### File: packages\fields\src\styles\components\datetime-field.css

```css
.datetime-field {
    width: 100%;
}

.datetime-field__icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--input-placeholder, #9ca3af);
    display: flex;
    align-items: center;
    padding: 2px;
}

.datetime-field__popup {
    display: flex;
    flex-direction: column;
    width: 320px;
    /* Match calendar width */
}

.datetime-field__tabs {
    display: flex;
    border-bottom: 1px solid var(--input-border, #d1d5db);
}

.datetime-field__tab {
    flex: 1;
    background: none;
    border: none;
    padding: 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--input-text-secondary, #6b7280);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
}

.datetime-field__tab:hover {
    background-color: #f9fafb;
    color: var(--input-text, #111827);
}

.datetime-field__tab--active {
    color: var(--fill-bg, #3b82f6);
    border-bottom-color: var(--fill-bg, #3b82f6);
}

.datetime-field__tab-val {
    font-size: 0.75rem;
    background-color: #f3f4f6;
    padding: 2px 6px;
    border-radius: 4px;
    color: #374151;
}

.datetime-field__body {
    padding: 0;
}

.datetime-field__calendar {
    border: none;
    /* Remove border as popover has it */
    width: 100%;
}

.datetime-field__clock-wrapper {
    padding: 1rem;
    display: flex;
    justify-content: center;
}

```

### File: packages\fields\src\styles\components\help-tooltip.css

```css
.help-tooltip {
	position: relative;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	cursor: help;
	color: var(--text-tertiary); /* Use your semantic var */
	margin-left: 0.25rem;
	vertical-align: middle;
	line-height: 0;
}

/* If it's a link, make it look clickable on hover */
a.help-tooltip {
	cursor: pointer;
}

a.help-tooltip:hover .help-tooltip__icon {
	color: var(--primary-500);
}

.help-tooltip__icon {
	display: flex;
	transition: color 0.2s;
}

/* The Popup Bubble */
.help-tooltip__popup {
	position: absolute;
	bottom: 100%;
	left: 50%;
	transform: translateX(-50%) translateY(-8px);
	
	background-color: var(--gray-900); /* Semantic: var(--text-primary) or specialized tooltip bg */
	color: var(--gray-0);
	
	padding: 0.5rem 0.75rem;
	border-radius: 4px;
	font-size: 0.75rem;
	line-height: 1.4;
	font-weight: 400;
	white-space: normal;
	width: max-content;
	max-width: 200px;
	text-align: center;
	
	opacity: 0;
	visibility: hidden;
	pointer-events: none;
	transition: opacity 0.2s, transform 0.2s;
	z-index: 100;
	box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

/* Show on hover */
.help-tooltip:hover .help-tooltip__popup {
	opacity: 1;
	visibility: visible;
	transform: translateX(-50%) translateY(-4px);
}

/* The Arrow */
.help-tooltip__arrow {
	position: absolute;
	top: 100%;
	left: 50%;
	transform: translateX(-50%);
	border-width: 4px;
	border-style: solid;
	border-color: var(--gray-900) transparent transparent transparent;
}
```

### File: packages\fields\src\styles\components\splitter.css

```css
/* --- Root --- */
.splitter {
    display: flex;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.splitter--horizontal {
    flex-direction: row;
}

.splitter--vertical {
    flex-direction: column;
}

.splitter--resizing {
    cursor: col-resize;
    user-select: none;
}

.splitter--vertical.splitter--resizing {
    cursor: row-resize;
}

/* --- Pane Wrapper --- */
.splitter__pane-wrapper {
    flex-grow: 0;
    flex-shrink: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
}

.splitter__pane-wrapper--collapsed {
    display: none;
}

/* --- Pane Inner --- */
.splitter__pane {
    width: 100%;
    height: 100%;
    overflow: auto;
}

/* --- Gutter --- */
.splitter__gutter {
    background-color: var(--field-border);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
    z-index: 10;
    flex-shrink: 0;
    position: relative;
    /* Context for hitbox */
    outline: none;
    /* Custom focus style below */
}

/* Keyboard Focus State */
.splitter__gutter:focus-visible {
    background-color: var(--primary-500);
    box-shadow: 0 0 0 2px var(--primary-100);
}

.splitter__gutter:hover,
.splitter__gutter:active {
    background-color: var(--primary-500);
}

/* Horizontal Gutter */
.splitter__gutter--horizontal {
    width: 4px;
    height: 100%;
    cursor: col-resize;
}

/* Vertical Gutter */
.splitter__gutter--vertical {
    height: 4px;
    width: 100%;
    cursor: row-resize;
}

/* Visual Handle */
.splitter__gutter-handle {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 2px;
    pointer-events: none;
}

/* Hitbox (Invisible expansion for touch) */
.splitter__gutter-hitbox {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
}

/* Expand hitbox based on direction */
.splitter__gutter--horizontal .splitter__gutter-hitbox {
    left: -6px;
    width: 16px;
    /* 4px visual + 6px padding each side */
}

.splitter__gutter--vertical .splitter__gutter-hitbox {
    top: -6px;
    height: 16px;
}

/* --- Responsive Stack Divider --- */
.splitter__divider-stack {
    width: 100%;
    height: 1px;
    background-color: var(--field-border);
    margin: 0;
}
```

### File: packages\fields\src\styles\components\stepper.css

```css
/* --- Root --- */
.stepper {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 1.5rem;
}

/* --- Header --- */
.stepper__header {
    display: flex;
    position: relative;
    /* Horizontal: items flow left to right */
}

/* --- Step Item --- */
.stepper__step {
    display: flex;
    align-items: center;
    position: relative;
    flex: 1;
    gap: 0.75rem;
    padding-bottom: 0.5rem;
    transition: opacity 0.2s;
}

.stepper__step:last-child {
    flex: 0;
    /* Don't expand last item to avoid connector extending to nowhere */
}

.stepper__step--clickable {
    cursor: pointer;
}

.stepper__step--disabled {
    opacity: 0.5;
    pointer-events: none;
}

/* --- Indicator --- */
.stepper__step-indicator {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: var(--field-bg);
    border: 2px solid var(--field-border);
    color: var(--field-text-label);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.9rem;
    z-index: 2;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
}

/* States */
.stepper__step--active .stepper__step-indicator {
    border-color: var(--primary-500);
    color: var(--primary-500);
    background-color: var(--primary-50);
    transform: scale(1.1);
}

.stepper__step--completed .stepper__step-indicator {
    background-color: var(--primary-500);
    border-color: var(--primary-500);
    color: white;
}

.stepper__step--error .stepper__step-indicator {
    border-color: var(--error-500);
    color: var(--error-500);
    background-color: var(--error-50);
}

/* --- Text Content --- */
.stepper__step-content {
    display: flex;
    flex-direction: column;
    min-width: 0;
    /* Prevent flex overflow */
}

.stepper__step-title {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--field-text);
    white-space: nowrap;
}

.stepper__step-desc {
    font-size: 0.75rem;
    color: var(--field-text-placeholder);
    white-space: nowrap;
}

.stepper__step-optional {
    font-weight: 400;
    color: var(--field-text-placeholder);
    margin-left: 0.25rem;
    font-size: 0.8em;
}

/* --- Connector --- */
.stepper__connector {
    position: absolute;
    top: 16px;
    left: 40px;
    /* circle + gap */
    right: -10px;
    height: 2px;
    background-color: var(--field-border);
    z-index: 1;
    transition: background-color 0.4s ease;
}

.stepper__step--completed .stepper__connector--active {
    background-color: var(--primary-500);
}

/* --- Variant: Dot --- */
.stepper--dot .stepper__step-indicator {
    width: 16px;
    height: 16px;
    border-width: 2px;
}

.stepper--dot .stepper__connector {
    top: 8px;
    /* Half of 16px */
    left: 24px;
}

/* Active Dot is slightly larger */
.stepper--dot .stepper__step--active .stepper__step-indicator {
    transform: scale(1.25);
}

/* --- Vertical Orientation --- */
.stepper--vertical {
    flex-direction: row;
    /* Main layout becomes row: Sidebar Steps | Content */
    gap: 2rem;
    align-items: flex-start;
}

.stepper--vertical .stepper__header {
    flex-direction: column;
    width: 250px;
    flex-shrink: 0;
}

.stepper--vertical .stepper__content {
    flex: 1;
    width: 100%;
}

.stepper--vertical .stepper__step {
    width: 100%;
    flex: 0;
    /* Don't stretch vertically */
    padding-bottom: 2rem;
    /* Space for vertical connector */
    overflow: visible;
}

.stepper--vertical .stepper__step:last-child {
    padding-bottom: 0;
}

.stepper--vertical .stepper__connector {
    top: 32px;
    left: 15px;
    /* Center of 32px circle */
    width: 2px;
    height: calc(100% - 24px);
    /* Connect to next circle top */
    right: auto;
}

.stepper--vertical.stepper--dot .stepper__connector {
    top: 16px;
    left: 7px;
    /* Center of 16px circle */
    height: calc(100% - 8px);
}

/* --- Panels & Animation --- */
.stepper__panel {
    animation: stepperFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes stepperFadeIn {
    from {
        opacity: 0;
        transform: translateY(4px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* --- Footer --- */
.stepper__footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--field-border);
}

.stepper__spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    100% {
        transform: rotate(360deg);
    }
}
```

### File: packages\fields\src\styles\components\time-clock.css

```css
/* --- Field --- */
.time-field {
    width: 100%;
}

.time-field--inline {
    display: inline-block;
    border: 1px solid var(--border-subtle);
    border-radius: var(--field-radius);
    padding: 1rem;
    background-color: var(--bg-surface);
}

.time-field__icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-tertiary);
    display: flex;
    align-items: center;
    padding: 2px;
}

.time-field__icon-btn:hover {
    color: var(--text-primary);
}

.time-field__clock-wrapper {
    background: var(--bg-overlay);
    border-radius: var(--input-radius);
    overflow: hidden;
    width: 280px;
}

/* --- Clock Header --- */
.time-clock__header {
    background-color: var(--bg-brand-solid);
    color: var(--text-on-brand);
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.time-clock__digital {
    font-size: 2rem;
    display: flex;
    align-items: baseline;
}

.time-clock__sep {
    margin: 0 0.25rem;
    opacity: 0.7;
}

.time-clock__val {
    background: none;
    border: none;
    font-size: inherit;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    padding: 0;
}

.time-clock__val--active {
    color: var(--text-on-brand);
}

.time-clock__ampm {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.time-clock__meridiem {
    background: none;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.75rem;
    padding: 0.1rem 0.3rem;
    cursor: pointer;
}

.time-clock__meridiem--active {
    background: var(--bg-surface);
    color: var(--text-brand);
    font-weight: bold;
}

/* --- Clock Body --- */
.time-clock__body {
    padding: 1.5rem;
    display: flex;
    justify-content: center;
    background-color: var(--bg-surface);
}

.clock__face {
    width: 230px;
    height: 230px;
    background: var(--bg-surface-active);
    border-radius: 50%;
    position: relative;
    touch-action: none;
}

.clock__center-dot {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 8px;
    height: 8px;
    background: var(--bg-brand-solid);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    z-index: 5;
}

.clock__number {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 32px;
    height: 32px;
    margin-top: -16px;
    margin-left: -16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 0.9rem;
    color: var(--text-primary);
    pointer-events: none;
    z-index: 2;
}

.clock__number--active {
    color: var(--text-on-brand);
    background-color: var(--bg-brand-solid);
}

.clock__number--multi {
    background-color: var(--bg-brand-subtle);
    color: var(--text-brand);
}

.clock__hand {
    position: absolute;
    left: 50%;
    bottom: 50%;
    width: 2px;
    background: var(--bg-brand-solid);
    transform-origin: bottom center;
    pointer-events: none;
    z-index: 1;
}

.clock__hand-knob {
    position: absolute;
    top: -16px;
    left: 50%;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--bg-brand-solid);
    transform: translateX(-50%);
}
```

### File: packages\fields\src\styles\components\toast.css

```css
/* ... Previous Viewport Styles ... */
.toast-viewport {
    position: fixed;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    pointer-events: none;
    padding: 1.5rem;
    width: 100%;
    max-width: 420px;
    margin: 0;
    list-style: none;
    /* Ensure layout changes allow animations */
    transition: transform 0.2s ease;
}

/* ... Position Styles (Same as Phase 1) ... */
.toast-viewport--top-right {
    top: 0;
    right: 0;
}

.toast-viewport--top-left {
    top: 0;
    left: 0;
}

.toast-viewport--top-center {
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    align-items: center;
}

.toast-viewport--bottom-right {
    bottom: 0;
    right: 0;
    flex-direction: column-reverse;
}

.toast-viewport--bottom-left {
    bottom: 0;
    left: 0;
    flex-direction: column-reverse;
}

.toast-viewport--bottom-center {
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    align-items: center;
    flex-direction: column-reverse;
}

/* --- Toast Card --- */
.toast {
    pointer-events: auto;
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--field-radius);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    min-width: 300px;
    width: 100%;
    overflow: hidden;
    user-select: none;
    /* Better for swiping */
    touch-action: none;
    /* Handle touch in JS */

    /* Transitions for Swipe */
    transition: transform 0.1s linear, opacity 0.1s linear, height 0.2s ease;

    /* Animation Entry */
    animation: toast-slide-in 0.35s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
}

/* Exit animation class appended by JS before unmount (Phase 3 logic, prepping CSS) */
.toast[data-state='closed'] {
    animation: toast-swipe-out 0.2s ease-out forwards;
}

@keyframes toast-slide-in {
    from {
        opacity: 0;
        transform: translateY(10px) scale(0.95);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes toast-swipe-out {
    from {
        opacity: 1;
        transform: translateX(0);
    }

    to {
        opacity: 0;
        transform: translateX(100%);
    }
}

/* ... Variants (Success, Error etc) same as Phase 1 ... */
.toast--success {
    border-left: 4px solid var(--success-500);
}

.toast--error {
    border-left: 4px solid var(--error-500);
}

.toast--warning {
    border-left: 4px solid var(--warning-500);
}

.toast--info {
    border-left: 4px solid var(--primary-500);
}

.toast--loading {
    border-left: 4px solid var(--text-tertiary);
}

/* ... Content Styles same as Phase 1 ... */
.toast__icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    margin-top: 2px;
}

.toast__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.toast__title {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text-primary);
    line-height: 1.4;
}

.toast__message {
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.4;
}

/* --- Action Button --- */
.toast__action {
    align-self: center;
    margin-left: auto;
    padding: 0.35rem 0.75rem;
    font-size: 0.8rem;
    font-weight: 600;
    border-radius: var(--field-radius);
    background-color: var(--bg-surface-active);
    color: var(--text-primary);
    border: 1px solid var(--border-subtle);
    cursor: pointer;
    transition: background-color 0.2s;
    white-space: nowrap;
}

.toast__action:hover {
    background-color: var(--bg-brand-subtle);
    color: var(--text-brand);
    border-color: var(--border-focus);
}

/* --- Close Button --- */
.toast__close {
    flex-shrink: 0;
    background: transparent;
    border: none;
    color: var(--text-tertiary);
    cursor: pointer;
    padding: 0.25rem;
    margin: -0.25rem -0.25rem 0 0;
    border-radius: 4px;
    transition: color 0.2s;
}

.toast__close:hover {
    color: var(--text-primary);
}

/* Icons Colors */
.toast--success .toast__icon {
    color: var(--success-500);
}

.toast--error .toast__icon {
    color: var(--error-500);
}

.toast--warning .toast__icon {
    color: var(--warning-500);
}

.toast--info .toast__icon {
    color: var(--primary-500);
}

.toast--loading .toast__icon {
    color: var(--text-secondary);
}
```

### File: packages\fields\src\styles\fields\combobox-field.css

```css
/* ComboboxField Styles */

.field-combobox {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
}

.field-combobox__container {
  display: flex;
  align-items: center;
  position: relative;
  background-color: var(--field-bg);
  border: 1px solid var(--field-border);
  border-radius: var(--field-radius);
  transition: all var(--field-transition);
  min-height: var(--field-height);
  cursor: text;
}

.field-combobox__container:hover {
  background-color: var(--field-bg-hover);
  border-color: var(--field-border-hover);
}

.field-combobox__container--focused {
  border-color: var(--field-border-focus);
  background-color: var(--field-bg-active);
}

.field-combobox__container--error {
  border-color: var(--field-border-error);
}

.field-combobox__container--disabled {
  background-color: var(--field-bg-disabled);
  border-color: var(--field-border-disabled);
  cursor: not-allowed;
  opacity: 0.8;
}

.field-combobox__input {
  flex: 1;
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  padding: 0 var(--field-padding-x);
  font-family: var(--field-font-family);
  font-size: var(--field-font-size);
  color: var(--field-text);
  outline: none;
}

.field-combobox__menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background-color: var(--field-bg);
  border: 1px solid var(--field-border);
  border-radius: var(--field-radius);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 250px;
  overflow-y: auto;
  opacity: 0;
  transform: translateY(-10px);
  pointer-events: none;
  transition: all var(--field-transition);
}

.field-combobox__menu--open {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

/* --- Upward Direction --- */
.field-combobox--up .field-combobox__menu {
  top: auto;
  bottom: calc(100% + 4px);
  transform: translateY(10px);
  /* Start from slightly lower */
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
}

.field-combobox--up .field-combobox__menu--open {
  transform: translateY(0);
}

.field-combobox__option {
  padding: 8px var(--field-padding-x);
  cursor: pointer;
  color: var(--field-text);
  transition: background-color var(--field-transition);
}

.field-combobox__option:hover {
  background-color: var(--field-bg-hover);
}

.field-combobox__option--selected {
  background-color: var(--primary-50);
  color: var(--primary-700);
}
```

### File: packages\fields\src\styles\fields\date-field.css

```css
/* DateField & TimeField Styles */

.field-date {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
}

/* Reusing text container styles via composition or duplication if needed. 
   Since we are using BEM, we can just use the same classes or duplicate for independence.
   Let's duplicate for independence but keep it consistent.
*/

.field-date__container {
  display: flex;
  align-items: center;
  position: relative;
  background-color: var(--field-bg);
  border: 1px solid var(--field-border);
  border-radius: var(--field-radius);
  transition: all var(--field-transition);
  min-height: var(--field-height);
  cursor: text;
}

.field-date__container:hover {
  background-color: var(--field-bg-hover);
  border-color: var(--field-border-hover);
}

.field-date__container--focused {
  border-color: var(--field-border-focus);
  background-color: var(--field-bg-active);
}

.field-date__container--error {
  border-color: var(--field-border-error);
}

.field-date__container--disabled {
  background-color: var(--field-bg-disabled);
  border-color: var(--field-border-disabled);
  cursor: not-allowed;
  opacity: 0.8;
}

.field-date__input {
  flex: 1;
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  padding: 0 var(--field-padding-x);
  font-family: var(--field-font-family);
  font-size: var(--field-font-size);
  color: var(--field-text);
  outline: none;
}

/* Calendar Popover */
.field-date__popover {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  background-color: var(--field-bg);
  border: 1px solid var(--field-border);
  border-radius: var(--field-radius);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 10;
  padding: 16px;
  opacity: 0;
  transform: translateY(-10px);
  pointer-events: none;
  transition: all var(--field-transition);
}

.field-date__popover--open {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

/* Simple Calendar Grid for demo purposes */
.field-date__calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  text-align: center;
}

.field-date__day {
  padding: 4px;
  cursor: pointer;
  border-radius: 4px;
}

.field-date__day:hover {
  background-color: var(--field-bg-hover);
}

.field-date__day--selected {
  background-color: var(--primary-500);
  color: white;
}

```

### File: packages\fields\src\styles\fields\file-drop.css

```css
/* FileDrop Styles */

.field-file {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
}

.field-file__dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  border: 2px dashed var(--field-border);
  border-radius: var(--field-radius);
  background-color: var(--field-bg);
  transition: all var(--field-transition);
  cursor: pointer;
  text-align: center;
}

.field-file__dropzone:hover {
  background-color: var(--field-bg-hover);
  border-color: var(--field-border-hover);
}

.field-file__dropzone--dragover {
  background-color: var(--primary-50);
  border-color: var(--primary-500);
}

.field-file__dropzone--disabled {
  background-color: var(--field-bg-disabled);
  border-color: var(--field-border-disabled);
  cursor: not-allowed;
  opacity: 0.8;
}

.field-file__icon {
  color: var(--field-text-placeholder);
  margin-bottom: 8px;
}

.field-file__text {
  font-size: var(--field-font-size);
  color: var(--field-text);
}

.field-file__subtext {
  font-size: 0.875em;
  color: var(--field-text-placeholder);
  margin-top: 4px;
}

.field-file__input {
  display: none;
}

/* File List */
.field-file__list {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-file__item {
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: var(--field-bg);
  border: 1px solid var(--field-border);
  border-radius: var(--field-radius);
}

.field-file__item-name {
  flex: 1;
  font-size: 0.875em;
  color: var(--field-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.field-file__item-remove {
  color: var(--field-text-placeholder);
  cursor: pointer;
  padding: 4px;
}

.field-file__item-remove:hover {
  color: var(--error-500);
}
```

### File: packages\fields\src\styles\fields\rich-text-field.css

```css
/* Base Layout */
.field-rich-text {
    display: flex;
    flex-direction: column;
    width: 100%;
    position: relative;
}

.field-rich-text__container {
    border: 1px solid var(--field-border);
    border-radius: var(--field-radius);
    background-color: var(--field-bg);
    transition: border-color 0.2s;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

/* Framed Variant (Default) */
.field-rich-text--framed .field-rich-text__container:hover {
    border-color: var(--field-border-hover);
}

.field-rich-text--framed .field-rich-text__container:focus-within {
    border-color: var(--field-border-focus);
}

/* States */
.field-rich-text__container--error {
    border-color: var(--field-border-error) !important;
}

.field-rich-text__container--warning {
    border-color: var(--warning-500) !important;
}

/* Inline Variant */
.field-rich-text--inline .field-rich-text__container {
    border: none;
    background-color: transparent;
    border-radius: 0;
}

.field-rich-text--inline .ql-toolbar.ql-snow {
    border: none;
    background-color: transparent;
    padding: 0;
    padding-bottom: 8px;
    opacity: 0.6;
    transition: opacity 0.2s;
}

.field-rich-text--inline:focus-within .ql-toolbar.ql-snow,
.field-rich-text--inline:hover .ql-toolbar.ql-snow {
    opacity: 1;
}

.field-rich-text--inline .ql-container.ql-snow {
    border: none;
}

.field-rich-text--inline .ql-editor {
    padding: 0;
    min-height: 0;
}

/* --- Quill Base Overrides --- */
.ql-toolbar.ql-snow {
    border: none;
    border-bottom: 1px solid var(--border-subtle);
    background-color: var(--bg-surface-subtle);
    font-family: inherit;
    padding: 8px;
    z-index: 2;
}

.ql-container.ql-snow {
    border: none;
    font-family: var(--field-font-family);
    font-size: var(--field-font-size);
    color: var(--field-text);
    /* Flex grow to allow max-height to work properly on the container if needed, 
       but usually max-height is applied to .ql-editor */
}

.ql-editor {
    min-height: 100px;
    padding: 16px;
    line-height: 1.6;
    /* Smooth scrolling */
    overflow-y: auto; 
}

.ql-editor.ql-blank::before {
    color: var(--field-text-placeholder);
    font-style: normal;
    left: 16px;
}

.field-rich-text--inline .ql-editor.ql-blank::before {
    left: 0;
}

/* Character Count */
.field-rich-text__count {
    align-self: flex-end;
    font-size: 0.75rem;
    color: var(--text-tertiary);
    margin-top: 4px;
    font-variant-numeric: tabular-nums;
}

.field-rich-text__count--limit {
    color: var(--text-error);
    font-weight: 500;
}

/* Read Only Mode */
.field-rich-text--readonly .ql-toolbar {
    display: none;
    border-bottom: none;
}

.field-rich-text--readonly .field-rich-text__container {
    background-color: var(--bg-surface-disabled);
}

.field-rich-text--readonly .ql-container.ql-snow {
    color: var(--field-text); 
    opacity: 0.8;
}

.field-rich-text--readonly .ql-editor {
    padding: 12px;
}

.field-rich-text--inline.field-rich-text--readonly .field-rich-text__container {
    background-color: transparent;
    border: none;
}

.field-rich-text--inline.field-rich-text--readonly .ql-editor {
    padding: 0;
}

/* Icons Colors */
.ql-snow .ql-stroke { stroke: var(--text-secondary); }
.ql-snow .ql-fill { fill: var(--text-secondary); }
.ql-snow .ql-picker { color: var(--text-secondary); }

.ql-snow .ql-picker:hover, .ql-snow .ql-picker.ql-expanded { color: var(--text-primary); }
.ql-snow .ql-picker-options {
    background-color: var(--bg-overlay);
    border-color: var(--border-default);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.ql-snow .ql-picker-item:hover { color: var(--text-brand); }
.ql-snow .ql-active .ql-stroke { stroke: var(--text-brand); }
.ql-snow .ql-active .ql-fill { fill: var(--text-brand); }
.ql-toolbar.ql-snow button { margin-right: 4px; }
```

### File: packages\fields\src\styles\fields\select-field.css

```css
/* SelectField Styles */

.field-select {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
}

.field-select__container {
  display: flex;
  align-items: center;
  position: relative;
  background-color: var(--field-bg);
  border: 1px solid var(--field-border);
  border-radius: var(--field-radius);
  transition: all var(--field-transition);
  min-height: var(--field-height);
  cursor: pointer;
  padding-right: 8px;
  /* Space for arrows */
}

.field-select__container:hover {
  background-color: var(--field-bg-hover);
  border-color: var(--field-border-hover);
}

.field-select__container--focused {
  border-color: var(--field-border-focus);
  background-color: var(--field-bg-active);
}

.field-select__container--error {
  border-color: var(--field-border-error);
}

.field-select__container--disabled {
  background-color: var(--field-bg-disabled);
  border-color: var(--field-border-disabled);
  cursor: not-allowed;
  opacity: 0.8;
}

/* Content Area */
.field-select__content {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  padding: 4px var(--field-padding-x);
  min-height: var(--field-height);
}

.field-select__input {
  border: none;
  background: transparent;
  font-family: var(--field-font-family);
  font-size: var(--field-font-size);
  color: var(--field-text);
  outline: none;
  padding: 0;
  margin: 0;
  min-width: 60px;
  flex: 1;
}

/* Single Value Display */
.field-select__single {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--field-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Icons & Avatars */
.field-select__icon,
.field-select__option-icon {
  display: flex;
  align-items: center;
  color: var(--field-text-placeholder);
  margin-right: 8px;
}

.field-select__avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 8px;
}

/* Chips */
.field-select__chip {
  display: flex;
  align-items: center;
  background-color: var(--gray-100);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 0.85em;
  gap: 4px;
  color: var(--field-text);
}

.field-select__chip-remove {
  cursor: pointer;
  opacity: 0.5;
  display: flex;
  align-items: center;
}

.field-select__chip-remove:hover {
  opacity: 1;
}

/* Arrows & Clear */
.field-select__arrow {
  color: var(--field-text-placeholder);
  transition: transform 0.2s;
  display: flex;
}

.field-select__arrow--flip {
  transform: rotate(180deg);
}

.field-select__clear {
  color: var(--field-text-placeholder);
  cursor: pointer;
  margin-right: 4px;
  display: flex;
}

.field-select__clear:hover {
  color: var(--field-text-error);
}

.field-select__spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

/* Dropdown Menu */
.field-select__menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background-color: var(--field-bg);
  border: 1px solid var(--field-border);
  border-radius: var(--field-radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 50;
  max-height: 250px;
  overflow-y: auto;
  opacity: 0;
  transform: translateY(-5px);
  pointer-events: none;
  transition: all 0.1s;
  display: flex;
  flex-direction: column;
}

.field-select__menu--open {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

/* Group Styles */
.field-select__option--group {
  font-weight: 600;
  color: var(--gray-600);
}

/* Options */
.field-select__option {
  padding: 8px 12px;
  cursor: pointer;
  color: var(--field-text);
  display: flex;
  align-items: center;
  transition: background-color 0.1s;
}

.field-select__option:hover,
.field-select__option--highlighted {
  background-color: var(--field-bg-hover);
}

.field-select__option--selected {
  background-color: var(--primary-50);
  color: var(--primary-700);
}

.field-select__option--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.field-select__check {
  margin-left: auto;
  color: currentColor;
}

.field-select__option-label {
  flex: 1;
}

.field-select__no-options {
  padding: 12px;
  color: var(--field-text-placeholder);
  text-align: center;
}

.field-select__action-bar {
  padding: 8px 12px;
  border-bottom: 1px solid var(--field-border);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--primary-600);
  font-weight: 500;
  font-size: 0.9em;
}

.field-select__action-bar:hover {
  background-color: var(--gray-50);
}

/* Upward Flip */
.field-select--up .field-select__menu {
  top: auto;
  bottom: calc(100% + 4px);
}

/* Chips Below */
.field-select__chips-external {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
}
```

### File: packages\fields\src\styles\fields\slider-field.css

```css
/* SliderField Styles */

.field-slider {
  display: flex;
  flex-direction: column;
  position: relative;
  /* Added to contain absolute elements */
  width: 100%;
}

.field-slider__container {
  display: flex;
  align-items: center;
  height: var(--field-height);
  padding: 0 8px;
}

.field-slider__track {
  position: relative;
  width: 100%;
  height: 4px;
  background-color: var(--field-bg-disabled);
  border-radius: 2px;
  cursor: pointer;
}

.field-slider__fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background-color: var(--primary-500);
  border-radius: 2px;
}

.field-slider__thumb {
  position: absolute;
  top: 50%;
  width: 16px;
  height: 16px;
  background-color: var(--gray-0);
  border: 2px solid var(--primary-500);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: grab;
  transition: transform 0.1s, box-shadow 0.1s;
  z-index: 2;
}

.field-slider__thumb:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.field-slider__thumb:active {
  cursor: grabbing;
  transform: translate(-50%, -50%) scale(1.2);
  box-shadow: 0 0 0 4px var(--field-ring-color);
}

.field-slider__input {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 3;
}
```

### File: packages\fields\src\styles\fields\tag-input.css

```css
/* TagInput Styles */

.field-tag {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
}

.field-tag__container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  position: relative;
  background-color: var(--field-bg);
  border: 1px solid var(--field-border);
  border-radius: var(--field-radius);
  transition: all var(--field-transition);
  min-height: var(--field-height);
  padding: 4px var(--field-padding-x);
  cursor: text;
}

.field-tag__container:hover {
  background-color: var(--field-bg-hover);
  border-color: var(--field-border-hover);
}

.field-tag__container--focused {
  border-color: var(--field-border-focus);
  background-color: var(--field-bg-active);
}

.field-tag__container--error {
  border-color: var(--field-border-error);
}

.field-tag__container--disabled {
  background-color: var(--field-bg-disabled);
  border-color: var(--field-border-disabled);
  cursor: not-allowed;
  opacity: 0.8;
}

.field-tag__chip {
  display: flex;
  align-items: center;
  background-color: var(--primary-100);
  color: var(--primary-700);
  border-radius: 16px;
  padding: 2px 8px;
  font-size: 0.875em;
}

.field-tag__chip-remove {
  margin-left: 4px;
  cursor: pointer;
  opacity: 0.6;
}

.field-tag__chip-remove:hover {
  opacity: 1;
}

.field-tag__input {
  flex: 1;
  min-width: 60px;
  border: none;
  background: transparent;
  font-family: var(--field-font-family);
  font-size: var(--field-font-size);
  color: var(--field-text);
  outline: none;
  padding: 4px 0;
}

.field-tag__input::placeholder {
  color: var(--field-text-placeholder);
}

```

### File: packages\fields\src\styles\overlays\popover.css

```css
.popover-wrapper {
    position: relative;
    width: 100%;
    display: inline-block;
}

.popover-content {
    position: absolute;
    z-index: 50;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    background: var(--bg-overlay);
    border: 1px solid var(--border-default);
    border-radius: var(--field-radius);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    min-width: 320px;

    /* Animation base state */
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.1s ease-out, transform 0.1s ease-out;
}

.popover-content--open {
    opacity: 1;
    pointer-events: auto;
}

/* Position: Bottom (Default) */
.popover-content--bottom {
    top: 100%;
    transform: translateY(-4px);
}

.popover-content--bottom.popover-content--open {
    transform: translateY(0);
}

/* Position: Top (Flipped) */
.popover-content--top {
    bottom: 100%;
    top: auto;
    transform: translateY(4px);
}

.popover-content--top.popover-content--open {
    transform: translateY(0);
}

.popover-content--left {
    left: 0;
}

.popover-content--right {
    right: 0;
}

@keyframes popoverFadeIn {
    from {
        opacity: 0;
        transform: translateY(-4px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

### File: packages\fields\src\styles\theme.css

```css
:root {
  /* --- Tier 1: Primitives --- */
  /* Grays */
  --gray-0: #ffffff;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
  --gray-950: #030712;

  /* Brand Colors */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;

  /* Status Colors */
  --error-50: #fef2f2;
  --error-500: #ef4444;
  --error-600: #dc2626;

  --warning-50: #fffbeb;
  --warning-500: #f59e0b;

  --success-50: #f0fdf4;
  --success-500: #22c55e;

  /* --- Tier 2: Semantics (The "Well Defined" Layer) --- */

  /* Backgrounds */
  --bg-surface: var(--gray-0);
  --bg-surface-subtle: var(--gray-50);
  --bg-surface-active: var(--gray-100);
  --bg-surface-disabled: var(--gray-50);
  --bg-overlay: var(--gray-0);
  /* Popovers/Dropdowns */
  --bg-brand-subtle: var(--primary-50);
  --bg-brand-solid: var(--primary-500);

  /* Borders */
  --border-default: var(--gray-300);
  --border-subtle: var(--gray-200);
  --border-active: var(--gray-400);
  --border-focus: var(--primary-500);
  --border-error: var(--error-500);

  /* Text */
  --text-primary: var(--gray-900);
  --text-secondary: var(--gray-600);
  --text-tertiary: var(--gray-400);
  /* Placeholders */
  --text-on-brand: var(--gray-0);
  --text-error: var(--error-600);
  --text-brand: var(--primary-700);

  /* Rings & Effects */
  --ring-brand: var(--primary-100);
  --ring-width: 3px;
  --ripple-color: rgba(0, 0, 0, 0.1);

  /* Dimensions & Spacing */
  --field-height: 40px;
  --field-radius: 6px;
  --field-padding-x: 12px;
  --field-gap: 8px;
  --field-icon-size: 20px;

  /* Typography */
  --field-font-family: inherit;
  --field-font-size: 14px;
  --field-line-height: 20px;

  /* Transitions */
  --field-transition: 150ms cubic-bezier(0.4, 0, 0.2, 1);

  /* --- Tier 3: Component Mappings (Backwards Compat + Specifics) --- */
  --field-bg: var(--bg-surface);
  --field-bg-hover: var(--bg-surface-subtle);
  --field-bg-disabled: var(--bg-surface-disabled);
  --field-bg-active: var(--bg-surface);

  --field-border: var(--border-default);
  --field-border-hover: var(--border-active);
  --field-border-focus: var(--border-focus);
  --field-border-error: var(--border-error);
  --field-border-disabled: var(--border-subtle);

  --field-text: var(--text-primary);
  --field-text-placeholder: var(--text-tertiary);
  --field-text-label: var(--text-secondary);
  --field-text-disabled: var(--text-tertiary);
  --field-text-error: var(--text-error);

  --field-ring-color: var(--ring-brand);
  --field-ripple-color: var(--ripple-color);

  --dropdown-bg: var(--bg-overlay);
  --input-border: var(--border-default);
  --input-radius: var(--field-radius);
  --input-text: var(--text-primary);
  --fill-bg: var(--bg-brand-solid);
}

/* Dark Mode Overrides */
[data-theme='dark'] {
  /* Backgrounds */
  --bg-surface: #222222;
  --bg-surface-subtle: var(--gray-800);
  --bg-surface-active: var(--gray-800);
  --bg-surface-disabled: var(--gray-900);
  --bg-overlay: #1e1e1e;

  /* Borders */
  --border-default: var(--gray-700);
  --border-subtle: var(--gray-800);
  --border-active: var(--gray-600);
  --border-focus: var(--primary-500);

  /* Text */
  --text-primary: var(--gray-100);
  --text-secondary: var(--gray-400);
  --text-tertiary: var(--gray-600);
  --text-brand: var(--primary-500);

  /* Rings */
  --ring-brand: rgba(59, 130, 246, 0.2);
  --ripple-color: rgba(255, 255, 255, 0.1);
}
```

### File: packages\fields\src\styles\wrappers\adornment-wrapper.css

```css
/* --- Adornment Wrapper --- */
.field-adornment {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--field-text-placeholder);
  min-width: var(--field-icon-size);
}

.field-adornment--prefix {
  margin-right: var(--field-gap);
}

.field-adornment--suffix {
  margin-left: var(--field-gap);
}

.field-adornment--interactive {
  cursor: pointer;
  pointer-events: auto;
  transition: color var(--field-transition);
}

.field-adornment--interactive:hover {
  color: var(--field-text);
}

```

### File: packages\fields\src\styles\wrappers\effect-wrapper.css

```css
/* --- Effect Wrapper (Ripple & Focus Ring) --- */
.field-focus-ring {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: var(--field-radius);
  pointer-events: none;
  box-shadow: 0 0 0 0 transparent;
  transition: box-shadow var(--field-transition);
}

.field-focus-ring--active {
  box-shadow: 0 0 0 var(--field-ring-width) var(--field-ring-color);
}

.field-ripple {
  position: absolute;
  border-radius: 50%;
  transform: scale(0);
  animation: ripple 600ms linear;
  background-color: var(--field-ripple-color);
  pointer-events: none;
}

@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

```

### File: packages\fields\src\styles\wrappers\field-array-wrapper.css

```css
/* --- Field Array Wrapper --- */
.field-array {
  display: flex;
  flex-direction: column;
  gap: var(--field-gap);
}

.field-array__item {
  display: flex;
  align-items: flex-start;
  gap: var(--field-gap);
}

.field-array__action {
  margin-top: 4px; /* Align with input */
}

```

### File: packages\fields\src\styles\wrappers\label-wrapper.css

```css
/* --- Label Wrapper --- */
.field-label {
	display: flex;
	align-items: center;
	font-family: var(--field-font-family);
	font-size: var(--field-font-size);
	color: var(--field-text-label);
	margin-bottom: 4px;
	transition: all var(--field-transition);
	pointer-events: none;
	transform-origin: top left;
	line-height: 1.5;
	order: -1;
}

.field-label .help-tooltip {
	pointer-events: auto;
}

/* Positioning Modifiers */
.field-label--pos-left {
	margin-bottom: 0;
	margin-right: 8px;
	align-self: center;
	order: initial;
}

.field-label--pos-right {
	margin-bottom: 0;
	margin-left: 8px;
	align-self: center;
	order: 1;
}

.field-label--pos-bottom {
	margin-bottom: 0;
	margin-top: 4px;
	order: 1;
}

/* --- Floating Logic --- */
.field-label--floating {
	position: absolute;
	z-index: 10;
	background-color: transparent;
	padding: 0 4px;
	margin-bottom: 0;
	left: var(--field-padding-x);
	top: 50%;
	transform: translateY(-50%);
}

.field-label--floating:not(.field-label--active) .help-tooltip {
	opacity: 0;
	visibility: hidden;
	transition: opacity 0.1s;
}

.field-label--floating.field-label--active .help-tooltip {
	opacity: 1;
	visibility: visible;
}

.field-label--multiline.field-label--floating {
	top: 8px; 
	transform: none;
}

.field-label--floating:not(.field-label--active) {
	color: var(--field-text-placeholder);
}

.field-label--active {
	top: 0 !important;
	transform: translateY(-50%) scale(0.85) !important;
	left: calc(var(--field-padding-x) - 2px); 
	color: var(--field-border-focus);
	background-color: var(--field-bg);
}

.field-label--error { color: var(--field-text-error); }
.field-label--disabled { color: var(--field-text-disabled); }
.field-label__required { color: var(--error-500); margin-left: 2px; }

/* --- Absolute Help Positioning --- */
/* These classes are applied directly to the .help-tooltip element when outside */

.help-tooltip--top-right {
	position: absolute;
	top: 0;
	right: 0;
	z-index: 20;
	/* Offset padding to align nicely */
	margin: 8px; 
}

.help-tooltip--bottom-right {
	position: absolute;
	bottom: 0;
	right: 0;
	z-index: 20;
	margin: 8px;
}

.help-tooltip--bottom-left {
	position: absolute;
	bottom: 0;
	left: 0;
	z-index: 20;
	margin: 8px;
}
```

### File: packages\fields\src\styles\wrappers\message-wrapper.css

```css
/* --- Message Wrapper --- */
.field-message {
  font-family: var(--field-font-family);
  font-size: 0.75rem; /* 12px */
  line-height: 1.2;
  margin-top: 4px;
  min-height: 0;
  transition: all var(--field-transition);
  opacity: 1;
}

.field-message--hidden {
  opacity: 0;
  margin-top: 0;
  height: 0;
  overflow: hidden;
}

.field-message--error {
  color: var(--field-text-error);
}

.field-message--warning {
  color: var(--warning-500);
}

.field-message--info {
  color: var(--field-text-placeholder);
}

```

### File: packages\fields\src\styles\wrappers\skeleton-wrapper.css

```css
/* --- Skeleton Wrapper --- */
.field-skeleton {
  background-color: var(--field-bg-disabled);
  border-radius: var(--field-radius);
  overflow: hidden;
  position: relative;
}

.field-skeleton--pulse::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.2) 20%,
    rgba(255, 255, 255, 0.5) 60%,
    rgba(255, 255, 255, 0)
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.field-skeleton--rect {
  height: var(--field-height);
  width: 100%;
}

.field-skeleton--circle {
  width: var(--field-height);
  height: var(--field-height);
  border-radius: 50%;
}

.field-skeleton--pill {
  height: 24px;
  width: 60px;
  border-radius: 12px;
}

```

### File: packages\fields\src\types\components\accordion.ts

```ts
import { ComponentChildren, CSSProperties } from 'preact';
import { Signal } from '@preact/signals';

export type AccordionType = 'single' | 'multiple';
export type AccordionVariant = 'outlined' | 'filled' | 'ghost';
export type AccordionDensity = 'compact' | 'normal' | 'spacious';

/**
 * Props for the Root Accordion Component
 */
export interface AccordionProps {
	children: ComponentChildren;
	type?: AccordionType;
	value?: string | string[];
	defaultValue?: string | string[];
	onValueChange?: (value: string | string[]) => void;
	collapsible?: boolean;
	disabled?: boolean | Signal<boolean>;

	/**
	 * Visual style variant.
	 * @default 'outlined'
	 */
	variant?: AccordionVariant;

	/**
	 * Vertical spacing density.
	 * @default 'normal'
	 */
	density?: AccordionDensity;

	className?: string;
	style?: CSSProperties;
}

export interface AccordionItemProps {
	value: string;
	children: ComponentChildren;
	disabled?: boolean | Signal<boolean>;
	className?: string;
	style?: CSSProperties;
}

/**
 * Props for the Accordion Trigger (Header)
 */
export interface AccordionTriggerProps {
	children: ComponentChildren;
	className?: string;
	style?: CSSProperties;

	/**
	 * Secondary text displayed below the main title.
	 */
	subtitle?: ComponentChildren;

	/**
	 * Icon displayed before the title.
	 */
	startIcon?: ComponentChildren;

	/**
	 * Interactive elements to display on the right side (e.g. Buttons).
	 * Events will not propagate to the accordion toggle.
	 */
	actions?: ComponentChildren;

	/**
	 * Custom icon to replace the default chevron. Pass null to hide.
	 */
	icon?: ComponentChildren;

	/**
	 * Whether to rotate the icon when expanded.
	 * @default true
	 */
	rotateIcon?: boolean;
}

/**
 * Props for the Accordion Content (Body)
 */
export interface AccordionContentProps {
	children: ComponentChildren;
	className?: string;
	style?: CSSProperties;

	/**
	 * If true, the content remains in the DOM when closed.
	 * @default true
	 */
	keepMounted?: boolean;
}

export interface AccordionContextValue {
	expandedValues: Signal<Set<string>>;
	toggle: (value: string) => void;
	expandAll: (values: string[]) => void; // New
	collapseAll: () => void; // New
	disabled: Signal<boolean>;
	collapsible: boolean;
	type: AccordionType;
	variant: AccordionVariant;
	density: AccordionDensity;
}

export interface AccordionItemContextValue {
	value: string;
	isOpen: Signal<boolean>;
	disabled: Signal<boolean>;
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

### File: packages\fields\src\types\components\splitter.ts

```ts
import { ComponentChildren, JSX } from 'preact';
import { Signal } from '@preact/signals';

export type SplitterDirection = 'horizontal' | 'vertical';

export interface SplitterProps {
	children: ComponentChildren;
	direction?: SplitterDirection;
	initialSizes?: number[];
	minPaneSize?: number;
	breakpoint?: number;
	className?: string;
	style?: JSX.CSSProperties;
	onResizeEnd?: (sizes: number[]) => void;
	onCollapse?: (index: number, collapsed: boolean) => void;
}

export interface SplitterPaneProps {
	children: ComponentChildren;
	className?: string;
	style?: JSX.CSSProperties;
	minSize?: number;
	maxSize?: number;
	collapsible?: boolean;
	defaultCollapsed?: boolean;
	ariaLabel?: string;
}

export interface SplitterGutterProps {
	index: number;
	direction: SplitterDirection;
}

export interface SplitterContextValue {
	direction: SplitterDirection;
	sizes: Signal<number[]>;
	startResize: (index: number, clientX: number, clientY: number) => void;
	// New: Generalized move handler for keyboard
	moveSplitter: (index: number, deltaPercent: number) => void;
	toggleCollapse: (index: number) => void;
	isResizing: Signal<boolean>;
}

```

### File: packages\fields\src\types\components\stepper.ts

```ts
import { ComponentChildren, JSX } from 'preact';
import { Signal } from '@preact/signals';

export type StepperOrientation = 'horizontal' | 'vertical';
export type StepStatus = 'pending' | 'active' | 'completed' | 'error' | 'disabled';
export type StepperVariant = 'circle' | 'dot';

export interface StepperProps {
	children: ComponentChildren;
	activeStep?: number;
	defaultActiveStep?: number;
	orientation?: StepperOrientation;
	linear?: boolean;

	/**
	 * Visual style of the step indicators.
	 * @default 'circle'
	 */
	variant?: StepperVariant;

	/**
	 * If set, the stepper will switch to vertical layout when
	 * container width is below this pixel value.
	 * Pass `true` for default (600px).
	 */
	responsive?: boolean | number;

	beforeStepChange?: (nextStep: number, currentStep: number) => boolean | Promise<boolean>;
	onStepChange?: (step: number) => void;
	onComplete?: () => void;
	keepMounted?: boolean;

	className?: string;
	style?: JSX.CSSProperties;
}

export interface StepProps {
	id?: string;
	label: string;
	description?: string;
	icon?: ComponentChildren;
	status?: StepStatus;
	optional?: boolean;
	disabled?: boolean;
	error?: boolean;
	className?: string;
	style?: JSX.CSSProperties;
	index?: number;
	isLast?: boolean;
}

export interface StepperPanelProps {
	children: ComponentChildren;
	index?: number;
	className?: string;
	style?: JSX.CSSProperties;
}

export interface StepperContextValue {
	activeStep: Signal<number>;
	orientation: StepperOrientation; // Effectively active orientation
	variant: StepperVariant;
	linear: boolean;
	keepMounted: boolean;

	next: () => void;
	back: () => void;
	goTo: (step: number) => void;

	totalSteps: Signal<number>;
	setTotalSteps: (count: number) => void;

	isLoading: Signal<boolean>;
	stepErrors: Signal<Set<number>>;
	setStepError: (stepIndex: number, hasError: boolean) => void;
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

### File: packages\fields\src\types\components\toast.ts

```ts
import { ComponentChildren, JSX } from 'preact';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'neutral';
export type ToastPosition =
	| 'top-left'
	| 'top-center'
	| 'top-right'
	| 'bottom-left'
	| 'bottom-center'
	| 'bottom-right';

export interface ToastAction {
	label: string;
	onClick: (e: MouseEvent) => void;
	altText?: string;
}

export interface ToastData {
	id: string;
	type: ToastType;
	title?: string;
	message?: ComponentChildren;
	duration?: number;
	dismissible?: boolean;
	icon?: ComponentChildren;
	action?: ToastAction;
	createdAt: number;
	exiting?: boolean;
}

export interface ToastOptions {
	id?: string; // Allow manual ID for updating
	duration?: number;
	dismissible?: boolean;
	icon?: ComponentChildren;
	description?: string;
	action?: ToastAction;
	position?: ToastPosition;
}

// Promise Data Types
export type PromiseT<Data = any> = Promise<Data> | (() => Promise<Data>);

export type PromiseData<Data = any> = {
	loading: string | ComponentChildren;
	success: string | ComponentChildren | ((data: Data) => ComponentChildren);
	error: string | ComponentChildren | ((error: any) => ComponentChildren);
};

export interface ToastProviderProps {
	position?: ToastPosition;
	limit?: number;
	defaultDuration?: number;
	className?: string;
	style?: JSX.CSSProperties;
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
	value?: FileWithMeta[]; // Override base value to use FileWithMeta
	onChange?: (files: FileWithMeta[]) => void;
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
import { useRipple } from '../hooks/useRipple.ts';
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

