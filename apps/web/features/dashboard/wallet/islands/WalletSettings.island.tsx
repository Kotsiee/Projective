/**
 * @file WalletSettings.island.tsx
 * @description Wallet settings (`/wallet/settings`) — connected payout destinations (bank cards)
 * plus wallet preferences (default currency, low-balance alerts). Functional frontend mock.
 */

import '../styles/wallet-settings.css';
import { useSignal } from '@preact/signals';
import { SelectField, type SelectOption } from '@projective/fields';
import { WALLET_CURRENCIES } from '../contracts/Wallet.ts';
import { useWalletContext } from '../contexts/WalletContext.tsx';
import { BankCardList } from '../components/BankCardList.tsx';

const CURRENCY_OPTIONS: SelectOption<string>[] = WALLET_CURRENCIES.map((c) => ({
	label: c,
	value: c,
}));

export default function WalletSettingsIsland() {
	const { currency, setCurrency, activePersona } = useWalletContext();
	const alerts = useSignal(true);
	const twoFa = useSignal(true);

	return (
		<div class='wallet-settings'>
			<header class='wallet-settings__header'>
				<h1 class='wallet-settings__title'>Wallet Settings</h1>
				<p class='wallet-settings__subtitle'>
					Managing the {activePersona.value.displayName} wallet.
				</p>
			</header>

			<div class='wallet-settings__grid'>
				<BankCardList />

				<section class='wallet-settings__prefs'>
					<h3 class='wallet-settings__prefs-title'>Preferences</h3>

					<div class='wallet-settings__field'>
						<SelectField
							name='default-currency'
							label='Default display currency'
							floating={false}
							options={CURRENCY_OPTIONS}
							value={currency.value}
							onChange={(v) => setCurrency(v as string)}
						/>
					</div>

					<label class='wallet-settings__toggle'>
						<input
							type='checkbox'
							checked={alerts.value}
							onChange={(e) => (alerts.value = (e.currentTarget as HTMLInputElement).checked)}
						/>
						<span>
							<strong>Low-balance alerts</strong>
							<em>Email me when available balance drops below the withdrawal minimum.</em>
						</span>
					</label>

					<label class='wallet-settings__toggle'>
						<input
							type='checkbox'
							checked={twoFa.value}
							onChange={(e) => (twoFa.value = (e.currentTarget as HTMLInputElement).checked)}
						/>
						<span>
							<strong>Require 2FA for withdrawals</strong>
							<em>Ask for a verification code before any payout leaves the wallet.</em>
						</span>
					</label>
				</section>
			</div>
		</div>
	);
}
