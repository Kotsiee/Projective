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
