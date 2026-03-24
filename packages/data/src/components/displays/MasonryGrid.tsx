import '../../styles/components/masonry.css';
import { useEffect, useMemo, useState } from 'preact/hooks';
import type { Dataset } from '../../core/dataset.ts';
import { useMasonryVirtual } from '../../hooks/useMasonryVirtual.ts';
import { ScrollPane } from '../ScrollPane.tsx';

// #region Interfaces
export interface MasonryGridProps<T> {
	dataset: Dataset<T>;
	renderItem: (item: T, index: number) => preact.VNode;
	onItemClick?: (key: string, e: MouseEvent) => void;
	estimateHeight?: number;
	gap?: number;
	columnWidth?: number;
	columns?: number;
	useWindowScroll?: boolean;
	scrollMode?: 'container' | 'window';
	className?: string;
	animateEntrance?: boolean;
}
// #endregion

// #region Component
export function MasonryGrid<T>({
	dataset,
	renderItem,
	onItemClick,
	estimateHeight = 250,
	gap = 16,
	columnWidth,
	columns,
	useWindowScroll = false,
	scrollMode = 'container',
	className = '',
	animateEntrance = false, // FIX: Disabled by default for debugging
}: MasonryGridProps<T>) {
	const activeKeys = useMemo(() => dataset.order, [dataset.order]);
	const [announcement, setAnnouncement] = useState('');

	const {
		parentRef,
		gridRef,
		getItems,
		getTotalSize,
		containerWidth,
	} = useMasonryVirtual({
		count: activeKeys.length,
		estimateHeight: () => estimateHeight,
		gap,
		columnWidth,
		columns,
		useWindowScroll,
		overscan: 400,
	});

	useEffect(() => {
		const total = dataset.totalCount ?? activeKeys.length;
		if (total > 0) {
			setAnnouncement(`Showing ${activeKeys.length} of ${total} items.`);
		} else if (dataset.items.size === 0) {
			setAnnouncement('No items found.');
		}
	}, [activeKeys.length, dataset.totalCount, dataset.items.size]);

	const virtualItems = getItems();

	return (
		<ScrollPane
			ref={parentRef}
			mode={scrollMode}
			className={`data-masonry-wrapper ${className}`}
		>
			<div className='data-masonry__sr-only' aria-live='polite' aria-atomic='true'>
				{announcement}
			</div>

			<ul
				ref={gridRef as any}
				className='data-masonry'
				role='list'
				style={{ height: `${getTotalSize()}px` }}
			>
				{containerWidth > 0 && virtualItems.map((virtualItem) => {
					const key = activeKeys[virtualItem.index];
					const item = dataset.items.get(key);

					if (!item) return null;

					return (
						<li
							key={key}
							ref={virtualItem.measureElement}
							role='listitem'
							className={`data-masonry__item ${
								onItemClick ? 'data-masonry__item--interactive' : ''
							} ${item.selected ? 'data-masonry__item--selected' : ''} ${
								animateEntrance ? 'data-masonry__item--animate-in' : ''
							}`}
							style={{
								// Strictly enforce absolute positioning and raw coordinate translation
								position: 'absolute',
								top: 0,
								left: 0,
								width: `${virtualItem.width}px`,
								transform: `translate(${virtualItem.x}px, ${virtualItem.y}px)`,
								// FIX: Temporarily removed will-change and transition to isolate layout math
							} as preact.JSX.CSSProperties}
							onClick={(e) => onItemClick?.(key, e)}
							data-index={virtualItem.index}
							data-column={virtualItem.columnIndex}
						>
							{renderItem(item.data, virtualItem.index)}
						</li>
					);
				})}
			</ul>
		</ScrollPane>
	);
}
// #endregion
