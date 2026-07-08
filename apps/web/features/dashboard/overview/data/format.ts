/**
 * @file format.ts
 * @description Small currency + date formatters for the admin dashboard. Amounts are integer minor
 * units (`*_cents`) end-to-end; dates are UTC-pinned so SSR and client hydration agree.
 */

/** Format minor units in `currency` (e.g. 2500000 → "£25,000.00"). */
export function formatMoney(cents: number, currency: string): string {
	try {
		return new Intl.NumberFormat('en-GB', {
			style: 'currency',
			currency,
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(cents / 100);
	} catch {
		return `${currency} ${(cents / 100).toFixed(2)}`;
	}
}

/** Compact money for dense chips (e.g. 2500000 → "£25K"). */
export function formatMoneyCompact(cents: number, currency: string): string {
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
