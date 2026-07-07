/**
 * @file BalanceSummary.tsx
 * @description The hero balance cards on the overview — Available / In escrow / Pending / Lifetime,
 * all in the display currency. The Available card is the primary CTA surface (withdraw). Values
 * come from the FX-converted `wallet` computed, so they track persona + currency changes.
 */

import { useWalletContext } from '../contexts/WalletContext.tsx';
import { IconClockDollar, IconLock, IconTrendingUp, IconWallet } from '@tabler/icons-preact';

export function BalanceSummary() {
	const { wallet, format } = useWalletContext();
	const b = wallet.value.balances;

	const cards = [
		{
			key: 'available',
			label: 'Available to withdraw',
			value: b.available_cents,
			icon: IconWallet,
			primary: true,
		},
		{
			key: 'escrow',
			label: 'Held in escrow',
			value: b.in_escrow_cents,
			icon: IconLock,
			primary: false,
		},
		{
			key: 'pending',
			label: 'Pending clearance',
			value: b.pending_cents,
			icon: IconClockDollar,
			primary: false,
		},
		{
			key: 'lifetime',
			label: 'Lifetime earnings',
			value: b.lifetime_cents,
			icon: IconTrendingUp,
			primary: false,
		},
	];

	return (
		<div class='wallet-balances'>
			{cards.map((c) => (
				<div
					key={c.key}
					class={`wallet-balances__card${c.primary ? ' wallet-balances__card--primary' : ''}`}
				>
					<div class='wallet-balances__icon'>
						<c.icon size={18} stroke={2} />
					</div>
					<span class='wallet-balances__label'>{c.label}</span>
					<span class='wallet-balances__value'>{format(c.value)}</span>
					{c.primary && <a class='wallet-balances__cta' href='/wallet/transfer'>Withdraw</a>}
				</div>
			))}
		</div>
	);
}
