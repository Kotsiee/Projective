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
