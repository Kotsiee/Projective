/**
 * @file CurrencySelector.tsx
 * @description The global currency dropdown. A thin wrapper over `@projective/fields` `SelectField`
 * whose options are the FX-backed currencies (only codes we can convert), labelled from the shared
 * `currencyCategories` catalogue. Bound straight to the wallet context's `currency` signal — so
 * changing it triggers the mock live conversion across the whole hub.
 */

import { currencyCategories } from '@projective/types';
import { SelectField, type SelectOption } from '@projective/fields';
import { WALLET_CURRENCIES } from '../contracts/Wallet.ts';
import { useWalletContext } from '../contexts/WalletContext.tsx';

/** Flatten the catalogue → code lookup once at module load. */
const META = new Map<string, { name: string; symbol: string }>();
for (const defs of Object.values(currencyCategories)) {
	for (const d of defs) META.set(d.code, { name: d.name, symbol: d.symbol });
}

const CURRENCY_OPTIONS: SelectOption<string>[] = WALLET_CURRENCIES.map((code) => {
	const m = META.get(code);
	return {
		label: m ? `${code} · ${m.name}` : code,
		value: code,
	};
});

export interface CurrencySelectorProps {
	compact?: boolean;
	label?: string;
}

export function CurrencySelector(
	{ compact = false, label = 'Display currency' }: CurrencySelectorProps,
) {
	const { currency, setCurrency } = useWalletContext();

	return (
		<div class={`wallet-currency${compact ? ' wallet-currency--compact' : ''}`}>
			<SelectField
				name='wallet-currency'
				label={label}
				floating={false}
				searchable
				options={CURRENCY_OPTIONS}
				value={currency.value}
				onChange={(v) => setCurrency(v as string)}
			/>
		</div>
	);
}
