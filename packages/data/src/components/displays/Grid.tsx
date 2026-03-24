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
	gap?: number;
	onItemClick?: (key: string, e: MouseEvent) => void;
}

export function Grid<T>({
	dataset,
	virtualItems,
	virtualizer,
	renderItem,
	columnCount,
	gap = 16,
	onItemClick,
}: GridProps<T>) {
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
						<div
							style={{
								// Native CSS Grid replaces the manual percentage math
								display: 'grid',
								gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
								gap: `${gap}px`,
								width: '100%',
								height: '100%',
								// Applies vertical spacing that the virtualizer naturally measures
								paddingBottom: `${gap}px`,
							}}
						>
							{rowItems.map((item, colIndex) => (
								<div
									key={item.key}
									className='data-grid__cell'
									style={{ minWidth: 0 }} // Prevents blowout from large inner content
								>
									<div
										className={`data-grid__card ${
											onItemClick ? 'data-grid__card--interactive' : ''
										} ${item.selected ? 'data-grid__card--selected' : ''}`}
										onClick={(e) => onItemClick?.(item.key, e)}
										style={{ height: '100%' }}
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
