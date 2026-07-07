/**
 * @file LedgerTable.tsx
 * @description A bulletproof, data-dense, spreadsheet-style ledger table. Unlike the virtualized
 * `DataDisplay` table (built for arbitrarily long remote datasets), this renders a real semantic
 * `<table>` with `table-layout: fixed` + an explicit `<colgroup>`, so column widths, truncation
 * and header↔body alignment are exact under high density. It ships sticky headers, dark-mode
 * zebra striping, `--hairline` micro-borders, clean horizontal scroll for mobile, and — the point
 * of the finance ledger — segmented row styling that isolates platform-fee lines (the 5% service
 * charge) from raw project payouts via `isFeeLine`.
 */

import '../../styles/components/ledger-table.css';
import type { ComponentChildren } from 'preact';

export interface LedgerColumn<T> {
	id: string;
	header: string;
	/** Explicit column width in px (drives the fixed layout). */
	width?: number;
	align?: 'left' | 'right' | 'center';
	/** Right-align + tabular figures for money/number columns. */
	numeric?: boolean;
	/** Render the cell body — may be text or rich content (badges, pills). */
	render: (row: T) => ComponentChildren;
}

export interface LedgerTableProps<T> {
	columns: LedgerColumn<T>[];
	rows: T[];
	rowKey: (row: T) => string;
	/** Marks the isolated platform-fee (5% service charge) rows for segmented styling. */
	isFeeLine?: (row: T) => boolean;
	onRowClick?: (row: T) => void;
	/** Sticky header. Default true. */
	stickyHeader?: boolean;
	/** Zebra striping keyed on row index. Default true. */
	striped?: boolean;
	/** Tighter row height. */
	dense?: boolean;
	/** When set, the body scrolls vertically inside this height and the header sticks to it. */
	maxHeight?: string;
	caption?: string;
	emptyLabel?: string;
	className?: string;
}

function resolveAlign<T>(col: LedgerColumn<T>): 'left' | 'right' | 'center' {
	return col.align ?? (col.numeric ? 'right' : 'left');
}

export function LedgerTable<T>(props: LedgerTableProps<T>) {
	const {
		columns,
		rows,
		rowKey,
		isFeeLine,
		onRowClick,
		stickyHeader = true,
		striped = true,
		dense = false,
		maxHeight,
		caption,
		emptyLabel = 'No transactions to show',
		className,
	} = props;

	return (
		<div
			class={[
				'ledger-table',
				dense && 'ledger-table--dense',
				className,
			].filter(Boolean).join(' ')}
		>
			<div
				class='ledger-table__scroll'
				style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}
			>
				<table
					class={[
						'ledger-table__table',
						striped && 'ledger-table__table--striped',
						stickyHeader && 'ledger-table__table--sticky',
					].filter(Boolean).join(' ')}
				>
					{caption && <caption class='ledger-table__caption'>{caption}</caption>}

					<colgroup>
						{columns.map((c) => (
							<col key={c.id} style={{ width: c.width ? `${c.width}px` : 'auto' }} />
						))}
					</colgroup>

					<thead class='ledger-table__head'>
						<tr>
							{columns.map((c) => (
								<th
									key={c.id}
									class={`ledger-table__th ledger-table__cell--${resolveAlign(c)}`}
									scope='col'
								>
									{c.header}
								</th>
							))}
						</tr>
					</thead>

					<tbody>
						{rows.length === 0
							? (
								<tr class='ledger-table__empty-row'>
									<td class='ledger-table__empty' colSpan={columns.length}>
										{emptyLabel}
									</td>
								</tr>
							)
							: rows.map((row, i) => {
								const fee = isFeeLine?.(row) ?? false;
								return (
									<tr
										key={rowKey(row)}
										class={[
											'ledger-table__row',
											striped && i % 2 === 1 && 'ledger-table__row--stripe',
											fee && 'ledger-table__row--fee',
											onRowClick && 'ledger-table__row--interactive',
										].filter(Boolean).join(' ')}
										onClick={onRowClick ? () => onRowClick(row) : undefined}
									>
										{columns.map((c) => (
											<td
												key={c.id}
												class={[
													'ledger-table__td',
													`ledger-table__cell--${resolveAlign(c)}`,
													c.numeric && 'ledger-table__cell--num',
												].filter(Boolean).join(' ')}
											>
												{c.render(row)}
											</td>
										))}
									</tr>
								);
							})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
