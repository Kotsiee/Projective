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
