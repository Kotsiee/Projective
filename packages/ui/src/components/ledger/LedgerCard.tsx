import '../../styles/components/ledger.css';
import type { LedgerCardProps, LedgerRow } from '../../types/components/ledger.ts';

/** Renders a single stacked row of labeled metadata cells; focusable button when interactive. */
function LedgerRowView({ row, dense }: { row: LedgerRow; dense?: boolean }) {
	const interactive = typeof row.onClick === 'function';

	const body = (
		<>
			{(row.title || row.subtitle || row.status) && (
				<div class='ledger-row__head'>
					<div class='ledger-row__heading'>
						{row.title && <span class='ledger-row__title'>{row.title}</span>}
						{row.subtitle && <span class='ledger-row__subtitle'>{row.subtitle}</span>}
					</div>
					{row.status && <span class='ledger-row__status'>{row.status}</span>}
				</div>
			)}

			<div class='ledger-row__cells'>
				{row.cells.map((cell, index) => (
					<div
						class={`ledger-cell ledger-cell--${cell.tone ?? 'default'}${
							cell.emphasis ? ' ledger-cell--emphasis' : ''
						}`}
						key={`${cell.label}-${index}`}
					>
						<span class='ledger-cell__label'>{cell.label}</span>
						<span class='ledger-cell__value'>{cell.value}</span>
					</div>
				))}
			</div>
		</>
	);

	if (interactive) {
		return (
			<button
				type='button'
				class={`ledger-row ledger-row--interactive${dense ? ' ledger-row--dense' : ''}`}
				onClick={row.onClick}
			>
				{body}
			</button>
		);
	}

	return (
		<div class={`ledger-row${dense ? ' ledger-row--dense' : ''}`}>
			{body}
		</div>
	);
}

/**
 * A stacked card rendering multi-cell financial & milestone metadata rows in a unified
 * format (Budget / Entry ticket / Escrow / Seats ...). Reuses the card visual language and
 * supports stacking multiple rows divided by thin borders.
 */
export function LedgerCard({ title, rows, dense, className }: LedgerCardProps) {
	return (
		<div
			class={`ledger-card${dense ? ' ledger-card--dense' : ''}${className ? ` ${className}` : ''}`}
		>
			{title && (
				<div class='ledger-card__header'>
					<h3 class='ledger-card__title'>{title}</h3>
				</div>
			)}

			<div class='ledger-card__rows'>
				{rows.map((row) => <LedgerRowView key={row.id} row={row} dense={dense} />)}
			</div>
		</div>
	);
}
