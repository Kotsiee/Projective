import { useMemo } from 'preact/hooks';

/**
 * @file useMinAmountValidation.ts
 * @description A tiny, reusable client-side validator factory for money inputs. It enforces a
 * structural minimum (e.g. the £5 withdrawal floor) instantaneously on `onChange`/`onBlur` by
 * mapping a {@link MoneyField} value (major units) to an error string, or `undefined` when valid.
 * Kept generic — the domain (withdrawals) lives in the app; the package only owns the threshold
 * rule so any money field can opt into a minimum.
 */

export interface MinAmountValidationOptions {
	/** Minimum allowed amount in integer minor units (e.g. 500 for £5.00). */
	min_cents: number;
	/** ISO-4217 code used only to format the error message. Default `GBP`. */
	currency?: string;
	locale?: string;
	/** Override the default `Minimum is £5.00` message. Receives the formatted minimum. */
	message?: (formattedMinimum: string) => string;
	/** Treat an empty/undefined value as valid (defer to `required`). Default true. */
	allowEmpty?: boolean;
}

export interface MinAmountValidator {
	/** Formatted minimum, e.g. `£5.00` — handy for hints/placeholders. */
	minLabel: string;
	/** Returns an error string when `value` (major units) is below the minimum, else undefined. */
	validate: (value: number | undefined) => string | undefined;
}

export function useMinAmountValidation(opts: MinAmountValidationOptions): MinAmountValidator {
	const { min_cents, currency = 'GBP', locale = 'en-GB', message, allowEmpty = true } = opts;

	return useMemo<MinAmountValidator>(() => {
		const format = (cents: number): string => {
			try {
				return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100);
			} catch {
				return `${currency} ${(cents / 100).toFixed(2)}`;
			}
		};

		const minLabel = format(min_cents);

		const validate = (value: number | undefined): string | undefined => {
			if (value === undefined || Number.isNaN(value)) {
				return allowEmpty ? undefined : `Minimum is ${minLabel}`;
			}
			const cents = Math.round(value * 100);
			if (cents < min_cents) {
				return message ? message(minLabel) : `Minimum is ${minLabel}`;
			}
			return undefined;
		};

		return { minLabel, validate };
	}, [min_cents, currency, locale, message, allowEmpty]);
}
