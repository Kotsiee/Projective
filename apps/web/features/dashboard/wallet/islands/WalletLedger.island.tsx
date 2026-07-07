/**
 * @file WalletLedger.island.tsx
 * @description The dedicated full-page In-Depth Transactions Ledger (`/wallet/ledger`). Renders the
 * dense `LedgerTable` (sticky header, zebra striping, isolated 5% fee lines, running balance) with
 * client-side search + kind/status filters and a totals strip. Persona/currency come from the
 * shared shell context.
 */

import '../styles/wallet-ledger.css';
import { computed, useSignal } from '@preact/signals';
import { IconSearch } from '@tabler/icons-preact';
import { TextField } from '@projective/fields';
import type { LedgerEntryKind, LedgerEntryStatus } from '@projective/types';
import { useWalletContext } from '../contexts/WalletContext.tsx';
import { LedgerView } from '../components/LedgerView.tsx';

const KIND_FILTERS: { key: LedgerEntryKind | 'all'; label: string }[] = [
	{ key: 'all', label: 'All' },
	{ key: 'payout', label: 'Payouts' },
	{ key: 'platform_fee', label: 'Fees' },
	{ key: 'withdrawal', label: 'Withdrawals' },
	{ key: 'bonus', label: 'Bonuses' },
	{ key: 'refund', label: 'Refunds' },
];

const STATUS_FILTERS: { key: LedgerEntryStatus | 'all'; label: string }[] = [
	{ key: 'all', label: 'Any status' },
	{ key: 'settled', label: 'Settled' },
	{ key: 'pending', label: 'Pending' },
	{ key: 'processing', label: 'Processing' },
];

export default function WalletLedgerIsland() {
	const { ledger, format } = useWalletContext();

	const search = useSignal('');
	const kind = useSignal<LedgerEntryKind | 'all'>('all');
	const status = useSignal<LedgerEntryStatus | 'all'>('all');

	const filtered = computed(() => {
		const q = search.value.trim().toLowerCase();
		return ledger.value.filter((r) => {
			if (kind.value !== 'all' && r.kind !== kind.value) return false;
			if (status.value !== 'all' && r.status !== status.value) return false;
			if (q) {
				const hay = `${r.description} ${r.counterparty} ${r.reference} ${r.project_label ?? ''}`
					.toLowerCase();
				if (!hay.includes(q)) return false;
			}
			return true;
		});
	});

	const totals = computed(() => {
		let credit = 0, fees = 0, debit = 0;
		for (const r of filtered.value) {
			if (r.is_fee_line) fees += r.fee_cents;
			else if (r.net_cents >= 0) credit += r.net_cents;
			else debit += -r.net_cents;
		}
		return { credit, fees, debit, net: credit - debit - fees };
	});

	return (
		<div class='wallet-ledger-page'>
			<header class='wallet-ledger-page__header'>
				<div>
					<h1 class='wallet-ledger-page__title'>Transactions Ledger</h1>
					<p class='wallet-ledger-page__subtitle'>
						{filtered.value.length} of {ledger.value.length} movements
					</p>
				</div>
			</header>

			<div class='wallet-ledger-page__totals'>
				<div class='wallet-ledger-page__total'>
					<span>Inflows</span>
					<strong class='wallet-ledger-amt--pos'>{format(totals.value.credit)}</strong>
				</div>
				<div class='wallet-ledger-page__total'>
					<span>Platform fees</span>
					<strong>{format(totals.value.fees)}</strong>
				</div>
				<div class='wallet-ledger-page__total'>
					<span>Outflows</span>
					<strong class='wallet-ledger-amt--neg'>{format(totals.value.debit)}</strong>
				</div>
				<div class='wallet-ledger-page__total wallet-ledger-page__total--net'>
					<span>Net</span>
					<strong>{format(totals.value.net)}</strong>
				</div>
			</div>

			<div class='wallet-ledger-page__toolbar'>
				<div class='wallet-ledger-page__search'>
					<TextField
						name='ledger-search'
						placeholder='Search description, counterparty, reference…'
						floating={false}
						value={search}
						onInput={(
							e: InputEvent,
						) => (search.value = (e.currentTarget as HTMLInputElement).value)}
						prefix={<IconSearch size={16} style={{ color: 'var(--text-muted)' }} />}
					/>
				</div>

				<div class='wallet-ledger-page__filters'>
					{KIND_FILTERS.map((k) => (
						<button
							type='button'
							key={k.key}
							class={`wallet-filter-chip${kind.value === k.key ? ' wallet-filter-chip--on' : ''}`}
							onClick={() => (kind.value = k.key)}
						>
							{k.label}
						</button>
					))}
				</div>

				<div class='wallet-ledger-page__filters'>
					{STATUS_FILTERS.map((s) => (
						<button
							type='button'
							key={s.key}
							class={`wallet-filter-chip${status.value === s.key ? ' wallet-filter-chip--on' : ''}`}
							onClick={() => (status.value = s.key)}
						>
							{s.label}
						</button>
					))}
				</div>
			</div>

			<LedgerView
				rows={filtered.value}
				showBalance
				maxHeight='calc(100vh - 340px)'
				emptyLabel='No transactions match these filters'
			/>
		</div>
	);
}
