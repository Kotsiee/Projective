import { VNode } from 'preact';

export interface LedgerCell {
	label: string;
	value: string | number | VNode; // VNode allows passing a badge/meter from the caller
	tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
	emphasis?: boolean; // bold/primary value
}

export interface LedgerRow {
	id: string;
	title?: string; // e.g. milestone/stage name
	subtitle?: string;
	cells: LedgerCell[]; // Budget / Entry ticket / Escrow / Seats ...
	status?: string; // optional status text badge on the row
	onClick?: () => void;
}

export interface LedgerCardProps {
	title?: string;
	rows: LedgerRow[];
	dense?: boolean;
	className?: string;
}
