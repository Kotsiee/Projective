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
