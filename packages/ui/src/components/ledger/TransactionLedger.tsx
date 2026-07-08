/**
 * @file TransactionLedger.tsx
 * @description The high-fidelity transaction ledger widget: a search + status-filter toolbar over
 * the dense `@projective/data` LedgerTable, with tone-mapped `StatusBadge` pills and an expandable
 * per-row detail panel (gross / fee / net / counterparty / reference breakdown). Filtering is
 * entirely client-side and instant — it derives a filtered view of the passed rows via local state,
 * so parents just hand it the full ledger and a currency `format` fn. Re-themes for light/dark
 * because every surface is a palette token.
 */

import '../../styles/components/transaction-ledger.css';
import { useMemo, useState } from 'preact/hooks';
import { IconSearch } from '@tabler/icons-preact';
import { type LedgerColumn, LedgerTable } from '@projective/data';
import type { LedgerEntryKind, LedgerEntryStatus, TransactionLedgerItem } from '@projective/types';
import { StatusBadge } from '../badge/StatusBadge.tsx';
import type { BadgeTone } from '../../types/components/badge.ts';
import type { TransactionLedgerProps } from '../../types/components/transaction-ledger.ts';

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

const STATUS_TONE: Record<LedgerEntryStatus, BadgeTone> = {
	settled: 'success',
	pending: 'warning',
	processing: 'info',
	failed: 'danger',
	held: 'amber',
};

const DATE_FMT = new Intl.DateTimeFormat('en-GB', {
	day: '2-digit',
	month: 'short',
	year: '2-digit',
	timeZone: 'UTC',
});
const DATETIME_FMT = new Intl.DateTimeFormat('en-GB', {
	day: '2-digit',
	month: 'short',
	year: 'numeric',
	hour: '2-digit',
	minute: '2-digit',
	timeZone: 'UTC',
});

function fmtDate(iso: string): string {
	const d = new Date(iso);
	return isNaN(d.getTime()) ? iso : DATE_FMT.format(d);
}
function fmtDateTime(iso: string): string {
	const d = new Date(iso);
	return isNaN(d.getTime()) ? iso : DATETIME_FMT.format(d);
}

export function TransactionLedger(props: TransactionLedgerProps) {
	const {
		rows,
		format,
		title,
		showBalance = true,
		dense,
		maxHeight,
		hideToolbar = false,
		emptyLabel = 'No transactions to show',
		className,
	} = props;

	const [query, setQuery] = useState('');
	const [status, setStatus] = useState<LedgerEntryStatus | 'all'>('all');

	// Only offer status chips that actually occur in the data.
	const statuses = useMemo(() => {
		const seen = new Set<LedgerEntryStatus>();
		for (const r of rows) seen.add(r.status);
		return [...seen];
	}, [rows]);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return rows.filter((r) => {
			if (status !== 'all' && r.status !== status) return false;
			if (!q) return true;
			return (
				r.description.toLowerCase().includes(q) ||
				r.counterparty.toLowerCase().includes(q) ||
				r.reference.toLowerCase().includes(q) ||
				(r.project_label?.toLowerCase().includes(q) ?? false)
			);
		});
	}, [rows, query, status]);

	const columns = useMemo(() => {
		const cols: LedgerColumn<TransactionLedgerItem>[] = [
			{ id: 'date', header: 'Date', width: 92, render: (r) => fmtDate(r.date) },
			{
				id: 'kind',
				header: 'Type',
				width: 104,
				render: (r) => (
					<span class={`txledger__kind txledger__kind--${r.kind}`}>{KIND_LABEL[r.kind]}</span>
				),
			},
			{ id: 'description', header: 'Description', width: 240, render: (r) => r.description },
			{ id: 'counterparty', header: 'Counterparty', width: 160, render: (r) => r.counterparty },
			{
				id: 'net',
				header: 'Net',
				width: 128,
				numeric: true,
				render: (r) => {
					const sign = r.net_cents >= 0 ? '+' : '−';
					const tone = r.net_cents >= 0 ? 'pos' : 'neg';
					return (
						<span class={`txledger__amt txledger__amt--${tone}`}>
							{sign}
							{format(Math.abs(r.net_cents))}
						</span>
					);
				},
			},
		];

		if (showBalance) {
			cols.push({
				id: 'balance',
				header: 'Balance',
				width: 128,
				numeric: true,
				render: (r) => format(r.balance_after_cents),
			});
		}

		cols.push({
			id: 'status',
			header: 'Status',
			width: 118,
			render: (r) => (
				<StatusBadge tone={STATUS_TONE[r.status]} size='sm' dot>
					{STATUS_LABEL[r.status]}
				</StatusBadge>
			),
		});

		return cols;
	}, [format, showBalance]);

	const renderDetail = (r: TransactionLedgerItem) => (
		<div class='txledger__detail'>
			<dl class='txledger__detail-grid'>
				<div class='txledger__detail-item'>
					<dt>Posted</dt>
					<dd>{fmtDateTime(r.date)}</dd>
				</div>
				<div class='txledger__detail-item'>
					<dt>Reference</dt>
					<dd class='txledger__mono'>{r.reference || '—'}</dd>
				</div>
				<div class='txledger__detail-item'>
					<dt>Project</dt>
					<dd>{r.project_label ?? '—'}</dd>
				</div>
				<div class='txledger__detail-item'>
					<dt>Direction</dt>
					<dd class='txledger__cap'>{r.direction}</dd>
				</div>
				<div class='txledger__detail-item'>
					<dt>Gross</dt>
					<dd>{format(r.gross_cents)}</dd>
				</div>
				<div class='txledger__detail-item'>
					<dt>Platform fee</dt>
					<dd>{r.fee_cents > 0 ? format(r.fee_cents) : '—'}</dd>
				</div>
				<div class='txledger__detail-item'>
					<dt>Net movement</dt>
					<dd class={r.net_cents >= 0 ? 'txledger__amt--pos' : 'txledger__amt--neg'}>
						{r.net_cents >= 0 ? '+' : '−'}
						{format(Math.abs(r.net_cents))}
					</dd>
				</div>
				<div class='txledger__detail-item'>
					<dt>Balance after</dt>
					<dd>{format(r.balance_after_cents)}</dd>
				</div>
			</dl>
		</div>
	);

	return (
		<div class={['txledger', className].filter(Boolean).join(' ')}>
			{!hideToolbar && (
				<div class='txledger__toolbar'>
					{title && <h3 class='txledger__title'>{title}</h3>}
					<div class='txledger__controls'>
						<label class='txledger__search'>
							<IconSearch size={15} stroke={2} />
							<input
								type='search'
								class='txledger__search-input'
								placeholder='Search transactions…'
								value={query}
								onInput={(e) => setQuery((e.currentTarget as HTMLInputElement).value)}
							/>
						</label>
						<div class='txledger__chips' role='group' aria-label='Filter by status'>
							<button
								type='button'
								class={`txledger__chip${status === 'all' ? ' txledger__chip--active' : ''}`}
								onClick={() => setStatus('all')}
							>
								All
							</button>
							{statuses.map((s) => (
								<button
									key={s}
									type='button'
									class={`txledger__chip${status === s ? ' txledger__chip--active' : ''}`}
									onClick={() => setStatus(s)}
								>
									{STATUS_LABEL[s]}
								</button>
							))}
						</div>
					</div>
				</div>
			)}

			<LedgerTable
				columns={columns}
				rows={filtered}
				rowKey={(r) => r.id}
				isFeeLine={(r) => r.is_fee_line}
				expandedContent={renderDetail}
				dense={dense}
				maxHeight={maxHeight}
				emptyLabel={query || status !== 'all' ? 'No transactions match your filters' : emptyLabel}
			/>
		</div>
	);
}
