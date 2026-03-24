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
import { MasonryGrid } from './displays/MasonryGrid.tsx';
import { DataDisplayProps } from '../types/DataDisplayProps.ts';

export function DataDisplay<TOut, TIn>({
	dataSource,
	renderItem,
	mode = 'list',
	scrollMode = 'container',
	scrollToBottom = false,
	gridColumns = 3,
	columnWidth,
	gap = 16,
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
	const isMasonry = mode === 'masonry';

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
	const [containerWidth, setContainerWidth] = useState(0);

	// FIX 1: Move the calculation *above* the Virtualizer setup so we don't have to fake the initial count
	const effectiveGridColumns = useMemo(() => {
		if (mode === 'grid' && columnWidth && containerWidth > 0) {
			return Math.max(1, Math.floor((containerWidth + gap) / (columnWidth + gap)));
		}
		return gridColumns;
	}, [mode, columnWidth, containerWidth, gap, gridColumns]);

	const virtualRowCount = isMasonry
		? 0
		: (mode === 'grid' ? Math.ceil(totalCount / effectiveGridColumns) : totalCount);

	// FIX 2: Pass the reactive virtualRowCount properly
	const { parentRef, virtualizer, getItems, getTotalSize } = useVirtual({
		count: virtualRowCount,
		estimateSize: () => estimateHeight,
		overscan: 5,
		useWindowScroll: scrollMode === 'window',
		initialScrollToBottom: scrollToBottom,
	});

	useLayoutEffect(() => {
		if (
			!parentRef.current || mode !== 'grid' || !columnWidth || typeof ResizeObserver === 'undefined'
		) return;

		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (entry) {
				const width = entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
				if (width > 0 && width !== containerWidth) {
					setContainerWidth(width);
				}
			}
		});

		observer.observe(parentRef.current);
		return () => observer.disconnect();
	}, [mode, columnWidth, containerWidth, parentRef]);

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

	const virtualItems = getItems();

	useEffect(() => {
		if (isMasonry) {
			manager.setVisibleRange(0, Math.max(pageSize, activeOrder.length + 10));
		} else if (virtualItems.length > 0) {
			const startRow = virtualItems[0].index;
			const endRow = virtualItems[virtualItems.length - 1].index;

			let start = startRow;
			let end = endRow;

			if (mode === 'grid') {
				start = startRow * effectiveGridColumns;
				end = (endRow + 1) * effectiveGridColumns - 1;
			}

			manager.setVisibleRange(start, end);
		}
	}, [virtualItems, mode, effectiveGridColumns, manager, isMasonry, pageSize, activeOrder.length]);

	const safeRenderItem = (item: TOut, index: number) => renderItem(item, index);

	return (
		<div className={`data-display ${className ?? ''}`} style={style}>
			{manager.isFetching.value && <div className='data-display__loader'>Loading...</div>}

			{isMasonry
				? (
					<MasonryGrid
						dataset={{ ...manager.dataset.value, order: activeOrder }}
						renderItem={safeRenderItem}
						onItemClick={handleItemClick}
						estimateHeight={estimateHeight}
						gap={gap}
						columnWidth={columnWidth}
						columns={columnWidth ? undefined : gridColumns}
						useWindowScroll={scrollMode === 'window'}
						scrollMode={scrollMode}
					/>
				)
				: (
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
									columnCount={effectiveGridColumns}
									gap={gap}
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
				)}
		</div>
	);
}
