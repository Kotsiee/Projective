/**
 * @file WalletPersonaRail.tsx
 * @description The wallet's persistent side rail — the Persona Context Selector, the global
 * currency dropdown, quick balance metrics and sub-navigation to the four wallet pages. It is
 * tunnelled into the navigation's middle-nav side slot by `WalletShell` (so it lives in the global
 * chrome, not the page body). Reads everything from `WalletContext`.
 */

import { useWalletContext } from '../contexts/WalletContext.tsx';
import { CurrencySelector } from './CurrencySelector.tsx';
import {
	IconArrowsExchange,
	IconBuildingStore,
	IconChevronLeft,
	IconReceipt2,
	IconSettings,
	IconUsers,
	IconWallet,
} from '@tabler/icons-preact';
import type { PersonaKind } from '@projective/types';

const KIND_ICON: Record<PersonaKind, typeof IconWallet> = {
	freelancer: IconWallet,
	business: IconBuildingStore,
	team: IconUsers,
};

const NAV = [
	{ href: '/wallet', label: 'Overview', icon: IconWallet, exact: true },
	{ href: '/wallet/ledger', label: 'Ledger', icon: IconReceipt2, exact: false },
	{ href: '/wallet/transfer', label: 'Transfer', icon: IconArrowsExchange, exact: false },
	{ href: '/wallet/settings', label: 'Settings', icon: IconSettings, exact: false },
];

function initials(name: string): string {
	return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export function WalletPersonaRail() {
	const { personas, activePersona, switchPersona, wallet, format } = useWalletContext();
	const path = typeof globalThis !== 'undefined' && globalThis.location
		? globalThis.location.pathname
		: '/wallet';

	const balances = wallet.value.balances;

	return (
		<nav class='wallet-rail' aria-label='Wallet navigation'>
			<a class='wallet-rail__back' href='/dashboard'>
				<IconChevronLeft size={16} stroke={2} />
				<span>Dashboard</span>
			</a>

			<div class='wallet-rail__section'>
				<span class='wallet-rail__section-title'>Wallet persona</span>
				<div class='wallet-rail__personas'>
					{personas.map((p) => {
						const Icon = KIND_ICON[p.kind];
						const active = p.id === activePersona.value.id;
						return (
							<button
								type='button'
								key={p.id}
								class={`wallet-rail__persona wallet-rail__persona--${p.accent}${
									active ? ' wallet-rail__persona--active' : ''
								}`}
								onClick={() => switchPersona(p.id)}
								aria-pressed={active}
							>
								<span class='wallet-rail__persona-avatar'>{initials(p.displayName)}</span>
								<span class='wallet-rail__persona-meta'>
									<span class='wallet-rail__persona-name'>{p.displayName}</span>
									<span class='wallet-rail__persona-kind'>
										<Icon size={12} stroke={2} /> {p.kind} · {p.currency}
									</span>
								</span>
							</button>
						);
					})}
				</div>
			</div>

			<div class='wallet-rail__section'>
				<CurrencySelector />
			</div>

			<div class='wallet-rail__section wallet-rail__metrics'>
				<div class='wallet-rail__metric'>
					<span class='wallet-rail__metric-label'>Available</span>
					<span class='wallet-rail__metric-value'>{format(balances.available_cents)}</span>
				</div>
				<div class='wallet-rail__metric'>
					<span class='wallet-rail__metric-label'>In escrow</span>
					<span class='wallet-rail__metric-value wallet-rail__metric-value--muted'>
						{format(balances.in_escrow_cents)}
					</span>
				</div>
			</div>

			<div class='wallet-rail__section'>
				<span class='wallet-rail__section-title'>Pages</span>
				<ul class='wallet-rail__nav'>
					{NAV.map((n) => {
						const active = n.exact ? path === n.href : path.startsWith(n.href);
						return (
							<li key={n.href}>
								<a
									class={`wallet-rail__link${active ? ' wallet-rail__link--active' : ''}`}
									href={n.href}
									aria-current={active ? 'page' : undefined}
								>
									<n.icon size={18} stroke={2} />
									<span>{n.label}</span>
								</a>
							</li>
						);
					})}
				</ul>
			</div>
		</nav>
	);
}
