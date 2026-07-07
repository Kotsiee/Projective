/**
 * @file WalletTransfer.island.tsx
 * @description The high-security transfer page (`/wallet/transfer`) — tabbed payouts, withdrawals
 * and top-up settings. The Withdraw tab hosts the `WithdrawalForm` with the enforced £5 minimum;
 * Top-up and Payout scheduling are functional mock surfaces.
 */

import '../styles/wallet-transfer.css';
import { useSignal } from '@preact/signals';
import { MoneyField, SelectField, type SelectOption } from '@projective/fields';
import { IconArrowsExchange, IconBuildingBank, IconCoin } from '@tabler/icons-preact';
import { useWalletContext } from '../contexts/WalletContext.tsx';
import { WithdrawalForm } from '../components/WithdrawalForm.tsx';

type Tab = 'withdraw' | 'topup' | 'payouts';

const TABS: { key: Tab; label: string; icon: typeof IconCoin }[] = [
	{ key: 'withdraw', label: 'Withdraw', icon: IconBuildingBank },
	{ key: 'topup', label: 'Top up', icon: IconCoin },
	{ key: 'payouts', label: 'Payout schedule', icon: IconArrowsExchange },
];

function TopUpForm() {
	const { currency, cards, format } = useWalletContext();
	const amount = useSignal<number>(0);
	const source = useSignal(cards.value[0]?.id ?? '');
	const done = useSignal(false);

	const options: SelectOption<string>[] = cards.value.map((c) => ({
		label: `${c.brand.toUpperCase()} ••${c.last4}`,
		value: c.id,
	}));

	return (
		<form
			class='wallet-transfer__form'
			onSubmit={(e) => {
				e.preventDefault();
				if (amount.value && amount.value > 0) done.value = true;
			}}
		>
			<MoneyField
				label='Amount to add'
				floating={false}
				currency={currency.value}
				value={amount}
				onChange={(v) => {
					amount.value = v;
					done.value = false;
				}}
			/>
			<SelectField
				name='topup-source'
				label='Funding source'
				floating={false}
				options={options}
				value={source.value}
				onChange={(v) => (source.value = v as string)}
			/>
			<button type='submit' class='wallet-transfer__submit' disabled={!amount.value}>
				Add {amount.value ? format(Math.round(amount.value * 100)) : 'funds'}
			</button>
			{done.value && (
				<p class='wallet-transfer__note wallet-transfer__note--ok'>
					Top-up of {format(Math.round((amount.value ?? 0) * 100))} queued.
				</p>
			)}
		</form>
	);
}

function PayoutSchedule() {
	const schedule = useSignal<'instant' | 'weekly' | 'monthly'>('weekly');
	const options = [
		{ key: 'instant', label: 'Instant', note: 'Paid out as soon as funds clear (1% fee).' },
		{ key: 'weekly', label: 'Weekly', note: 'Automatic payout every Monday.' },
		{ key: 'monthly', label: 'Monthly', note: 'Consolidated payout on the 1st.' },
	] as const;

	return (
		<div class='wallet-transfer__schedule'>
			{options.map((o) => (
				<label
					key={o.key}
					class={`wallet-transfer__radio${
						schedule.value === o.key ? ' wallet-transfer__radio--on' : ''
					}`}
				>
					<input
						type='radio'
						name='payout-schedule'
						checked={schedule.value === o.key}
						onChange={() => (schedule.value = o.key)}
					/>
					<span class='wallet-transfer__radio-body'>
						<span class='wallet-transfer__radio-label'>{o.label}</span>
						<span class='wallet-transfer__radio-note'>{o.note}</span>
					</span>
				</label>
			))}
		</div>
	);
}

export default function WalletTransferIsland() {
	const tab = useSignal<Tab>('withdraw');

	return (
		<div class='wallet-transfer'>
			<header class='wallet-transfer__header'>
				<h1 class='wallet-transfer__title'>Transfer</h1>
				<p class='wallet-transfer__subtitle'>Move funds in and out of your wallet.</p>
			</header>

			<div class='wallet-transfer__tabs' role='tablist'>
				{TABS.map((t) => (
					<button
						type='button'
						key={t.key}
						role='tab'
						aria-selected={tab.value === t.key}
						class={`wallet-transfer__tab${tab.value === t.key ? ' wallet-transfer__tab--on' : ''}`}
						onClick={() => (tab.value = t.key)}
					>
						<t.icon size={16} stroke={2} /> {t.label}
					</button>
				))}
			</div>

			<div class='wallet-transfer__panel'>
				{tab.value === 'withdraw' && <WithdrawalForm />}
				{tab.value === 'topup' && <TopUpForm />}
				{tab.value === 'payouts' && <PayoutSchedule />}
			</div>
		</div>
	);
}
