/**
 * @file Wallet.ts
 * @description App-side contracts + pure helpers for the wallet hub. The domain view-models live
 * in `@projective/types` (`WalletContext`, `TransactionLedgerItem`, `EscrowAllocation`,
 * `ForecastingDataPoint`, `PipelinePoint`); this module adds the small app-only shapes (bank
 * cards, the per-persona seed bundle) and the money/FX utilities every wallet surface shares.
 *
 * Money is integer minor units end-to-end. Every seeded figure is denominated in the base
 * currency (GBP); the currency dropdown performs a mock *live* conversion to the display currency
 * through {@link WALLET_FX}, so switching currency (or persona) re-expresses balances, ledger
 * rows and chart values consistently.
 */

import type {
	EscrowAllocation,
	ForecastingDataPoint,
	FxRateTable,
	PipelinePoint,
	TransactionLedgerItem,
	WalletBalanceSummary,
	WalletPersona,
} from '@projective/types';

/** Base currency all seed amounts are denominated in before conversion. */
export const WALLET_BASE_CURRENCY = 'GBP';

/**
 * Mock FX table: units of `code` per 1 GBP. Static + deterministic so SSR and client agree.
 * (Illustrative rates — this is a frontend mock, not a live feed.)
 */
export const WALLET_FX: FxRateTable = {
	GBP: 1,
	USD: 1.27,
	EUR: 1.17,
	AUD: 1.94,
	CAD: 1.73,
	JPY: 194.5,
	CHF: 1.12,
	SGD: 1.71,
	INR: 105.8,
	AED: 4.66,
};

/** ISO codes the wallet currency dropdown offers (a curated subset of the full catalogue). */
export const WALLET_CURRENCIES = Object.keys(WALLET_FX);

/** Convert integer minor units between two currencies via the GBP-based FX table. */
export function convertCents(
	cents: number,
	from: string,
	to: string,
	fx: FxRateTable = WALLET_FX,
): number {
	if (from === to) return cents;
	const rFrom = fx[from] ?? 1;
	const rTo = fx[to] ?? 1;
	const gbp = cents / rFrom;
	return Math.round(gbp * rTo);
}

/**
 * Format integer minor units as a localized currency string. Whole amounts drop the decimals for
 * a denser ledger; fractional amounts keep two. Mirrors `projects/contracts/new/ticketPricing.ts`.
 */
export function formatMoney(cents: number, currency = WALLET_BASE_CURRENCY): string {
	const units = cents / 100;
	const hasFraction = Math.round(units) !== units;
	try {
		return new Intl.NumberFormat('en-GB', {
			style: 'currency',
			currency,
			minimumFractionDigits: hasFraction ? 2 : 0,
			maximumFractionDigits: hasFraction ? 2 : 0,
		}).format(units);
	} catch {
		return `${currency} ${units.toFixed(hasFraction ? 2 : 0)}`;
	}
}

/** Compact currency (e.g. `£12.4k`) for tight metric chips and axes. */
export function formatMoneyCompact(cents: number, currency = WALLET_BASE_CURRENCY): string {
	try {
		return new Intl.NumberFormat('en-GB', {
			style: 'currency',
			currency,
			notation: 'compact',
			maximumFractionDigits: 1,
		}).format(cents / 100);
	} catch {
		return `${currency} ${(cents / 100).toFixed(0)}`;
	}
}

/** A connected bank card / payout destination (frontend mock — no PCI data). */
export interface BankCard {
	id: string;
	brand: 'visa' | 'mastercard' | 'amex';
	last4: string;
	holder: string;
	expiry: string;
	is_default: boolean;
	kind: 'card' | 'bank';
}

/**
 * The per-persona seed bundle: everything one wallet identity owns, denominated in the base
 * currency. The context converts these to the display currency on read.
 */
export interface PersonaWalletSeed {
	balances: WalletBalanceSummary;
	ledger: TransactionLedgerItem[];
	escrow: EscrowAllocation[];
	pipeline: PipelinePoint[];
	forecast: ForecastingDataPoint[];
	cards: BankCard[];
}

/** The full wallet dataset: the selectable personas + each one's data bundle. */
export interface WalletDataset {
	personas: WalletPersona[];
	byPersona: Record<string, PersonaWalletSeed>;
}

// #region Conversion helpers (base → display currency)

export function convertBalances(
	b: WalletBalanceSummary,
	to: string,
	fx: FxRateTable = WALLET_FX,
): WalletBalanceSummary {
	const c = (n: number) => convertCents(n, b.currency, to, fx);
	return {
		available_cents: c(b.available_cents),
		in_escrow_cents: c(b.in_escrow_cents),
		pending_cents: c(b.pending_cents),
		lifetime_cents: c(b.lifetime_cents),
		currency: to,
	};
}

export function convertLedgerItem(
	item: TransactionLedgerItem,
	to: string,
	fx: FxRateTable = WALLET_FX,
): TransactionLedgerItem {
	const c = (n: number) => convertCents(n, item.currency, to, fx);
	return {
		...item,
		gross_cents: c(item.gross_cents),
		fee_cents: c(item.fee_cents),
		net_cents: c(item.net_cents),
		balance_after_cents: c(item.balance_after_cents),
		currency: to,
	};
}

export function convertEscrow(
	e: EscrowAllocation,
	to: string,
	fx: FxRateTable = WALLET_FX,
): EscrowAllocation {
	const c = (n: number) => convertCents(n, e.currency, to, fx);
	return {
		...e,
		amount_cents: c(e.amount_cents),
		platform_fee_cents: c(e.platform_fee_cents),
		currency: to,
	};
}

export function convertForecast(
	p: ForecastingDataPoint,
	to: string,
	from: string = WALLET_BASE_CURRENCY,
	fx: FxRateTable = WALLET_FX,
): ForecastingDataPoint {
	const c = (n: number) => convertCents(n, from, to, fx);
	return {
		t: p.t,
		value_cents: c(p.value_cents),
		lower_cents: c(p.lower_cents),
		upper_cents: c(p.upper_cents),
	};
}

export function convertPipeline(
	p: PipelinePoint,
	to: string,
	from: string = WALLET_BASE_CURRENCY,
	fx: FxRateTable = WALLET_FX,
): PipelinePoint {
	return { ...p, value_cents: convertCents(p.value_cents, from, to, fx) };
}

// #endregion
