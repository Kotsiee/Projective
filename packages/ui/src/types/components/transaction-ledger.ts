import type { TransactionLedgerItem } from '@projective/types';

export interface TransactionLedgerProps {
	rows: TransactionLedgerItem[];
	/** Currency formatter supplied by the app (keeps FX/locale concerns out of the widget). */
	format: (cents: number) => string;
	/** Toolbar heading. */
	title?: string;
	/** Show the running-balance column. Default true. */
	showBalance?: boolean;
	dense?: boolean;
	/** Vertical scroll height for the table body (sticky header). */
	maxHeight?: string;
	/** Hide the search + status filter toolbar (render the bare table). */
	hideToolbar?: boolean;
	emptyLabel?: string;
	className?: string;
}
