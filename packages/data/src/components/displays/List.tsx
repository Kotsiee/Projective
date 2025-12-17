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
