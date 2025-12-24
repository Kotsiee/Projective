# Selected Codebase Context

> Included paths: ./packages/types

## Project Tree (Selected)

```text
./packages/types/
  types/
  currency.ts
  DateTime.ts
  deno.json
  fields/
  form.ts
  select.ts
  slider.ts
  text.ts
  file/
  fileCategories.ts
  file.ts
  mod.ts
  permissions.ts
  processing.ts
```

## File Contents

### File: packages\types\currency.ts

```ts
// lib/currencyCategories.ts

export type CurrencyCategory = 'Fiat' | 'Crypto' | 'Commodity';

export interface CurrencyDefinition {
	code: string;
	name: string;
	symbol: string;
	decimals: number;
}

export type CurrencyMap = Record<string, CurrencyDefinition[]>;

export const currencyCategories: CurrencyMap = {
	// 💵 TRADITIONAL GOVERNMENT BACKED CURRENCIES
	Fiat: [
		{ code: 'USD', name: 'United States Dollar', symbol: '$', decimals: 2 },
		{ code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
		{ code: 'GBP', name: 'British Pound Sterling', symbol: '£', decimals: 2 },
		{ code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimals: 0 },
		{ code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimals: 2 },
		{ code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimals: 2 },
		{ code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimals: 2 },
		{ code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', decimals: 2 },
		{ code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', decimals: 2 },
		{ code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimals: 2 },
		{ code: 'SEK', name: 'Swedish Krona', symbol: 'kr', decimals: 2 },
		{ code: 'KRW', name: 'South Korean Won', symbol: '₩', decimals: 0 },
		{ code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', decimals: 2 },
		{ code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', decimals: 2 },
		{ code: 'INR', name: 'Indian Rupee', symbol: '₹', decimals: 2 },
		{ code: 'MXN', name: 'Mexican Peso', symbol: '$', decimals: 2 },
		{ code: 'TWD', name: 'New Taiwan Dollar', symbol: 'NT$', decimals: 2 },
		{ code: 'ZAR', name: 'South African Rand', symbol: 'R', decimals: 2 },
		{ code: 'BRL', name: 'Brazilian Real', symbol: 'R$', decimals: 2 },
		{ code: 'DKK', name: 'Danish Krone', symbol: 'kr', decimals: 2 },
		{ code: 'PLN', name: 'Polish Złoty', symbol: 'zł', decimals: 2 },
		{ code: 'THB', name: 'Thai Baht', symbol: '฿', decimals: 2 },
		{ code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', decimals: 2 },
		{ code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', decimals: 2 },
		{ code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', decimals: 2 },
		{ code: 'ILS', name: 'Israeli New Shekel', symbol: '₪', decimals: 2 },
		{ code: 'CLP', name: 'Chilean Peso', symbol: '$', decimals: 0 },
		{ code: 'PHP', name: 'Philippine Peso', symbol: '₱', decimals: 2 },
		{ code: 'AED', name: 'United Arab Emirates Dirham', symbol: 'dh', decimals: 2 },
		{ code: 'COP', name: 'Colombian Peso', symbol: '$', decimals: 2 },
		{ code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', decimals: 2 },
		{ code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', decimals: 2 },
		{ code: 'RON', name: 'Romanian Leu', symbol: 'lei', decimals: 2 },
		{ code: 'VND', name: 'Vietnamese Đồng', symbol: '₫', decimals: 0 },
		{ code: 'ARS', name: 'Argentine Peso', symbol: '$', decimals: 2 },
		{ code: 'NGN', name: 'Nigerian Naira', symbol: '₦', decimals: 2 },
		{ code: 'TRY', name: 'Turkish Lira', symbol: '₺', decimals: 2 },
		{ code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', decimals: 2 },
		{ code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', decimals: 2 },
		{ code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', decimals: 2 },
	],

	// ⛓️ CRYPTOCURRENCIES (Blue chips & Major Chains)
	Crypto: [
		{ code: 'BTC', name: 'Bitcoin', symbol: '₿', decimals: 8 },
		{ code: 'ETH', name: 'Ethereum', symbol: 'Ξ', decimals: 18 },
		{ code: 'USDT', name: 'Tether', symbol: '₮', decimals: 6 },
		{ code: 'BNB', name: 'Binance Coin', symbol: 'BNB', decimals: 18 },
		{ code: 'SOL', name: 'Solana', symbol: 'SOL', decimals: 9 },
		{ code: 'USDC', name: 'USD Coin', symbol: '$', decimals: 6 },
		{ code: 'XRP', name: 'Ripple', symbol: 'XRP', decimals: 6 },
		{ code: 'ADA', name: 'Cardano', symbol: '₳', decimals: 6 },
		{ code: 'AVAX', name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
		{ code: 'DOGE', name: 'Dogecoin', symbol: 'Ð', decimals: 8 },
		{ code: 'DOT', name: 'Polkadot', symbol: 'DOT', decimals: 10 },
		{ code: 'TRX', name: 'TRON', symbol: 'TRX', decimals: 6 },
		{ code: 'MATIC', name: 'Polygon', symbol: 'MATIC', decimals: 18 },
		{ code: 'LTC', name: 'Litecoin', symbol: 'Ł', decimals: 8 },
		{ code: 'SHIB', name: 'Shiba Inu', symbol: 'SHIB', decimals: 18 },
		{ code: 'DAI', name: 'Dai', symbol: '◈', decimals: 18 },
		{ code: 'BCH', name: 'Bitcoin Cash', symbol: 'Ƀ', decimals: 8 },
		{ code: 'ATOM', name: 'Cosmos', symbol: 'ATOM', decimals: 6 },
		{ code: 'UNI', name: 'Uniswap', symbol: 'UNI', decimals: 18 },
		{ code: 'LINK', name: 'Chainlink', symbol: 'LINK', decimals: 18 },
		{ code: 'XLM', name: 'Stellar', symbol: '*', decimals: 7 },
		{ code: 'XMR', name: 'Monero', symbol: '♏', decimals: 12 },
	],

	// 🏆 COMMODITIES & PRECIOUS METALS (ISO 4217 Standard Codes)
	Commodity: [
		{ code: 'XAU', name: 'Gold (Troy Ounce)', symbol: 'Au', decimals: 2 },
		{ code: 'XAG', name: 'Silver (Troy Ounce)', symbol: 'Ag', decimals: 2 },
		{ code: 'XPT', name: 'Platinum (Troy Ounce)', symbol: 'Pt', decimals: 2 },
		{ code: 'XPD', name: 'Palladium (Troy Ounce)', symbol: 'Pd', decimals: 2 },
		{ code: 'XCU', name: 'Copper', symbol: 'Cu', decimals: 2 },
		{ code: 'CL', name: 'Crude Oil (WTI)', symbol: '🛢️', decimals: 2 },
		{ code: 'BRN', name: 'Brent Crude Oil', symbol: '🛢️', decimals: 2 },
		{ code: 'NG', name: 'Natural Gas', symbol: '🔥', decimals: 2 },
	],
};

```

### File: packages\types\DateTime.ts

```ts
/* eslint-disable @typescript-eslint/naming-convention */

/**
 * Supported units for date/time differences and ranges.
 */
type DiffUnit =
    | 'milliseconds'
    | 'seconds'
    | 'minutes'
    | 'hours'
    | 'days'
    | 'weeks'
    | 'months'
    | 'years';

/**
 * Human-readable labels per diff unit used when building duration text.
 */
const UNIT_LABELS: Record<DiffUnit, { singular: string; plural: string }> = {
    milliseconds: { singular: 'millisecond', plural: 'milliseconds' },
    seconds: { singular: 'second', plural: 'seconds' },
    minutes: { singular: 'minute', plural: 'minutes' },
    hours: { singular: 'hour', plural: 'hours' },
    days: { singular: 'day', plural: 'days' },
    weeks: { singular: 'week', plural: 'weeks' },
    months: { singular: 'month', plural: 'months' },
    years: { singular: 'year', plural: 'years' },
};

// #region DateTime core

/**
 * Lightweight date/time helper that wraps the native Date for parsing, formatting, math and comparisons.
 *
 * @remarks
 * Accepts native Date, ISO-like strings, a custom parse format, or Excel serial numbers.
 * Instances are immutable from the caller's perspective whenever methods return a new DateTime.
 */
export class DateTime {
    private date: Date;
    private timezone: string | null = null;

    /**
     * Creates a new DateTime from various input types.
     *
     * @param input Native Date, parseable string, Excel serial number, or undefined for "now".
     * @param format Optional custom format string to parse non-ISO input.
     * @param strictWeekday When true, rejects dates whose weekday text does not match the parsed calendar date.
     */
    constructor(input?: Date | string | number, format?: string, strictWeekday: boolean = false) {
        if (input instanceof Date) {
            this.date = new Date(input);
        } else if (typeof input === 'string') {
            this.date = format
                ? this.parseCustomFormat(input, format, strictWeekday)
                : this.parseFromString(input);
        } else if (typeof input === 'number') {
            this.date = this.parseFromExcel(input);
        } else {
            this.date = new Date();
        }
    }

    /**
     * Parses a string using the browser's native Date parser.
     *
     * @remarks
     * Behaviour depends on the runtime environment and may differ across browsers.
     */
    private parseFromString(input: string): Date {
        return new Date(input);
    }

    /**
     * Converts an Excel serial date into a JavaScript Date.
     *
     * @remarks
     * Uses the 1900 date system (epoch 1899-12-30) and ignores Excel's leap-year bug for 1900.
     */
    private parseFromExcel(serial: number): Date {
        const excelEpoch = new Date(1899, 11, 30);
        return new Date(excelEpoch.getTime() + serial * 86400000);
    }

    /**
     * Parses a date string against a custom tokenised format.
     *
     * @remarks
     * Supports basic day/month/year/time and timezone offset tokens similar to moment.js-style formats.
     * Throws when the input does not match the pattern or when strict weekday validation fails.
     *
     * @throws Error If the input cannot be matched to the given format or weekday does not align when strict.
     */
    private parseCustomFormat(input: string, format: string, strictWeekday: boolean = false): Date {
        const monthsShort = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];
        const monthsLong = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];
        const weekdaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weekdaysLong = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
        ];

        const tokenMap: Record<string, string> = {
            d: '(\\d{1,2})',
            dd: '(\\d{2})',
            ddd: `(${weekdaysShort.join('|')})`,
            dddd: `(${weekdaysLong.join('|')})`,
            M: '(\\d{1,2})',
            MM: '(\\d{2})',
            MMM: `(${monthsShort.join('|')})`,
            MMMM: `(${monthsLong.join('|')})`,
            y: '(\\d{2})',
            yy: '(\\d{2})',
            yyy: '(\\d{4})',
            yyyy: '(\\d{4})',
            h: '(\\d{1,2})',
            hh: '(\\d{2})',
            m: '(\\d{1,2})',
            mm: '(\\d{2})',
            s: '(\\d{1,2})',
            ss: '(\\d{2})',
            Z: '([+-]\\d{2}:?\\d{2})',
            ZZ: '([+-]\\d{4})',
        };

        const tokens: string[] = [];
        let pattern = '';
        for (let i = 0; i < format.length; ) {
            let matched = false;
            for (const token of Object.keys(tokenMap).sort((a, b) => b.length - a.length)) {
                if (format.startsWith(token, i)) {
                    pattern += tokenMap[token];
                    tokens.push(token);
                    i += token.length;
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                pattern += format[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                i++;
            }
        }

        const regex = new RegExp(`^${pattern}$`);
        const match = input.match(regex);
        if (!match) throw new Error(`Input "${input}" does not match format "${format}"`);

        let year = 1970,
            month = 1,
            day = 1,
            hour = 0,
            minute = 0,
            second = 0;
        let weekdayExpected: string | null = null;

        let j = 1;
        for (const token of tokens) {
            const raw = match[j++];
            switch (token) {
                case 'd':
                case 'dd':
                    day = parseInt(raw, 10);
                    break;
                case 'ddd':
                case 'dddd':
                    weekdayExpected = raw;
                    break;
                case 'M':
                case 'MM':
                    month = parseInt(raw, 10);
                    break;
                case 'MMM':
                    month = monthsShort.indexOf(raw) + 1;
                    break;
                case 'MMMM':
                    month = monthsLong.indexOf(raw) + 1;
                    break;
                case 'y':
                case 'yy':
                    year = 2000 + parseInt(raw, 10);
                    break;
                case 'yyy':
                case 'yyyy':
                    year = parseInt(raw, 10);
                    break;
                case 'h':
                case 'hh':
                    hour = parseInt(raw, 10);
                    break;
                case 'm':
                case 'mm':
                    minute = parseInt(raw, 10);
                    break;
                case 's':
                case 'ss':
                    second = parseInt(raw, 10);
                    break;
                case 'Z':
                case 'ZZ': {
                    const parts = raw.match(/([+-])(\d{2}):?(\d{2})/);
                    if (parts) {
                        const sign = parts[1] === '+' ? 1 : -1;
                        const hh = parseInt(parts[2], 10);
                        const mm = parseInt(parts[3], 10);
                        const offsetMinutes = sign * (hh * 60 + mm);

                        return new Date(
                            Date.UTC(year, month - 1, day, hour, minute - offsetMinutes, second),
                        );
                    }
                    break;
                }
            }
        }

        const parsed = new Date(year, month - 1, day, hour, minute, second);

        if (strictWeekday && weekdayExpected) {
            const actual = parsed.toLocaleDateString('en-US', {
                weekday: weekdayExpected.length === 3 ? 'short' : 'long',
            });
            if (weekdayExpected !== actual) {
                throw new Error(
                    `Weekday mismatch: expected "${weekdayExpected}", but got "${actual}"`,
                );
            }
        }

        return parsed;
    }

    /**
     * Pads a numeric value with leading zeroes for formatting.
     */
    private pad(num: number, length: number = 2): string {
        return num.toString().padStart(length, '0');
    }

    /**
     * Returns the ordinal suffix for a given day in month.
     *
     * @example
     * getOrdinal(1) === 'st', getOrdinal(22) === 'nd'
     */
    private getOrdinal(day: number): string {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1:
                return 'st';
            case 2:
                return 'nd';
            case 3:
                return 'rd';
            default:
                return 'th';
        }
    }

    /**
     * Map of custom format tokens to formatting functions.
     *
     * @remarks
     * Used by {@link toFormat} to expand tokens to locale-aware date/time pieces.
     */
    private formatTokens: Record<string, (d: Date) => string> = {
        d: d => d.getDate().toString(),
        dd: d => this.pad(d.getDate()),
        ddd: d => d.toLocaleDateString('en-GB', { weekday: 'short' }),
        dddd: d => d.toLocaleDateString('en-GB', { weekday: 'long' }),
        D: d =>
            `${d.toLocaleDateString('en-GB', {
                weekday: 'short',
            })} ${d.getDate()}`,
        DD: d =>
            `${d.toLocaleDateString('en-GB', {
                weekday: 'long',
            })} ${d.getDate()}`,
        o: d => this.getOrdinal(d.getDate()),
        M: d => (d.getMonth() + 1).toString(),
        MM: d => this.pad(d.getMonth() + 1),
        MMM: d => d.toLocaleDateString('en-GB', { month: 'short' }),
        MMMM: d => d.toLocaleDateString('en-GB', { month: 'long' }),
        y: d => d.getFullYear().toString().slice(-2),
        yy: d => d.getFullYear().toString().slice(-2),
        yyy: d => d.getFullYear().toString(),
        yyyy: d => d.getFullYear().toString(),
        h: d => (d.getHours() % 12 || 12).toString(),
        hh: d => this.pad(d.getHours() % 12 || 12),
        H: d => d.getHours().toString(),
        HH: d => this.pad(d.getHours()),
        m: d => d.getMinutes().toString(),
        mm: d => this.pad(d.getMinutes()),
        s: d => d.getSeconds().toString(),
        ss: d => this.pad(d.getSeconds()),
        t: d => (d.getHours() < 12 ? 'AM' : 'PM'),
        tt: d => (d.getHours() < 12 ? 'am' : 'pm'),
        Z: _d => this.formatOffset(true),
        ZZ: _d => this.formatOffset(false),
        z: d =>
            Intl.DateTimeFormat('en-GB', {
                timeZone: this.timezone || 'UTC',
                timeZoneName: 'short',
            })
                .format(d)
                .split(' ')
                .pop() || '',
        zzzz: d =>
            Intl.DateTimeFormat('en-GB', {
                timeZone: this.timezone || 'UTC',
                timeZoneName: 'long',
            })
                .format(d)
                .split(' ')
                .pop() || '',
    };

    /**
     * Returns the local timezone offset in minutes, positive east of UTC.
     */
    private getOffsetMinutes(): number {
        return -this.date.getTimezoneOffset();
    }

    /**
     * Formats the current timezone offset as a string.
     *
     * @param colon When true, uses `+HH:MM`, otherwise `+HHMM`.
     */
    private formatOffset(colon: boolean = true): string {
        const offset = this.getOffsetMinutes();
        const sign = offset >= 0 ? '+' : '-';
        const abs = Math.abs(offset);
        const hh = Math.floor(abs / 60)
            .toString()
            .padStart(2, '0');
        const mm = (abs % 60).toString().padStart(2, '0');
        return colon ? `${sign}${hh}:${mm}` : `${sign}${hh}${mm}`;
    }

    /**
     * Returns the native `Date.toString()` representation.
     */
    toString(): string {
        return this.date.toString();
    }

    /**
     * Returns the ISO 8601 string representation in UTC.
     */
    toISO(): string {
        return this.date.toISOString();
    }

    /**
     * Formats the date according to the custom token format.
     *
     * @remarks
     * Uses the internal token map, including locale-aware weekday/month text and timezone information.
     */
    toFormat(format: string): string {
        const tokens = Object.keys(this.formatTokens).sort((a, b) => b.length - a.length);
        let result = '';
        for (let i = 0; i < format.length; ) {
            let matched = false;
            for (const token of tokens) {
                if (format.startsWith(token, i)) {
                    result += this.formatTokens[token](this.date);
                    i += token.length;
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                result += format[i];
                i++;
            }
        }
        return result;
    }

    /**
     * Returns the underlying epoch time in milliseconds.
     */
    getTime(): number {
        return this.date.getTime();
    }
    getDate(): number {
        return this.date.getDate();
    }
    getDay(): number {
        return this.date.getDay();
    }
    getMonth(): number {
        return this.date.getMonth() + 1;
    }
    getYear(): number {
        return this.date.getFullYear();
    }
    getHour(): number {
        return this.date.getHours();
    }
    getMinute(): number {
        return this.date.getMinutes();
    }
    getSecond(): number {
        return this.date.getSeconds();
    }

    /**
     * Adds another DateTime or a scalar amount in a specific unit and returns a new instance.
     *
     * @remarks
     * When passing a DateTime, millisecond timestamps are summed; when passing a number, the unit string is used.
     *
     * @throws Error If an unsupported unit string is provided.
     */
    add(value: DateTime): DateTime;
    add(value: number, type: string): DateTime;
    add(value: any, type?: string): DateTime {
        const newDate = new Date(this.date);
        if (value instanceof DateTime) {
            newDate.setTime(newDate.getTime() + value.getTime());
        } else if (typeof value === 'number' && type) {
            switch (type.toLowerCase()) {
                case 'milliseconds':
                    newDate.setMilliseconds(newDate.getMilliseconds() + value);
                    break;
                case 'seconds':
                    newDate.setSeconds(newDate.getSeconds() + value);
                    break;
                case 'minutes':
                    newDate.setMinutes(newDate.getMinutes() + value);
                    break;
                case 'hours':
                    newDate.setHours(newDate.getHours() + value);
                    break;
                case 'days':
                    newDate.setDate(newDate.getDate() + value);
                    break;
                case 'weeks':
                    newDate.setDate(newDate.getDate() + value * 7);
                    break;
                case 'months':
                    newDate.setMonth(newDate.getMonth() + value);
                    break;
                case 'years':
                    newDate.setFullYear(newDate.getFullYear() + value);
                    break;
                default:
                    throw new Error(`Unsupported add type: ${type}`);
            }
        }
        return new DateTime(newDate);
    }

    /**
     * Subtracts another DateTime or a scalar amount in a specific unit and returns a new instance.
     *
     * @remarks
     * When passing a DateTime, returns a duration whose epoch time is the millisecond difference
     * (this.getTime() - other.getTime()).
     * When passing a number, delegates to {@link add} with a negated value.
     */
    minus(value: DateTime): DateTime;
    minus(value: number, type: string): DateTime;
    minus(value: any, type?: string): DateTime {
        if (value instanceof DateTime) {
            // IMPORTANT: build a Date from the millisecond diff, not via the numeric (Excel) constructor.
            const diffMs = this.getTime() - value.getTime();
            return new DateTime(new Date(diffMs));
        } else {
            return this.add(-value, type!);
        }
    }

    /**
     * Attaches a display timezone identifier for formatting tokens that depend on it.
     *
     * @remarks
     * This does not shift the underlying instant, only how timezone-aware tokens (e.g. `z`, `zzzz`) are formatted.
     */
    addTimezone(timezone: string): DateTime {
        this.timezone = timezone;
        return this;
    }

    /**
     * Returns the ISO week number of the year (1–53).
     *
     * @remarks
     * Week calculation follows ISO-8601 rules: weeks start on Monday and week 1 is the week with the first Thursday.
     */
    getWeek(): number {
        const temp = new Date(this.date);
        temp.setHours(0, 0, 0, 0);
        temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
        const week1 = new Date(temp.getFullYear(), 0, 4);
        return (
            1 +
            Math.round(
                ((temp.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) /
                    7,
            )
        );
    }

    /**
     * Returns the full weekday name in `en-GB` locale.
     */
    getDayOfWeek(): string {
        return this.date.toLocaleDateString('en-GB', { weekday: 'long' });
    }

    /**
     * Returns a new DateTime instance that shares the same underlying instant.
     */
    clone(): DateTime {
        return new DateTime(new Date(this.date));
    }

    /**
     * Checks if this instance occurs strictly before another.
     */
    isBefore(other: DateTime): boolean {
        return this.getTime() < other.getTime();
    }

    /**
     * Checks if this instance occurs strictly after another.
     */
    isAfter(other: DateTime): boolean {
        return this.getTime() > other.getTime();
    }

    /**
     * Checks if this instance represents the exact same millisecond as another.
     */
    isSame(other: DateTime): boolean {
        return this.getTime() === other.getTime();
    }

    /**
     * Checks whether this time falls between two other times with configurable inclusivity.
     *
     * @param start Lower bound.
     * @param end Upper bound.
     * @param inclusive One of `"()"`, `"[)"`, `"(]"`, `"[]"` to control boundary inclusion.
     *
     * @throws Error If an invalid inclusive flag is provided.
     */
    isBetween(start: DateTime, end: DateTime, inclusive: string = '()'): boolean {
        const t = this.getTime();
        const s = start.getTime();
        const e = end.getTime();

        switch (inclusive) {
            case '()':
                return t > s && t < e;
            case '[)':
                return t >= s && t < e;
            case '(]':
                return t > s && t <= e;
            case '[]':
                return t >= s && t <= e;
            default:
                throw new Error(`Invalid inclusive flag: ${inclusive}`);
        }
    }

    /**
     * Checks if this DateTime shares the same calendar day as another (year, month, day).
     */
    isSameDay(other: DateTime): boolean {
        return (
            this.getYear() === other.getYear() &&
            this.getMonth() === other.getMonth() &&
            this.getDate() === other.getDate()
        );
    }

    /**
     * Checks if this DateTime falls in the same calendar month as another.
     */
    isSameMonth(other: DateTime): boolean {
        return this.getYear() === other.getYear() && this.getMonth() === other.getMonth();
    }

    /**
     * Checks if this DateTime falls in the same calendar year as another.
     */
    isSameYear(other: DateTime): boolean {
        return this.getYear() === other.getYear();
    }

    /**
     * Returns a new DateTime snapped to the start of the given unit.
     *
     * @param unit One of `year`, `month`, `week`, `day`, `hour`, `minute`, `second` (case-insensitive).
     *
     * @throws Error If an unsupported unit is provided.
     */
    startOf(unit: string): DateTime {
        const d = new Date(this.date);
        switch (unit.toLowerCase()) {
            case 'year':
                d.setMonth(0, 1);
                d.setHours(0, 0, 0, 0);
                break;
            case 'month':
                d.setDate(1);
                d.setHours(0, 0, 0, 0);
                break;
            case 'week': {
                const day = d.getDay();
                d.setDate(d.getDate() - day);
                d.setHours(0, 0, 0, 0);
                break;
            }
            case 'day':
                d.setHours(0, 0, 0, 0);
                break;
            case 'hour':
                d.setMinutes(0, 0, 0);
                break;
            case 'minute':
                d.setSeconds(0, 0);
                break;
            case 'second':
                d.setMilliseconds(0);
                break;
            default:
                throw new Error(`Unsupported unit for startOf: ${unit}`);
        }
        return new DateTime(d);
    }

    /**
     * Returns a new DateTime snapped to the end of the given unit.
     *
     * @param unit One of `year`, `month`, `week`, `day`, `hour`, `minute`, `second` (case-insensitive).
     *
     * @throws Error If an unsupported unit is provided.
     */
    endOf(unit: string): DateTime {
        const d = new Date(this.date);
        switch (unit.toLowerCase()) {
            case 'year':
                d.setMonth(11, 31);
                d.setHours(23, 59, 59, 999);
                break;
            case 'month':
                d.setMonth(d.getMonth() + 1, 0);
                d.setHours(23, 59, 59, 999);
                break;
            case 'week': {
                const day = d.getDay();
                d.setDate(d.getDate() + (6 - day));
                d.setHours(23, 59, 59, 999);
                break;
            }
            case 'day':
                d.setHours(23, 59, 59, 999);
                break;
            case 'hour':
                d.setMinutes(59, 59, 999);
                break;
            case 'minute':
                d.setSeconds(59, 999);
                break;
            case 'second':
                d.setMilliseconds(999);
                break;
            default:
                throw new Error(`Unsupported unit for endOf: ${unit}`);
        }
        return new DateTime(d);
    }

    /**
     * Returns the raw numeric difference between this instance and another in the specified unit.
     *
     * @param other DateTime to compare against.
     * @param unit Unit to express the difference in; uses the same labels as {@link DiffUnit} but accepts any casing.
     *
     * @throws Error If an unsupported unit is requested.
     */
    diff(other: DateTime, unit: string = 'milliseconds'): number {
        const ms = this.getTime() - other.getTime();
        switch (unit.toLowerCase()) {
            case 'milliseconds':
                return ms;
            case 'seconds':
                return ms / 1000;
            case 'minutes':
                return ms / (1000 * 60);
            case 'hours':
                return ms / (1000 * 60 * 60);
            case 'days':
                return ms / (1000 * 60 * 60 * 24);
            case 'weeks':
                return ms / (1000 * 60 * 60 * 24 * 7);
            case 'months':
                return (
                    (this.getYear() - other.getYear()) * 12 + (this.getMonth() - other.getMonth())
                );
            case 'years':
                return this.getYear() - other.getYear();
            default:
                throw new Error(`Unsupported diff unit: ${unit}`);
        }
    }

    /**
     * Computes a human-friendly time difference between this instance and another.
     *
     * @param other DateTime to compare with.
     * @param opts Optional tuning for units and rounding.
     * @returns A descriptor including numeric value, chosen unit, label text and singular/plural metadata.
     *
     * @remarks
     * Picks the "largest" unit within the allowed range whose absolute value is at least 1.
     * Months and years are calculated using calendar arithmetic; other units are derived from milliseconds.
     *
     * @throws Error If `minUnit` or `maxUnit` are invalid or inconsistent with the allowed unit order.
     */
    diffAuto(
        other: DateTime,
        opts?: {
            minUnit?: DiffUnit;
            maxUnit?: DiffUnit;
            rounding?: 'round' | 'floor' | 'ceil';
            absolute?: boolean;
        },
    ): { value: number; unit: DiffUnit; unitSingular: string; unitPlural: string; label: string } {
        const {
            minUnit = 'seconds',
            maxUnit = 'years',
            rounding = 'round',
            absolute = true,
        } = opts || {};

        const order: DiffUnit[] = [
            'milliseconds',
            'seconds',
            'minutes',
            'hours',
            'days',
            'weeks',
            'months',
            'years',
        ];

        const clampRange = (units: DiffUnit[], lo: DiffUnit, hi: DiffUnit) => {
            const start = units.indexOf(lo);
            const end = units.indexOf(hi);
            if (start === -1 || end === -1) throw new Error('Invalid minUnit/maxUnit');
            return units.slice(Math.min(start, end), Math.max(start, end) + 1);
        };

        const candidates = clampRange(order, minUnit, maxUnit);

        if (this.getTime() === other.getTime()) {
            const chosenZero = candidates[0] || 'milliseconds';
            const { singular, plural } = UNIT_LABELS[chosenZero];
            return {
                value: 0,
                unit: chosenZero,
                unitSingular: singular,
                unitPlural: plural,
                label: `0 ${plural}`,
            };
        }

        const ms = this.diff(other, 'milliseconds');
        const s = ms / 1000;
        const m = s / 60;
        const h = m / 60;
        const d = h / 24;
        const w = d / 7;

        const months = this.diff(other, 'months');
        const years = this.diff(other, 'years');

        const byUnit: Record<DiffUnit, number> = {
            years,
            months,
            weeks: w,
            days: d,
            hours: h,
            minutes: m,
            seconds: s,
            milliseconds: ms,
        };

        const descending = [...candidates].sort((a, b) => order.indexOf(b) - order.indexOf(a));

        let chosen: DiffUnit | null = null;
        for (const u of descending) {
            if (Math.abs(byUnit[u]) >= 1) {
                chosen = u;
                break;
            }
        }
        if (!chosen) chosen = candidates[0];

        let value = byUnit[chosen];

        if (absolute) value = Math.abs(value);

        switch (rounding) {
            case 'floor':
                value = Math.floor(value);
                break;
            case 'ceil':
                value = Math.ceil(value);
                break;
            case 'round':
            default:
                value = Math.round(value);
                break;
        }

        const { singular, plural } = UNIT_LABELS[chosen];
        const label = `${value} ${Math.abs(value) === 1 ? singular : plural}`;

        return {
            value,
            unit: chosen,
            unitSingular: singular,
            unitPlural: plural,
            label,
        };
    }

    /**
     * Indicates whether the underlying Date represents a valid point in time.
     */
    isValid(): boolean {
        return !isNaN(this.date.getTime());
    }

    /**
     * Returns a clone of the given DateTime with a different display timezone.
     *
     * @remarks
     * The instant is preserved; only timezone-aware formatting changes.
     */
    static toNewTimezone(value: DateTime, timezone: string): DateTime {
        const iso = value.toISO();
        const dt = new DateTime(new Date(iso));
        dt.addTimezone(timezone);
        return dt;
    }

    /**
     * Builds an array of dates between two points in time using a given step unit.
     *
     * @param start Inclusive start DateTime.
     * @param end Inclusive end DateTime.
     * @param format Optional format string; when truthy, items are formatted strings, otherwise DateTime instances.
     * @param returnType Unit to step by (e.g. `days`, `hours`), case-insensitive.
     *
     * @throws Error If an unsupported `returnType` is provided.
     */
    static datesBetween(
        start: DateTime,
        end: DateTime,
        format: string,
        returnType: string,
    ): (DateTime | string)[] {
        const results: (DateTime | string)[] = [];
        let current = start.clone();
        const unit = returnType.toLowerCase();

        while (current.isBefore(end) || current.isSame(end)) {
            results.push(format ? current.toFormat(format) : current.clone());

            switch (unit) {
                case 'milliseconds':
                    current = current.add(1, 'milliseconds');
                    break;
                case 'seconds':
                    current = current.add(1, 'seconds');
                    break;
                case 'minutes':
                    current = current.add(1, 'minutes');
                    break;
                case 'hours':
                    current = current.add(1, 'hours');
                    break;
                case 'days':
                    current = current.add(1, 'days');
                    break;
                case 'weeks':
                    current = current.add(1, 'weeks');
                    break;
                case 'months':
                    current = current.add(1, 'months');
                    break;
                case 'years':
                    current = current.add(1, 'years');
                    break;
                default:
                    throw new Error(`Unsupported returnType: ${returnType}`);
            }
        }
        return results;
    }

    /**
     * Convenience wrapper to build a DateTime range with a specific unit step.
     *
     * @param start Inclusive start.
     * @param end Inclusive end.
     * @param unit Unit to step by, defaults to `days`.
     */
    static range(start: DateTime, end: DateTime, unit: string = 'days'): DateTime[] {
        return DateTime.datesBetween(start, end, '', unit) as DateTime[];
    }

    /**
     * Returns a DateTime representing the current instant.
     */
    static now(): DateTime {
        return new DateTime(new Date());
    }

    /**
     * Returns a DateTime for today at local midnight.
     */
    static today(): DateTime {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return new DateTime(d);
    }

    /**
     * Returns a DateTime for tomorrow at local midnight.
     */
    static tomorrow(): DateTime {
        return DateTime.today().add(1, 'days');
    }

    /**
     * Returns a DateTime for yesterday at local midnight.
     */
    static yesterday(): DateTime {
        return DateTime.today().minus(1, 'days');
    }

    /**
     * Creates a DateTime from an ISO 8601 string.
     */
    static fromISO(iso: string): DateTime {
        return new DateTime(new Date(iso));
    }

    /**
     * Creates a DateTime from an Excel serial date number.
     *
     * @remarks
     * Uses the same conversion rules as the instance-level Excel parser.
     */
    static fromExcel(serial: number): DateTime {
        return new DateTime(serial);
    }
}

// #endregion DateTime core

```

### File: packages\types\deno.json

```json
{
  "name": "@projective/types",
  "version": "0.0.0",
  "exports": "./mod.ts"
}

```

### File: packages\types\fields\form.ts

```ts
import { VNode } from 'preact';

// deno-lint-ignore no-explicit-any
export interface BaseFieldProps<T = any> {
	// Core Binding
	name: string;
	value?: T;
	onChange?: (value: T) => void;

	// Identifiers
	id?: string;
	label?: string;

	// State
	disabled?: boolean;
	required?: boolean;
	readonly?: boolean;

	// Validation
	error?: string;
	success?: boolean;

	// Visuals
	placeholder?: string;
	hint?: string; // Bottom helper text (neutral)
	helperText?: string; // Bottom helper text (can be semantic)
	className?: string;

	// Layout
	floatingLabel?: boolean;

	// Slots (Generic icons for consistency)
	iconLeft?: VNode;
	iconRight?: VNode;
}

```

### File: packages\types\fields\select.ts

```ts
import { VNode } from 'preact';

export interface SelectOption<T> {
	label: string;
	value: string | T | number;
	icon?: VNode;
	avatarUrl?: string;
	group?: string;
	disabled?: boolean;
}

export interface SelectIcons {
	arrow?: VNode;
	arrowOpen?: VNode;
	clear?: VNode;
	loading?: VNode;
	valid?: VNode;
	invalid?: VNode;
}

export interface SelectFieldConfig<T> {
	multiple?: boolean;
	clearable?: boolean;
	searchable?: boolean;
	placeholder?: string;
	loading?: boolean; // Async loading state

	// UX Features
	enableSelectAll?: boolean;
	displayMode?: 'chips-inside' | 'chips-below' | 'count' | 'comma';

	// Customization
	icons?: SelectIcons;

	// Optional Renderers
	renderOption?: (option: SelectOption<T>) => VNode;
	renderSelection?: (selected: SelectOption<T>[]) => VNode;
}

```

### File: packages\types\fields\slider.ts

```ts
import { BaseFieldProps } from './form.ts';

export interface SliderMark {
	value: number;
	label?: string;
}

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'inside';
export type TooltipVisibility = 'hover' | 'always' | 'active';

export interface SliderFieldProps extends BaseFieldProps<number | number[]> {
	min?: number;
	max?: number;
	step?: number;
	range?: boolean;

	// --- Physics ---
	// Allow handles to cross each other.
	// If true, value can be [80, 20] instead of strictly [20, 80].
	passthrough?: boolean;
	minDistance?: number;
	scale?: 'linear' | 'logarithmic';

	// --- Visuals ---
	marks?: boolean | number[] | SliderMark[];
	snapToMarks?: boolean;
	vertical?: boolean;
	height?: string;

	// --- Tooltips / Labels ---
	// If true, uses defaults. Or pass config object.
	tooltip?: boolean | {
		format?: (val: number) => string;
		position?: TooltipPosition;
		visibility?: TooltipVisibility;
	};

	jumpOnClick?: boolean;
}

```

### File: packages\types\fields\text.ts

```ts
import { VNode } from 'preact';
import { BaseFieldProps } from './form.ts';

export type InputType =
	| 'text'
	| 'password'
	| 'email'
	| 'number'
	| 'search'
	| 'tel'
	| 'url';

export type InputMode =
	| 'text'
	| 'decimal'
	| 'numeric'
	| 'tel'
	| 'search'
	| 'email'
	| 'url';

export interface TextFieldProps extends BaseFieldProps<string | number> {
	type?: InputType;
	inputMode?: InputMode;

	// --- Variants & Presets ---
	// "default" is standard.
	// "currency" adds onBlur formatting.
	// "credit-card" adds masking + luhn validation.
	variant?: 'default' | 'currency' | 'credit-card' | 'percentage';

	// --- Masking ---
	mask?: string;

	multiline?: boolean;
	rows?: number;
	autoGrow?: boolean;

	maxLength?: number;
	showCount?: boolean;

	clearable?: boolean;
	showPasswordToggle?: boolean;

	prefix?: string | VNode;
	suffix?: string | VNode;

	onFocus?: (e: FocusEvent) => void;
	onBlur?: (e: FocusEvent) => void;
	onKeyDown?: (e: KeyboardEvent) => void;
}

```

### File: packages\types\file\fileCategories.ts

```ts
export type FileCategory =
	| 'Document'
	| 'Presentation'
	| 'Spreadsheet'
	| 'Audio'
	| 'Video'
	| 'Image'
	| 'Vector'
	| 'Medical'
	| 'Scientific'
	| 'Compression'
	| 'Executable'
	| 'Code'
	| '3D'
	| 'Database'
	| 'Data'
	| 'Font'
	| 'Security'
	| 'System';

export interface FileDefinition {
	extension: string;
	application?: string;
	validMimeTypes?: string[];
}

export type ExtensionMap = Record<FileCategory, FileDefinition[]>;

export const extensionCategories: ExtensionMap = {
	Document: [
		{ extension: 'doc', application: 'Microsoft Word', validMimeTypes: ['application/msword'] },
		{
			extension: 'docx',
			application: 'Microsoft Word',
			validMimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
		},
		{
			extension: 'dot',
			application: 'Microsoft Word Template',
			validMimeTypes: ['application/msword'],
		},
		{
			extension: 'dotx',
			application: 'Microsoft Word Template',
			validMimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.template'],
		},
		{ extension: 'pdf', application: 'Adobe Acrobat', validMimeTypes: ['application/pdf'] },
		{ extension: 'txt', application: 'Plain Text', validMimeTypes: ['text/plain'] },
		{ extension: 'rtf', application: 'Rich Text Format', validMimeTypes: ['application/rtf'] },
		{
			extension: 'odt',
			application: 'OpenDocument Text',
			validMimeTypes: ['application/vnd.oasis.opendocument.text'],
		},
		{
			extension: 'fodt',
			application: 'Flat OpenDocument Text',
			validMimeTypes: ['application/vnd.oasis.opendocument.text-flat-xml'],
		},
		{
			extension: 'wpd',
			application: 'WordPerfect Document',
			validMimeTypes: ['application/wordperfect'],
		},
		{
			extension: 'wps',
			application: 'Microsoft Works Document',
			validMimeTypes: ['application/vnd.ms-works'],
		},
		{ extension: 'abw', application: 'AbiWord Document' },
		{ extension: 'md', application: 'Markdown', validMimeTypes: ['text/markdown'] },
		{ extension: 'rst', application: 'reStructuredText', validMimeTypes: ['text/x-rst'] },
		{ extension: 'adoc', application: 'AsciiDoc' },
		{ extension: 'tex', application: 'LaTeX Document' },
		{ extension: 'ltx', application: 'LaTeX Source File' },
		{ extension: 'bib', application: 'BibTeX Bibliography File' },
		{ extension: 'epub', application: 'EPUB eBook', validMimeTypes: ['application/epub+zip'] },
		{ extension: 'mobi', application: 'Mobipocket eBook' },
		{ extension: 'azw', application: 'Amazon Kindle eBook' },
		{ extension: 'azw3', application: 'Amazon Kindle eBook' },
		{ extension: 'fb2', application: 'FictionBook eBook' },
		// Comics (Added)
		{
			extension: 'cbr',
			application: 'Comic Book RAR Archive',
			validMimeTypes: ['application/vnd.comicbook-rar'],
		},
		{
			extension: 'cbz',
			application: 'Comic Book ZIP Archive',
			validMimeTypes: ['application/vnd.comicbook+zip'],
		},
		// Business
		{ extension: 'gov', application: 'Government Document' },
		{ extension: 'legx', application: 'Legal XML Format' },
		{ extension: 'xfdl', application: 'Extensible Forms Description Language' },
		{ extension: 'djvu', application: 'DjVu Scanned Document', validMimeTypes: ['image/vnd.djvu'] },
		{
			extension: 'xps',
			application: 'Microsoft XPS Document',
			validMimeTypes: ['application/vnd.ms-xpsdocument'],
		},
		{ extension: 'oxps', application: 'OpenXPS Document', validMimeTypes: ['application/oxps'] },
		{
			extension: 'one',
			application: 'Microsoft OneNote',
			validMimeTypes: ['application/msonenote'],
		},
		{ extension: 'note', application: 'Evernote Note File' },
		{ extension: 'jnt', application: 'Windows Journal Note' },
		{ extension: 'gdoc', application: 'Google Docs File' },
		{ extension: 'pages', application: 'Apple Pages Document' },
		{ extension: 'indd', application: 'Adobe InDesign Document' },
		{ extension: 'indt', application: 'Adobe InDesign Template' },
		{ extension: 'pmd', application: 'Adobe PageMaker Document' },
		{ extension: 'pub', application: 'Microsoft Publisher Document' },
		{ extension: 'sla', application: 'Scribus Document' },
		{ extension: 'mml', application: 'Mathematical Markup Language' },
		{ extension: 'fodp', application: 'Flat OpenDocument Presentation' },
		{ extension: 'odg', application: 'OpenDocument Graphics' },
		{ extension: 'fodg', application: 'Flat OpenDocument Graphics' },
		{ extension: 'ott', application: 'OpenDocument Text Template' },
		{ extension: 'dotm', application: 'Microsoft Word Macro-Enabled Template' },
		{ extension: 'url', application: 'Internet Shortcut' },
		{ extension: 'webloc', application: 'Mac Web Shortcut' },
		{ extension: 'desktop', application: 'Linux Desktop Shortcut' },
		{ extension: 'nfo', application: 'Information File' },
		{ extension: 'readme', application: 'ReadMe File' },
		{ extension: 'ami', application: 'Amiga AmigaGuide' },
		{ extension: 'wp', application: 'WordPerfect' },
		{ extension: '602', application: 'T602 Text Document' },
		{ extension: 'p7s', application: 'Secure Signed Email File' },
		{ extension: 'fax', application: 'Fax Image Format' },
	],

	Spreadsheet: [
		{
			extension: 'xls',
			application: 'Microsoft Excel',
			validMimeTypes: ['application/vnd.ms-excel'],
		},
		{
			extension: 'xlsx',
			application: 'Microsoft Excel',
			validMimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
		},
		{
			extension: 'xlsm',
			application: 'Microsoft Excel Macro-Enabled',
			validMimeTypes: ['application/vnd.ms-excel.sheet.macroEnabled.12'],
		},
		{
			extension: 'xlsb',
			application: 'Microsoft Excel Binary Workbook',
			validMimeTypes: ['application/vnd.ms-excel.sheet.binary.macroEnabled.12'],
		},
		{
			extension: 'xlt',
			application: 'Microsoft Excel Template',
			validMimeTypes: ['application/vnd.ms-excel'],
		},
		{
			extension: 'xltx',
			application: 'Microsoft Excel Template',
			validMimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.template'],
		},
		{
			extension: 'ods',
			application: 'OpenDocument Spreadsheet',
			validMimeTypes: ['application/vnd.oasis.opendocument.spreadsheet'],
		},
		{
			extension: 'ots',
			application: 'OpenDocument Spreadsheet Template',
			validMimeTypes: ['application/vnd.oasis.opendocument.spreadsheet-template'],
		},
		{
			extension: 'fods',
			application: 'Flat OpenDocument Spreadsheet',
			validMimeTypes: ['application/vnd.oasis.opendocument.spreadsheet-flat-xml'],
		},
		{
			extension: 'dif',
			application: 'Data Interchange Format',
			validMimeTypes: ['application/x-dif'],
		},
		{
			extension: 'slk',
			application: 'Symbolic Link Format',
			validMimeTypes: ['application/vnd.ms-excel'],
		},
		{ extension: 'qbw', application: 'QuickBooks Company File' },
		{ extension: 'qbb', application: 'QuickBooks Backup File' },
		{ extension: 'qbm', application: 'QuickBooks Portable File' },
		{ extension: 'gnumeric', application: 'Gnumeric Spreadsheet' },
		{ extension: 'numbers', application: 'Apple Numbers Spreadsheet' },
		{ extension: 'gsheet', application: 'Google Sheets File' },
		{ extension: 'et', application: 'WPS Office Excel File' },
		{ extension: 'wks', application: 'Lotus 1-2-3 Worksheet' },
		{ extension: '123', application: 'Lotus 1-2-3 Spreadsheet' },
		{ extension: 'sas7bdat', application: 'SAS Dataset' },
		{ extension: 'wk1', application: 'Lotus Worksheet' },
		{ extension: 'wk3', application: 'Lotus 1-2-3 Worksheet' },
		{ extension: 'wk4', application: 'Lotus 1-2-3 Worksheet' },
		{ extension: 'wq1', application: 'Quattro Pro Spreadsheet' },
		{ extension: 'wq2', application: 'Quattro Pro Spreadsheet' },
		{ extension: 'qpw', application: 'Quattro Pro Workbook' },
		{ extension: 'vc', application: 'VisiCalc Spreadsheet' },
		{ extension: 'vcs', application: 'VisiCalc Spreadsheet' },
	],

	Presentation: [
		{ extension: 'key', application: 'Apple Keynote Presentation' },
		{
			extension: 'ppt',
			application: 'Microsoft PowerPoint',
			validMimeTypes: ['application/vnd.ms-powerpoint'],
		},
		{
			extension: 'pptx',
			application: 'Microsoft PowerPoint',
			validMimeTypes: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
		},
		{
			extension: 'odp',
			application: 'OpenDocument Presentation',
			validMimeTypes: ['application/vnd.oasis.opendocument.presentation'],
		},
	],

	Audio: [
		{ extension: 'mp3', application: 'MPEG Audio Layer III', validMimeTypes: ['audio/mpeg'] },
		{ extension: 'ogg', application: 'OGG Vorbis Audio', validMimeTypes: ['audio/ogg'] },
		{ extension: 'oga', application: 'OGG Audio', validMimeTypes: ['audio/ogg'] },
		{ extension: 'opus', application: 'Opus Audio', validMimeTypes: ['audio/opus'] },
		{ extension: 'aac', application: 'Advanced Audio Codec (AAC)', validMimeTypes: ['audio/aac'] },
		{ extension: 'm4a', application: 'MPEG-4 Audio', validMimeTypes: ['audio/mp4'] },
		{ extension: 'm4b', application: 'MPEG-4 Audiobook', validMimeTypes: ['audio/mp4'] },
		{ extension: 'm4p', application: 'MPEG-4 Protected Audio', validMimeTypes: ['audio/mp4'] },
		{
			extension: 'wav',
			application: 'Waveform Audio Format',
			validMimeTypes: ['audio/wav', 'audio/x-wav'],
		},
		{ extension: 'flac', application: 'Free Lossless Audio Codec', validMimeTypes: ['audio/flac'] },
		{ extension: 'alac', application: 'Apple Lossless Audio Codec' },
		{ extension: 'wma', application: 'Windows Media Audio', validMimeTypes: ['audio/x-ms-wma'] },
		{ extension: 'amr', application: 'Adaptive Multi-Rate Audio', validMimeTypes: ['audio/amr'] },
		{ extension: 'awb', application: 'Adaptive Multi-Rate Wideband Audio' },
		{ extension: 'ape', application: "Monkey's Audio" },
		{ extension: 'wv', application: 'WavPack Audio' },
		{ extension: 'tta', application: 'True Audio' },
		{ extension: 'dsf', application: 'DSD Stream File' },
		{ extension: 'dff', application: 'DSD Interchange File' },
		{ extension: 'mid', application: 'MIDI Sequence', validMimeTypes: ['audio/midi'] },
		{ extension: 'midi', application: 'MIDI Sequence', validMimeTypes: ['audio/midi'] },
		{ extension: 'kar', application: 'Karaoke MIDI' },
		{ extension: 'sf2', application: 'SoundFont 2' },
		{ extension: 'sfz', application: 'SFZ Instrument File' },
		{ extension: 'flp', application: 'FL Studio Project File' },
		{ extension: 'als', application: 'Ableton Live Set' },
		{ extension: 'alc', application: 'Ableton Live Clip' },
		{ extension: 'cpr', application: 'Cubase Project File' },
		{ extension: 'npr', application: 'Nuendo Project File' },
		{ extension: 'sesx', application: 'Adobe Audition Session File' },
		{ extension: 'omf', application: 'Open Media Framework File' },
		{ extension: 'ptx', application: 'Pro Tools Session' },
		{ extension: 'ptf', application: 'Pro Tools 7-9 Session' },
		{ extension: 'dss', application: 'Digital Speech Standard' },
		{ extension: 'ds2', application: 'Digital Speech Standard 2' },
		{ extension: 'vox', application: 'Dialogic ADPCM Audio' },
		{ extension: 'ra', application: 'RealAudio' },
		{ extension: 'm3u', application: 'MP3 Playlist File', validMimeTypes: ['audio/x-mpegurl'] },
		{
			extension: 'm3u8',
			application: 'M3U Extended Playlist',
			validMimeTypes: ['application/vnd.apple.mpegurl', 'audio/m3u8'],
		},
		{ extension: 'pls', application: 'Playlist File' },
		{ extension: 'asx', application: 'Advanced Stream Redirector' },
		{ extension: 'xspf', application: 'XML Shareable Playlist Format' },
		{ extension: 'bwf', application: 'Broadcast Wave Format' },
		{
			extension: 'aiff',
			application: 'Audio Interchange File Format',
			validMimeTypes: ['audio/aiff'],
		},
		{
			extension: 'aif',
			application: 'Audio Interchange File Format',
			validMimeTypes: ['audio/x-aiff'],
		},
		{ extension: 'aifc', application: 'Compressed AIFF Audio' },
		{ extension: 'caf', application: 'Apple Core Audio Format' },
		{ extension: 'mp2', application: 'MPEG Audio Layer II' },
		{ extension: 'spx', application: 'Speex Audio Format' },
		{ extension: 'au', application: 'Sun Microsystems Audio' },
		{ extension: 'snd', application: 'Sound File Format' },
		{ extension: 'vgm', application: 'Video Game Music File' },
		{ extension: 'spc', application: 'SNES Sound File' },
		{ extension: 'gbs', application: 'Game Boy Sound File' },
		{ extension: '2sf', application: 'Nintendo DS Sound File' },
		{ extension: 'ssf', application: 'Sega Saturn Sound File' },
		{ extension: 'usf', application: 'Nintendo 64 Sound Format' },
		{ extension: 'cda', application: 'CD Audio Track' },
		{ extension: 'voc', application: 'Creative Voice File' },
		{ extension: 'sid', application: 'Commodore 64 SID Music' },
		{ extension: 'mod', application: 'Tracker Module Format' },
		{ extension: 'xm', application: 'FastTracker 2 Extended Module' },
		{ extension: 'it', application: 'Impulse Tracker Module' },
		{ extension: 's3m', application: 'Scream Tracker Module' },
	],

	Video: [
		{ extension: 'mp4', application: 'MPEG-4 Video', validMimeTypes: ['video/mp4'] },
		{ extension: 'm4v', application: 'MPEG-4 Video', validMimeTypes: ['video/x-m4v'] },
		{ extension: 'mov', application: 'QuickTime Video', validMimeTypes: ['video/quicktime'] },
		{ extension: 'avi', application: 'AVI Video', validMimeTypes: ['video/x-msvideo'] },
		{ extension: 'wmv', application: 'Windows Media Video', validMimeTypes: ['video/x-ms-wmv'] },
		{
			extension: 'asf',
			application: 'Advanced Systems Format',
			validMimeTypes: ['video/x-ms-asf'],
		},
		{ extension: 'mkv', application: 'Matroska Video', validMimeTypes: ['video/x-matroska'] },
		{ extension: 'webm', application: 'WebM Video', validMimeTypes: ['video/webm'] },
		{ extension: 'flv', application: 'Flash Video', validMimeTypes: ['video/x-flv'] },
		{ extension: 'f4v', application: 'Adobe Flash MP4', validMimeTypes: ['video/x-f4v'] },
		{ extension: '3gp', application: '3GPP Video', validMimeTypes: ['video/3gpp'] },
		{ extension: '3g2', application: '3GPP2 Video', validMimeTypes: ['video/3gpp2'] },
		{ extension: 'ogv', application: 'OGG Video', validMimeTypes: ['video/ogg'] },
		{ extension: 'mts', application: 'MPEG Transport Stream' },
		{ extension: 'm2ts', application: 'Blu-ray MPEG-2 Transport Stream' },
		{ extension: 'vob', application: 'DVD Video Object', validMimeTypes: ['video/dvd'] },
		{ extension: 'ifo', application: 'DVD Information File' },
		{ extension: 'bup', application: 'DVD Backup File' },
		{ extension: 'mxf', application: 'Material Exchange Format' },
		{ extension: 'gxf', application: 'General eXchange Format' },
		{
			extension: 'rm',
			application: 'RealMedia Video',
			validMimeTypes: ['application/vnd.rn-realmedia'],
		},
		{ extension: 'rmvb', application: 'RealMedia Variable Bitrate' },
		{ extension: 'divx', application: 'DivX Video Format' },
		{ extension: 'xvid', application: 'XviD Encoded Video' },
		{ extension: 'dvr-ms', application: 'Windows Media Center Recorded TV Show' },
		{ extension: 'amv', application: 'Anime Music Video Format' },
		{ extension: 'yuv', application: 'YUV Encoded Video' },
		{ extension: 'vp8', application: 'VP8 Encoded Video' },
		{ extension: 'vp9', application: 'VP9 Encoded Video' },
		{ extension: 'hevc', application: 'High Efficiency Video Codec (H.265)' },
		{ extension: 'h264', application: 'Advanced Video Codec (H.264)' },
		{ extension: 'h265', application: 'High Efficiency Video Codec (H.265)' },
		{ extension: 'av1', application: 'AOMedia Video 1 (AV1)' },
		{ extension: 'prores', application: 'Apple ProRes' },
		{ extension: 'cineform', application: 'GoPro CineForm Codec' },
		{ extension: 'dnxhd', application: 'Avid DNxHD Codec' },
		{ extension: 'braw', application: 'Blackmagic RAW Video' },
		{ extension: 'ser', application: 'SER Astronomy Video Format' },
		{ extension: 'mjpg', application: 'Motion JPEG Video' },
		{ extension: 'mj2', application: 'Motion JPEG 2000' },
		{ extension: 'ivf', application: 'Indeo Video Format' },
		{ extension: 'ivr', application: 'Internet Video Recording' },
		{ extension: 'vrvideo', application: 'Virtual Reality Video' },
		{ extension: 'tiffseq', application: 'TIFF Image Sequence' },
		{ extension: 'dpx', application: 'Digital Picture Exchange (DPX)' },
		{ extension: 'cin', application: 'Cineon Image File' },
		{ extension: 'fli', application: 'Autodesk FLI Animation' },
		{ extension: 'flc', application: 'Autodesk FLC Animation' },
		{ extension: 'mve', application: 'Interplay MVE Video' },
		{ extension: 'rpl', application: 'Replay Video Format' },
		{ extension: 'smk', application: 'Smacker Video' },
		// Subtitles (Added)
		{ extension: 'srt', application: 'SubRip Subtitle', validMimeTypes: ['application/x-subrip'] },
		{ extension: 'vtt', application: 'Web Video Text Tracks', validMimeTypes: ['text/vtt'] },
		{ extension: 'sub', application: 'MicroDVD Subtitle' },
		{ extension: 'sbv', application: 'YouTube Subtitle' },
		{ extension: 'ass', application: 'Advanced Substation Alpha' },
		{ extension: 'ssa', application: 'Substation Alpha' },
	],

	Image: [
		{ extension: 'jpg', application: 'JPEG Image', validMimeTypes: ['image/jpeg'] },
		{ extension: 'jpeg', application: 'JPEG Image', validMimeTypes: ['image/jpeg'] },
		{ extension: 'png', application: 'PNG Image', validMimeTypes: ['image/png'] },
		{ extension: 'gif', application: 'GIF Image', validMimeTypes: ['image/gif'] },
		{ extension: 'bmp', application: 'Bitmap Image', validMimeTypes: ['image/bmp'] },
		{ extension: 'webp', application: 'WebP Image', validMimeTypes: ['image/webp'] },
		{ extension: 'apng', application: 'Animated PNG', validMimeTypes: ['image/apng'] },
		{ extension: 'ico', application: 'Icon File', validMimeTypes: ['image/vnd.microsoft.icon'] },
		{ extension: 'tiff', application: 'TIFF Image', validMimeTypes: ['image/tiff'] },
		{ extension: 'tif', application: 'TIFF Image', validMimeTypes: ['image/tiff'] },
		{
			extension: 'heif',
			application: 'High Efficiency Image Format',
			validMimeTypes: ['image/heif'],
		},
		{
			extension: 'heic',
			application: 'High Efficiency Image Codec',
			validMimeTypes: ['image/heic'],
		},
		{ extension: 'jp2', application: 'JPEG 2000', validMimeTypes: ['image/jp2'] },
		{ extension: 'j2k', application: 'JPEG 2000', validMimeTypes: ['image/jp2'] },
		{ extension: 'exr', application: 'OpenEXR', validMimeTypes: ['image/x-exr'] },
		{ extension: 'hdr', application: 'Radiance HDR', validMimeTypes: ['image/vnd.radiance'] },
		{
			extension: 'psd',
			application: 'Adobe Photoshop Document',
			validMimeTypes: ['image/vnd.adobe.photoshop'],
		},
		{ extension: 'xcf', application: 'GIMP Image Format' },
		{ extension: 'dds', application: 'DirectDraw Surface', validMimeTypes: ['image/vnd.ms-dds'] },
		{ extension: 'pcx', application: 'ZSoft PCX', validMimeTypes: ['image/x-pcx'] },
		{ extension: 'iff', application: 'Amiga Interchange File Format' },
		{ extension: 'tga', application: 'Truevision TGA', validMimeTypes: ['image/x-targa'] },
		{ extension: 'icns', application: 'Apple Icon Image' },
		{ extension: 'procreate', application: 'Procreate Image' }, // Added
		{ extension: 'raw', application: 'General RAW Image Format' },
		{ extension: 'cr2', application: 'Canon RAW Image' },
		{ extension: 'cr3', application: 'Canon RAW Image' },
		{ extension: 'nef', application: 'Nikon RAW Image' },
		{ extension: 'nrw', application: 'Nikon RAW Image' },
		{ extension: 'arw', application: 'Sony RAW Image' },
		{ extension: 'srf', application: 'Sony RAW Image' },
		{ extension: 'sr2', application: 'Sony RAW Image' },
		{ extension: 'orf', application: 'Olympus RAW Image' },
		{ extension: 'rw2', application: 'Panasonic RAW Image' },
		{ extension: 'raf', application: 'Fuji RAW Image' },
		{ extension: 'dng', application: 'Adobe Digital Negative' },
		{ extension: 'pef', application: 'Pentax RAW Image' },
		{ extension: 'bay', application: 'Casio RAW Image' },
		{ extension: 'rwl', application: 'Leica RAW Image' },
		{ extension: 'ktx', application: 'Khronos Texture Format' },
		{ extension: 'pvr', application: 'PowerVR Texture Compression' },
		{ extension: 'txd', application: 'RenderWare Texture Dictionary' },
		{ extension: 'vtf', application: 'Valve Texture Format' },
		{ extension: 'anm', application: 'Animation Frame Sequence' },
		{ extension: 'flif', application: 'Free Lossless Image Format' },
		{ extension: 'jp3', application: 'JPEG 3000 Legacy Format' },
		{ extension: 'jbig', application: 'JBIG Image Format' },
		{ extension: 'jbig2', application: 'JBIG2 Image Format' },
		{ extension: 'xpm', application: 'X PixMap Format' },
		{ extension: 'sun', application: 'Sun Raster Image' },
		{ extension: 'sgi', application: 'Silicon Graphics Image' },
		{ extension: 'ras', application: 'Sun Raster Image' },
		{ extension: 'pgm', application: 'Portable GrayMap' },
		{ extension: 'pbm', application: 'Portable Bitmap' },
		{ extension: 'ppm', application: 'Portable PixMap' },
		{ extension: 'xbm', application: 'X Bitmap Image' },
		{ extension: 'mng', application: 'Multiple-image Network Graphics' },
		{ extension: 'jps', application: 'JPEG Stereo Image' },
		{ extension: 'mpo', application: 'Multi-Picture Object' },
		{ extension: 'dcx', application: 'Multi-Page PCX' },
		{ extension: 'otb', application: 'Nokia Over The Air Bitmap' },
		{ extension: 'pgf', application: 'Progressive Graphics Format' },
	],

	Vector: [
		{
			extension: 'svg',
			application: 'Scalable Vector Graphics',
			validMimeTypes: ['image/svg+xml'],
		},
		{
			extension: 'eps',
			application: 'Encapsulated PostScript',
			validMimeTypes: ['application/postscript'],
		},
		{
			extension: 'ai',
			application: 'Adobe Illustrator File',
			validMimeTypes: ['application/postscript'],
		},
		{ extension: 'cdr', application: 'CorelDRAW File' },
		{ extension: 'emf', application: 'Enhanced Metafile' },
		{ extension: 'wmf', application: 'Windows Metafile' },
		{ extension: 'sketch', application: 'Sketch Design File' },
		{ extension: 'fig', application: 'Figma Design File' }, // Added
		{ extension: 'xd', application: 'Adobe XD File' }, // Added
		{ extension: 'cgm', application: 'Computer Graphics Metafile' },
		{ extension: 'fxg', application: 'Flash XML Graphics File' },
		{ extension: 'pict', application: 'Apple PICT File' },
		{ extension: 'swf', application: 'Shockwave Flash Vector File' },
		{ extension: 'xar', application: 'Xara Vector File' },
		{ extension: 'shp', application: 'ESRI Shapefile' },
		{ extension: 'shx', application: 'ESRI Shapefile Index' },
		{ extension: 'dbf', application: 'Shapefile Database Format' },
		{ extension: 'geojson', application: 'Geospatial JSON File' },
		{ extension: 'topojson', application: 'Topological JSON File' },
		{ extension: 'gpx', application: 'GPS Exchange Format' },
		{ extension: 'kml', application: 'Keyhole Markup Language' },
		{ extension: 'kmz', application: 'Compressed KML File' },
		{ extension: 'gml', application: 'Geography Markup Language' },
		{ extension: 'dgn', application: 'MicroStation Design File' },
	],

	Medical: [
		{ extension: 'dcm', application: 'DICOM Medical Image', validMimeTypes: ['application/dicom'] },
		{ extension: 'nii', application: 'NIfTI Neuroimaging Format' },
		{ extension: 'mha', application: 'MetaImage Format' },
		{ extension: 'mhd', application: 'MetaImage Format Header' },
	],

	Scientific: [
		{ extension: 'fits', application: 'Flexible Image Transport System (FITS)' },
		{ extension: 'czi', application: 'Carl Zeiss Image Data Format' },
		{ extension: 'lif', application: 'Leica Image File' },
		{ extension: 'nd2', application: 'Nikon ND2 Microscopy Image' },
		{ extension: 'gel', application: 'Gel Electrophoresis Image' },
		{ extension: 'spe', application: 'Spectral Imaging File' },
	],

	Compression: [
		{ extension: 'zip', validMimeTypes: ['application/zip'] },
		{ extension: 'rar', validMimeTypes: ['application/vnd.rar'] },
		{ extension: '7z', validMimeTypes: ['application/x-7z-compressed'] },
		{ extension: 'tar', validMimeTypes: ['application/x-tar'] },
		{ extension: 'gz', validMimeTypes: ['application/gzip'] },
		{ extension: 'tgz', validMimeTypes: ['application/gzip'] }, // Added
		{ extension: 'bz2', validMimeTypes: ['application/x-bzip2'] }, // Added
		{ extension: 'xz', validMimeTypes: ['application/x-xz'] }, // Added
		{ extension: 'zst', validMimeTypes: ['application/zstd'] }, // Added
	],

	Executable: [
		{
			extension: 'exe',
			application: 'Windows Executable',
			validMimeTypes: ['application/x-msdownload'],
		},
		{ extension: 'msi', application: 'Windows Installer', validMimeTypes: ['application/x-msi'] },
		{
			extension: 'dmg',
			application: 'Apple Disk Image',
			validMimeTypes: ['application/x-apple-diskimage'],
		},
		{
			extension: 'apk',
			application: 'Android Package',
			validMimeTypes: ['application/vnd.android.package-archive'],
		}, // Added
		{
			extension: 'ipa',
			application: 'iOS App Store Package',
			validMimeTypes: ['application/octet-stream'],
		}, // Added
		{
			extension: 'deb',
			application: 'Debian Software Package',
			validMimeTypes: ['application/vnd.debian.binary-package'],
		}, // Added
		{
			extension: 'rpm',
			application: 'Red Hat Package Manager',
			validMimeTypes: ['application/x-rpm'],
		}, // Added
		{
			extension: 'iso',
			application: 'Disc Image File',
			validMimeTypes: ['application/x-iso9660-image'],
		}, // Added
		{ extension: 'img', application: 'Disk Image File' }, // Added
		{
			extension: 'dll',
			application: 'Dynamic Link Library',
			validMimeTypes: ['application/x-msdownload'],
		}, // Added
	],

	Code: [
		{
			extension: 'js',
			application: 'JavaScript',
			validMimeTypes: ['text/javascript', 'application/javascript'],
		},
		{ extension: 'mjs', application: 'ES Modules JavaScript' },
		{ extension: 'cjs', application: 'CommonJS JavaScript' },
		{ extension: 'ts', application: 'TypeScript', validMimeTypes: ['application/typescript'] },
		{ extension: 'tsx', application: 'TypeScript JSX' },
		{ extension: 'jsx', application: 'JavaScript JSX' },
		{ extension: 'java', application: 'Java', validMimeTypes: ['text/x-java-source'] },
		{ extension: 'kt', application: 'Kotlin', validMimeTypes: ['text/x-kotlin'] },
		{ extension: 'kts', application: 'Kotlin Script' },
		{ extension: 'py', application: 'Python', validMimeTypes: ['text/x-python'] },
		{ extension: 'pyc', application: 'Compiled Python File' },
		{ extension: 'pyo', application: 'Optimized Python File' },
		{ extension: 'rpy', application: "Ren'Py Script" },
		{ extension: 'rb', application: 'Ruby', validMimeTypes: ['text/x-ruby'] },
		{ extension: 'php', application: 'PHP', validMimeTypes: ['application/x-httpd-php'] },
		{ extension: 'swift', application: 'Swift' },
		{ extension: 'go', application: 'Go', validMimeTypes: ['text/x-go'] },
		{ extension: 'rs', application: 'Rust' },
		{ extension: 'dart', application: 'Dart', validMimeTypes: ['application/dart'] },
		{ extension: 'lua', application: 'Lua', validMimeTypes: ['text/x-lua'] },
		{ extension: 'r', application: 'R Language', validMimeTypes: ['text/x-r'] },
		{ extension: 'pl', application: 'Perl', validMimeTypes: ['text/x-perl'] },
		{ extension: 'tcl', application: 'Tcl Script' },
		{ extension: 'sh', application: 'Shell Script', validMimeTypes: ['application/x-sh'] },
		{ extension: 'bash', application: 'Bash Script' },
		{ extension: 'zsh', application: 'Zsh Script' },
		{ extension: 'fish', application: 'Fish Shell Script' },
		{ extension: 'ps1', application: 'PowerShell Script' },
		{ extension: 'bat', application: 'Batch Script' },
		{ extension: 'cmd', application: 'Windows Command Script' },
		{ extension: 'ahk', application: 'AutoHotkey Script' },
		{ extension: 'c', application: 'C Language', validMimeTypes: ['text/x-csrc'] },
		{ extension: 'i', application: 'C Preprocessed File' },
		{ extension: 'cpp', application: 'C++', validMimeTypes: ['text/x-c++src'] },
		{ extension: 'cc', application: 'C++' },
		{ extension: 'cxx', application: 'C++' },
		{ extension: 'h', application: 'C Header File' },
		{ extension: 'hpp', application: 'C++ Header File' },
		{ extension: 'cs', application: 'C#', validMimeTypes: ['text/x-csharp'] },
		{ extension: 'fs', application: 'F#' },
		{ extension: 'ml', application: 'OCaml/ML' },
		{ extension: 'nim', application: 'Nim Language' },
		{ extension: 'html', application: 'HTML', validMimeTypes: ['text/html'] },
		{ extension: 'htm', application: 'HTML', validMimeTypes: ['text/html'] },
		{ extension: 'css', application: 'CSS', validMimeTypes: ['text/css'] },
		{ extension: 'scss', application: 'SASS/SCSS' },
		{ extension: 'sass', application: 'SASS/SCSS' },
		{ extension: 'less', application: 'LESS' },
		{ extension: 'vue', application: 'Vue.js' },
		{ extension: 'svelte', application: 'Svelte' },
		{ extension: 'astro', application: 'Astro' },
		{ extension: 'jsonc', application: 'JSON with Comments' },
		{ extension: 'json5', application: 'JSON5' },
		{ extension: 'lock', application: 'Lockfile' },
		{ extension: 'vbs', application: 'VBScript' },
		{ extension: 'wsf', application: 'Windows Script File' },
		{ extension: 'asm', application: 'Assembly Language' },
		{ extension: 's', application: 'Assembly Language' },
		{ extension: 'a51', application: 'Assembly 8051' },
		{ extension: 'm68k', application: 'Motorola 68K Assembly' },
		{ extension: 'vhdl', application: 'VHDL Hardware Description' },
		{ extension: 'verilog', application: 'Verilog Hardware Description' },
		{ extension: 'v', application: 'Verilog' },
		{ extension: 'sv', application: 'SystemVerilog' },
		{ extension: 'clj', application: 'Clojure' },
		{ extension: 'cljs', application: 'ClojureScript' },
		{ extension: 'lisp', application: 'Lisp' },
		{ extension: 'el', application: 'Emacs Lisp' },
		{ extension: 'scm', application: 'Scheme' },
		{ extension: 'pro', application: 'Prolog' },
		{ extension: 'awk', application: 'AWK Script' },
		{ extension: 'sed', application: 'SED Script' },
		{ extension: 'wasm', application: 'WebAssembly Binary File' },
		{ extension: 'wast', application: 'WebAssembly Text File' },
		{ extension: 'godot', application: 'Godot Engine Script' },
		{ extension: 'pck', application: 'Godot Engine Pack' },
		{ extension: 'gd', application: 'GDScript' },
		{ extension: 'makefile', application: 'Makefile' },
		{ extension: 'ninja', application: 'Ninja Build File' },
		{ extension: 'cmake', application: 'CMake Build Script' },
		{ extension: 'gradle', application: 'Gradle Build Script' },
		{ extension: 'maven', application: 'Maven POM File' },
		{ extension: 'graphql', application: 'GraphQL Schema' },
		{ extension: 'cloudfunctions', application: 'Google Cloud Functions' },
		{ extension: 'lambda', application: 'AWS Lambda Function' },
		{ extension: 'serverless.yml', application: 'Serverless Framework' },
		{
			extension: 'tf',
			application: 'Terraform Configuration',
			validMimeTypes: ['application/hcl'],
		}, // Added
		{ extension: 'tfvars', application: 'Terraform Variables' }, // Added
		{ extension: 'toml', application: 'TOML Configuration', validMimeTypes: ['application/toml'] }, // Added
		{ extension: 'dockerfile', application: 'Docker Build File' }, // Added
		{
			extension: 'ipynb',
			application: 'Jupyter Notebook',
			validMimeTypes: ['application/x-ipynb+json'],
		}, // Added
		{ extension: 'prisma', application: 'Prisma Schema' }, // Added
		{ extension: 'repl', application: 'REPL Script' },
		{ extension: 'robots.txt', application: 'Robots.txt for Web Crawlers' },
		{ extension: 'htaccess', application: 'Apache Configuration' },
		{ extension: 'htpasswd', application: 'Apache User Password File' },
	],

	'3D': [
		{ extension: 'obj', application: 'Wavefront OBJ File', validMimeTypes: ['model/obj'] },
		{ extension: 'mtl', application: 'Wavefront Material File' },
		{ extension: 'fbx', application: 'Autodesk FBX Format' },
		{
			extension: 'dae',
			application: 'COLLADA 3D Model Format',
			validMimeTypes: ['model/vnd.collada+xml'],
		},
		{
			extension: 'gltf',
			application: 'GL Transmission Format',
			validMimeTypes: ['model/gltf+json'],
		},
		{ extension: 'glb', application: 'Binary GLTF Model', validMimeTypes: ['model/gltf-binary'] },
		{ extension: 'stl', application: 'Stereolithography 3D Model', validMimeTypes: ['model/stl'] },
		{ extension: '3ds', application: '3D Studio Mesh' },
		{ extension: 'max', application: 'Autodesk 3ds Max Scene' },
		{ extension: 'blend', application: 'Blender Project File' },
		{ extension: 'abc', application: 'Alembic 3D File' },
		{ extension: 'usd', application: 'Universal Scene Description' },
		{ extension: 'usda', application: 'Universal Scene Description ASCII' },
		{ extension: 'usdz', application: 'Universal Scene Description Zip Archive' },
		{ extension: 'rvt', application: 'Autodesk Revit Model' },
		{ extension: 'rfa', application: 'Autodesk Revit Family File' },
		{ extension: 'skp', application: 'SketchUp Model' },
		{ extension: 'layout', application: 'SketchUp Layout File' },
		{ extension: 'pln', application: 'ArchiCAD Project File' },
		{ extension: 'gsm', application: 'ArchiCAD Library Object File' },
		{ extension: '3dm', application: 'Rhinoceros 3D Model File' },
		{ extension: 'igs', application: 'IGES Model File', validMimeTypes: ['model/iges'] },
		{
			extension: 'iges',
			application: 'Initial Graphics Exchange Specification',
			validMimeTypes: ['model/iges'],
		},
		{ extension: 'step', application: 'STEP 3D Model File', validMimeTypes: ['model/step'] },
		{ extension: 'stp', application: 'STEP 3D Model File', validMimeTypes: ['model/step'] },
		{ extension: 'x_t', application: 'Parasolid Model File' },
		{ extension: 'x_b', application: 'Parasolid Binary File' },
		{ extension: 'brep', application: 'Boundary Representation Model' },
		{ extension: 'sldprt', application: 'SolidWorks Part File' },
		{ extension: 'sldasm', application: 'SolidWorks Assembly File' },
		{ extension: 'slddrw', application: 'SolidWorks Drawing File' },
		{ extension: 'prt', application: 'PTC Creo Part File' },
		{ extension: 'neu', application: 'Neutral CAD File' },
		{ extension: 'ifc', application: 'Industry Foundation Classes (IFC)' },
		{ extension: 'ifczip', application: 'Compressed IFC File' },
		{ extension: 'sat', application: 'ACIS SAT 3D Model' },
		{ extension: 'catpart', application: 'CATIA Part File' },
		{ extension: 'catproduct', application: 'CATIA Product File' },
		{ extension: 'cgr', application: 'CATIA Graphical Representation' },
		{
			extension: 'gcode',
			application: 'G-Code CNC Instructions',
			validMimeTypes: ['text/x-gcode'],
		},
		{ extension: 'nc', application: 'Numerical Control File' },
		{ extension: 'tap', application: 'CNC Machine Toolpath File' },
		{ extension: '3mf', application: '3D Manufacturing Format' },
		{ extension: 'x3d', application: 'Extensible 3D Graphics' },
		{ extension: 'wrl', application: 'VRML Virtual Reality Modeling Language' },
		{ extension: 'ply', application: 'Polygon File Format' },
		{ extension: 'bvh', application: 'Biovision Hierarchy Animation' },
		{ extension: 'c3d', application: 'C3D Motion Capture Data' },
		{ extension: 'anim', application: 'Maya Animation File' },
		{ extension: 'xaf', application: '3ds Max Animation File' },
		{ extension: 'xsf', application: '3ds Max Skeleton File' },
		{ extension: 'mdd', application: 'Motion Designer Data' },
		{ extension: 'vrm', application: 'Virtual Reality Model' },
		{ extension: 'scn', application: 'Godot Engine Scene' },
		{ extension: 'res', application: 'Godot Engine Resource' },
		{ extension: 'unitypackage', application: 'Unity Package File' },
		{ extension: 'prefab', application: 'Unity Prefab File' },
		{ extension: 'uasset', application: 'Unreal Engine Asset File' },
		{ extension: 'umap', application: 'Unreal Engine Map File' },
		{ extension: 'lwo', application: 'LightWave Object' },
		{ extension: 'lws', application: 'LightWave Scene' },
		{ extension: 'cob', application: 'Caligari TrueSpace Object' },
		{ extension: 'x', application: 'DirectX 3D Model' },
		{ extension: 'ac', application: 'AC3D Model File' },
		{ extension: 'iv', application: 'Open Inventor File' },
	],

	Database: [
		{ extension: 'db', application: 'Generic Database File' },
		{
			extension: 'sqlite',
			application: 'SQLite Database File',
			validMimeTypes: ['application/vnd.sqlite3'],
		},
		{ extension: 'sqlite3', application: 'SQLite 3 Database File' },
		{ extension: 'db3', application: 'SQLite 3 Database File' },
		{
			extension: 'mdb',
			application: 'Microsoft Access Database',
			validMimeTypes: ['application/x-msaccess'],
		},
		{
			extension: 'accdb',
			application: 'Microsoft Access Database (2007+)',
			validMimeTypes: ['application/vnd.ms-access'],
		},
		{ extension: 'frm', application: 'MySQL Table Definition File' },
		{ extension: 'myd', application: 'MySQL Data File' },
		{ extension: 'myi', application: 'MySQL Index File' },
		{
			extension: 'sql',
			application: 'Structured Query Language Script',
			validMimeTypes: ['application/sql'],
		},
		{ extension: 'bak', application: 'Database Backup File' },
		{ extension: 'ibd', application: 'InnoDB Data File' },
		{ extension: 'mssql', application: 'Microsoft SQL Server Database' },
		{ extension: 'mdf', application: 'Microsoft SQL Server Primary Database File' },
		{ extension: 'ldf', application: 'Microsoft SQL Server Log File' },
		{ extension: 'ndf', application: 'Microsoft SQL Server Secondary Database File' },
		{ extension: 'ora', application: 'Oracle Database File' },
		{ extension: 'dmp', application: 'Oracle Database Dump File' },
		{ extension: 'accde', application: 'Microsoft Access Executable File' },
		{ extension: 'adp', application: 'Access Data Project' },
		{ extension: 'bson', application: 'Binary JSON (MongoDB Data File)' },
		{ extension: 'fdb', application: 'Firebird Database File' },
		{ extension: 'gdb', application: 'InterBase Database File' },
		{ extension: 'neo4j', application: 'Neo4j Graph Database File' },
		{ extension: 'arangodb', application: 'ArangoDB Database File' },
		{ extension: 'realm', application: 'Realm Database File' },
		{ extension: 'couchdb', application: 'CouchDB Database File' },
		{ extension: 'rdb', application: 'Redis Database File' },
		{ extension: 'dat', application: 'Generic Database Data File' },
		{ extension: 'rox', application: 'RocksDB Data File' },
		{ extension: 'ldb', application: 'LevelDB Database File' },
		{ extension: 'exp', application: 'Export File' },
		{ extension: 'bkp', application: 'Backup Database File' },
		{ extension: 'xsql', application: 'XML SQL Export File' },
		{ extension: 'wdb', application: 'Microsoft Works Database' },
		{ extension: 'sdf', application: 'SQL Server Compact Edition Database' },
		{ extension: 'pdb', application: 'Palm Database File' },
		{ extension: 'cdb', application: 'Pocket Access Database' },
		{ extension: 'cnf', application: 'Database Configuration File' },
		{ extension: 'cub', application: 'Analysis Services Cube File' },
		{ extension: 'olap', application: 'Online Analytical Processing Cube' },
		{ extension: 'vw', application: 'Database View File' },
		{ extension: 'nsf', application: 'Lotus Notes Database' },
		{ extension: 'ntf', application: 'Lotus Notes Template File' },
		{ extension: 'dbx', application: 'Outlook Express Database File' },
		{ extension: 'edb', application: 'Exchange Database File' },
		{ extension: 'fp3', application: 'FileMaker Pro 3 Database' },
		{ extension: 'fp5', application: 'FileMaker Pro 5 Database' },
		{ extension: 'fp7', application: 'FileMaker Pro 7 Database' },
		{ extension: 'gdbtable', application: 'ArcGIS Geodatabase Table File' },
		{ extension: 'gdbindex', application: 'ArcGIS Geodatabase Index File' },
	],

	Data: [
		{ extension: 'csv', application: 'Comma-Separated Values File', validMimeTypes: ['text/csv'] },
		{
			extension: 'tsv',
			application: 'Tab-Separated Values File',
			validMimeTypes: ['text/tab-separated-values'],
		},
		{ extension: 'psv', application: 'Pipe-Separated Values File' },
		{
			extension: 'json',
			application: 'JavaScript Object Notation',
			validMimeTypes: ['application/json'],
		},
		{ extension: 'jsonl', application: 'JSON Lines File', validMimeTypes: ['application/jsonl'] },
		{
			extension: 'xml',
			application: 'Extensible Markup Language',
			validMimeTypes: ['application/xml', 'text/xml'],
		},
		{
			extension: 'yaml',
			application: "YAML Ain't Markup Language",
			validMimeTypes: ['application/x-yaml'],
		},
		{
			extension: 'yml',
			application: "YAML Ain't Markup Language",
			validMimeTypes: ['application/x-yaml'],
		},
		{
			extension: 'rdf',
			application: 'Resource Description Framework',
			validMimeTypes: ['application/rdf+xml'],
		},
		{ extension: 'ttl', application: 'Turtle RDF Data' },
		{ extension: 'n3', application: 'Notation3 RDF Data' },
		{ extension: 'msgpack', application: 'MessagePack Serialized Data' },
		{ extension: 'ubj', application: 'Universal Binary JSON' },
		{ extension: 'arff', application: 'Attribute-Relation File Format (WEKA)' },
		{ extension: 'dta', application: 'Stata Data File' },
		{ extension: 'sav', application: 'SPSS Data File' },
		{ extension: 'por', application: 'SPSS Portable Data File' },
		{ extension: 'sd2', application: 'SAS Data File' },
		{ extension: 'xpt', application: 'SAS Transport File' },
		{ extension: 'rdata', application: 'R Statistical Data File' },
		{ extension: 'rds', application: 'R Serialized Data File' },
		{ extension: 'mat', application: 'MATLAB Data File' },
		{ extension: 'grib', application: 'GRIB Meteorological Data' },
		{ extension: 'pcap', application: 'Packet Capture File' },
		{ extension: 'pcapng', application: 'Packet Capture Next Generation' },
		{ extension: 'las', application: 'LIDAR Point Cloud Data' },
		{ extension: 'xyz', application: 'XYZ Point Cloud Data' },
		{ extension: 'fasta', application: 'FASTA Sequence File' },
		{ extension: 'fastq', application: 'FASTQ Sequence File' },
		{ extension: 'bam', application: 'Binary Alignment Map' },
		{ extension: 'sam', application: 'Sequence Alignment Map' },
		{ extension: 'vcf', application: 'Variant Call Format' },
		{ extension: 'gff', application: 'General Feature Format' },
		{ extension: 'gtf', application: 'Gene Transfer Format' },
		{ extension: 'pkl', application: 'Pickle Serialized Data' },
		{ extension: 'joblib', application: 'Joblib Serialized Model' },
		{ extension: 'npy', application: 'NumPy Binary File' },
		{ extension: 'npz', application: 'NumPy Compressed Archive' },
		{ extension: 'h5', application: 'HDF5 Data Format' },
		{ extension: 'pb', application: 'TensorFlow Model File' },
		{ extension: 'onnx', application: 'Open Neural Network Exchange Format' },
		{
			extension: 'parquet',
			application: 'Apache Parquet Data Format',
			validMimeTypes: ['application/vnd.apache.parquet'],
		},
		{ extension: 'avro', application: 'Apache Avro Data File' },
		{ extension: 'orc', application: 'Optimized Row Columnar Data File' },
		{ extension: 'feather', application: 'Feather Data File' },
		{ extension: 'zarr', application: 'Zarr Compressed Data File' },
		{ extension: 'log', application: 'Log File', validMimeTypes: ['text/plain'] },
		{ extension: 'ini', application: 'Configuration File' },
		{ extension: 'cfg', application: 'Configuration File' },
		{ extension: 'properties', application: 'Java Properties File' },
	],

	Font: [
		{ extension: 'ttf', application: 'TrueType Font', validMimeTypes: ['font/ttf'] },
		{ extension: 'otf', application: 'OpenType Font', validMimeTypes: ['font/otf'] },
		{ extension: 'woff', application: 'Web Open Font Format', validMimeTypes: ['font/woff'] },
		{ extension: 'woff2', application: 'Web Open Font Format 2', validMimeTypes: ['font/woff2'] },
		{
			extension: 'eot',
			application: 'Embedded OpenType Font',
			validMimeTypes: ['application/vnd.ms-fontobject'],
		},
		{ extension: 'dfont', application: 'Mac OS Data Fork Font' },
		{ extension: 'bdf', application: 'Bitmap Distribution Format' },
		{ extension: 'pcf', application: 'Portable Compiled Format' },
		{ extension: 'fnt', application: 'Windows Bitmap Font' },
		{ extension: 'psf', application: 'PC Screen Font' },
		{ extension: 'pfb', application: 'PostScript Type 1 Font Binary' },
		{ extension: 'pfm', application: 'PostScript Type 1 Font Metrics' },
		{ extension: 'afm', application: 'Adobe Font Metrics' },
		{ extension: 'fon', application: 'Windows FON Bitmap Font' },
		{ extension: 'txf', application: 'Texture Font Format' },
		{ extension: 'ps', application: 'PostScript Font' },
		{ extension: 'chm', application: 'Compiled HTML Help Font' },
	],

	// New Category: Security
	Security: [
		{
			extension: 'crt',
			application: 'Security Certificate',
			validMimeTypes: ['application/x-x509-ca-cert'],
		},
		{ extension: 'cer', application: 'Security Certificate' },
		{
			extension: 'pem',
			application: 'Privacy Enhanced Mail Certificate',
			validMimeTypes: ['application/x-pem-file'],
		},
		{ extension: 'key', application: 'Private Key File' }, // Distinct from Presentation 'key'
		{ extension: 'pub', application: 'Public Key File' },
		{
			extension: 'p12',
			application: 'PKCS#12 Certificate Store',
			validMimeTypes: ['application/x-pkcs12'],
		},
		{
			extension: 'pfx',
			application: 'PKCS#12 Certificate Store',
			validMimeTypes: ['application/x-pkcs12'],
		},
		{ extension: 'asc', application: 'PGP Armored Key' },
		{ extension: 'gpg', application: 'GNU Privacy Guard Key' },
		{ extension: 'keystore', application: 'Java Keystore File' },
	],

	System: [
		// 🪟 WINDOWS SYSTEM FILES
		{
			extension: 'sys',
			application: 'Windows System File',
			validMimeTypes: ['application/octet-stream'],
		},
		{
			extension: 'dll',
			application: 'Dynamic Link Library',
			validMimeTypes: ['application/x-msdownload'],
		},
		{ extension: 'drv', application: 'Windows Hardware Driver' },
		{ extension: 'cpl', application: 'Windows Control Panel Item' },
		{ extension: 'msc', application: 'Microsoft Management Console Snap-in' },
		{
			extension: 'reg',
			application: 'Windows Registry Entry',
			validMimeTypes: ['text/x-ms-regedit'],
		},
		{
			extension: 'inf',
			application: 'Setup Information File',
			validMimeTypes: ['application/inf'],
		},
		{
			extension: 'lnk',
			application: 'Windows Shortcut',
			validMimeTypes: ['application/x-ms-shortcut'],
		},
		{ extension: 'pif', application: 'Program Information File' },
		{ extension: 'cur', application: 'Windows Cursor' },
		{ extension: 'ani', application: 'Animated Windows Cursor' },
		{ extension: 'minidump', application: 'Windows Memory Dump' },
		{ extension: 'dmp', application: 'System Memory Dump' }, // Note: Can conflict with Oracle DB .dmp
		{
			extension: 'cab',
			application: 'Windows Cabinet File',
			validMimeTypes: ['application/vnd.ms-cab-compressed'],
		},

		// 🍎 MACOS SYSTEM FILES
		{ extension: 'ds_store', application: 'macOS Folder Settings' },
		{
			extension: 'plist',
			application: 'macOS Property List',
			validMimeTypes: ['application/x-plist'],
		},
		{ extension: 'kext', application: 'macOS Kernel Extension' },
		{ extension: 'webloc', application: 'macOS Web Shortcut' },
		{ extension: 'mobileconfig', application: 'Apple Configuration Profile' },

		// 🐧 LINUX / UNIX SYSTEM FILES
		{
			extension: 'so',
			application: 'Shared Object Library',
			validMimeTypes: ['application/x-sharedlib'],
		},
		{ extension: 'ko', application: 'Kernel Object Module' },
		{ extension: 'pid', application: 'Process ID File' },
		{ extension: 'sock', application: 'Unix Socket File' },
		{ extension: 'swap', application: 'Swap File' },
		{ extension: 'rc', application: 'Run Command Configuration' }, // e.g., .bashrc, .vimrc

		// 🗑️ TEMPORARY & BACKUP
		{ extension: 'tmp', application: 'Temporary File' },
		{ extension: 'temp', application: 'Temporary File' },
		{ extension: 'bak', application: 'Generic Backup File' },
		{ extension: 'swp', application: 'Vim Swap File' },
		{ extension: 'old', application: 'Backup / Old Version File' },
		{ extension: 'log', application: 'System Log File', validMimeTypes: ['text/plain'] },
	],
};

```

### File: packages\types\file.ts

```ts
export type FileStatus = 'pending' | 'processing' | 'ready' | 'error';

export interface FileError {
	code: string;
	message: string;
}

export interface FileWithMeta {
	file: File; // The CURRENT file (may change after processing!)
	originalFile?: File; // Keep reference to original if needed
	id: string;
	preview?: string;
	status: FileStatus;
	progress: number; // 0-100
	errors: FileError[];
	processingMeta?: Record<string, any>; // Store WASM results here
}

```

### File: packages\types\mod.ts

```ts
export * from './fields/form.ts';
export * from './fields/select.ts';
export * from './fields/slider.ts';
export * from './fields/text.ts';
export * from './processing.ts';
export * from './file.ts';
export * from './DateTime.ts';
export * from './currency.ts';
export * from './file/fileCategories.ts';
export * from './permissions.ts';

```

### File: packages\types\permissions.ts

```ts
// 1. Project Level
export type ProjectPermission =
	| 'manage_settings' // Edit title, archive, delete
	| 'manage_members' // Invite/kick team members
	| 'view_financials' // See total spend/budget
	| 'create_stage'; // Add new stages

// 2. Stage Level (Workflow)
export type StagePermission =
	| 'edit_details' // Change description/requirements
	| 'assign_worker' // Assign freelancer/team
	| 'fund_escrow' // Pay into escrow
	| 'submit_work' // Upload deliverables
	| 'approve_work' // Accept submission
	| 'request_revision' // Reject submission
	| 'view_private_notes'; // Internal team notes

// 3. Business/Org Level
export type BusinessPermission =
	| 'manage_billing' // Update credit cards
	| 'manage_team_roles' // Promote members
	| 'delete_business';

// 4. Platform Admin
export type AdminPermission =
	| 'view_all_users'
	| 'override_dispute'
	| 'ban_user';

```

### File: packages\types\processing.ts

```ts
export interface ProcessorResult {
	file: File; // The new, processed file (e.g. image.webp)
	metadata?: Record<string, any>; // Extra info (e.g. { compressionRatio: '40%' })
}

export interface FileProcessor {
	id: string;
	name: string; // e.g. "Image Optimizer"
	match: (file: File) => boolean; // Does this processor handle this file?
	process: (file: File, onProgress?: (pct: number) => void) => Promise<ProcessorResult>;
}

```

