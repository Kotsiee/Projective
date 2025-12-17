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
