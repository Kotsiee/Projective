/**
 * @file LedgerView.tsx
 * @description The standard finance columns for the dense `LedgerTable`, shared by the overview's
 * recent-activity preview and the full ledger page. Isolates the 5% platform-fee lines via
 * `is_fee_line`. Dates are formatted in UTC so SSR and client agree (the seed timestamps are Zulu).
 */

import { type LedgerColumn, LedgerTable } from '@projective/data';
import type { LedgerEntryKind, LedgerEntryStatus, TransactionLedgerItem } from '@projective/types';
import { useWalletContext } from '../contexts/WalletContext.tsx';

const KIND_LABEL: Record<LedgerEntryKind, string> = {
	payout: 'Payout',
	platform_fee: 'Fee',
	withdrawal: 'Withdrawal',
	topup: 'Top-up',
	refund: 'Refund',
	bonus: 'Bonus',
	escrow_hold: 'Escrow',
};

const STATUS_LABEL: Record<LedgerEntryStatus, string> = {
	settled: 'Settled',
	pending: 'Pending',
	processing: 'Processing',
	failed: 'Failed',
	held: 'Held',
};

const DATE_FMT = new Intl.DateTimeFormat('en-GB', {
	day: '2-digit',
	month: 'short',
	year: '2-digit',
	timeZone: 'UTC',
});

function fmtDate(iso: string): string {
	const d = new Date(iso);
	return isNaN(d.getTime()) ? iso : DATE_FMT.format(d);
}

export interface LedgerViewProps {
	rows: TransactionLedgerItem[];
	maxHeight?: string;
	dense?: boolean;
	/** Show the running-balance column (full ledger page). */
	showBalance?: boolean;
	emptyLabel?: string;
}

export function LedgerView(
	{ rows, maxHeight, dense, showBalance = true, emptyLabel }: LedgerViewProps,
) {
	const { format } = useWalletContext();

	const columns: LedgerColumn<TransactionLedgerItem>[] = [
		{
			id: 'date',
			header: 'Date',
			width: 92,
			render: (r) => fmtDate(r.date),
		},
		{
			id: 'kind',
			header: 'Type',
			width: 108,
			render: (r) => (
				<span class={`wallet-ledger-kind wallet-ledger-kind--${r.kind}`}>{KIND_LABEL[r.kind]}</span>
			),
		},
		{
			id: 'description',
			header: 'Description',
			width: 240,
			render: (r) => r.description,
		},
		{
			id: 'counterparty',
			header: 'Counterparty',
			width: 160,
			render: (r) => r.counterparty,
		},
		{
			id: 'reference',
			header: 'Reference',
			width: 120,
			render: (r) => <span class='wallet-ledger-ref'>{r.reference}</span>,
		},
		{
			id: 'net',
			header: 'Net',
			width: 128,
			numeric: true,
			render: (r) => {
				const sign = r.net_cents >= 0 ? '+' : '−';
				const tone = r.net_cents >= 0 ? 'pos' : 'neg';
				return (
					<span class={`wallet-ledger-amt wallet-ledger-amt--${tone}`}>
						{sign}
						{format(Math.abs(r.net_cents))}
					</span>
				);
			},
		},
		{
			id: 'fee',
			header: 'Fee',
			width: 92,
			numeric: true,
			render: (r) => (r.fee_cents > 0 ? format(r.fee_cents) : '—'),
		},
	];

	if (showBalance) {
		columns.push({
			id: 'balance',
			header: 'Balance',
			width: 128,
			numeric: true,
			render: (r) => format(r.balance_after_cents),
		});
	}

	columns.push({
		id: 'status',
		header: 'Status',
		width: 110,
		render: (r) => (
			<span class={`wallet-ledger-status wallet-ledger-status--${r.status}`}>
				{STATUS_LABEL[r.status]}
			</span>
		),
	});

	return (
		<LedgerTable
			columns={columns}
			rows={rows}
			rowKey={(r) => r.id}
			isFeeLine={(r) => r.is_fee_line}
			dense={dense}
			maxHeight={maxHeight}
			emptyLabel={emptyLabel}
		/>
	);
}
