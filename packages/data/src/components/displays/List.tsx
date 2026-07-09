import '../../styles/components/list.css';
import '../../styles/skeleton.css';
import type { Dataset } from '../../core/dataset.ts';
import type { VirtualItem, Virtualizer } from '../../core/virtualizer.ts';
import { Row } from '../internal/Row.tsx';
import { ListCardSkeleton } from '@projective/ui/skeletons';

export interface ListProps<T> {
	dataset: Dataset<T>;
	virtualItems: VirtualItem[];
	virtualizer: Virtualizer;
	renderItem: (item: T, index: number) => preact.VNode;
	renderSkeleton?: (index: number) => preact.VNode;
	onItemClick?: (key: string, e: MouseEvent) => void;
	interactive?: boolean;
}

export function List<T>({
	dataset,
	virtualItems,
	virtualizer,
	renderItem,
	renderSkeleton,
	onItemClick,
	interactive,
}: ListProps<T>) {
	return (
		<>
			{virtualItems.map((virtualRow) => {
				const key = dataset.order[virtualRow.index];
				const item = key ? dataset.items.get(key) : undefined;

				let content: preact.ComponentChildren = null;
				let isSelectable = false;
				let isSelected = false;

				// 1. Data has loaded
				if (item && !item.isSkeleton) {
					content = renderItem(item.data, virtualRow.index);
					isSelectable = !!onItemClick;
					isSelected = item.selected;
				} // 2. Fallback to passed skeleton component if fetching
				else if (renderSkeleton) {
					content = renderSkeleton(virtualRow.index);
				} // 3. Absolute fallback
				else {
					content = <ListCardSkeleton />;
				}

				// Key fallback prevents React warnings during unloaded gaps
				const rowKey = key || `loading-${virtualRow.index}`;

				return (
					<Row
						key={rowKey}
						virtualItem={virtualRow}
						virtualizer={virtualizer}
						className='data-list__row'
					>
						<div
							className={`data-list__item ${
								isSelectable && interactive ? 'data-list__item--interactive' : ''
							} ${isSelected ? 'data-list__item--selected' : ''}`}
							onClick={(e) => {
								if (isSelectable && key) {
									onItemClick?.(key, e);
								}
							}}
						>
							{content}
						</div>
					</Row>
				);
			})}
		</>
	);
}
