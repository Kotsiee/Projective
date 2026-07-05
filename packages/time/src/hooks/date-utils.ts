// Minimal, dependency-free date helpers for the calendar hooks/components.
// The package must not import from the app, so these mirror the small set of
// helpers the app's `utils.ts` exposes — kept local and pure.

/** Formats a Date as an ISO date string (`YYYY-MM-DD`), local time. */
export function isoDate(d: Date): string {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${
		String(d.getDate()).padStart(2, '0')
	}`;
}

/** Parses an ISO date string into a local-midnight Date. */
export function parseIso(iso: string): Date {
	const [y, m, d] = iso.split('-').map(Number);
	return new Date(y, m - 1, d);
}

/** Returns `iso` shifted by `days` (can be negative). */
export function addDays(iso: string, days: number): string {
	const d = parseIso(iso);
	d.setDate(d.getDate() + days);
	return isoDate(d);
}

/** Monday-anchored start of the week containing `iso`. */
export function startOfWeek(iso: string): string {
	const d = parseIso(iso);
	const dow = (d.getDay() + 6) % 7; // 0 = Monday
	d.setDate(d.getDate() - dow);
	return isoDate(d);
}

/** ISO weekday, 1 = Mon … 7 = Sun. */
export function isoWeekday(iso: string): number {
	return ((parseIso(iso).getDay() + 6) % 7) + 1;
}

/** Whole days from `a` to `b` (positive when `b` is later). */
export function daysBetween(a: string, b: string): number {
	return Math.round((parseIso(b).getTime() - parseIso(a).getTime()) / 86_400_000);
}

/** Today's ISO date. */
export function todayIso(): string {
	return isoDate(new Date());
}

/** The 42-day (6×7) grid for the month containing `iso`, Monday-first. */
export function monthGridDays(iso: string): string[] {
	const anchor = parseIso(iso);
	const first = isoDate(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
	const lead = isoWeekday(first) - 1; // days before the 1st to reach Monday
	const gridStart = addDays(first, -lead);
	return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

/** Formats minutes-from-midnight as `HH:MM` (24h) or `h:mm am/pm`. */
export function minutesToTime(min: number, ampm = false): string {
	const h = Math.floor(min / 60);
	const m = min % 60;
	if (ampm) {
		const period = h < 12 ? 'am' : 'pm';
		const h12 = h % 12 === 0 ? 12 : h % 12;
		return m === 0 ? `${h12} ${period}` : `${h12}:${String(m).padStart(2, '0')} ${period}`;
	}
	return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const MONTH_LABELS = [
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
