/**
 * @file utils.ts
 * @description Small pure helpers shared across profile components.
 */

import type { Competency } from './contracts/Profile.ts';

/** Detects the `linear-gradient(...)` sentinel used by the mock media slots. */
export function isGradient(value?: string): boolean {
	return !!value && value.trim().startsWith('linear-gradient');
}

/** Returns an inline `background` style for either a gradient string or a URL. */
export function mediaBackground(value?: string): Record<string, string> {
	if (!value) return { background: 'var(--card-dark)' };
	if (isGradient(value)) return { backgroundImage: value };
	return {
		backgroundImage: `url("${value}")`,
		backgroundSize: 'cover',
		backgroundPosition: 'center',
	};
}

/** Ordinal weight for competency, used for the filled-pip indicator (1–4). */
export function competencyPips(c: Competency): number {
	switch (c) {
		case 'Beginner':
			return 1;
		case 'Intermediate':
			return 2;
		case 'Advanced':
			return 3;
		case 'Expert':
			return 4;
	}
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

/**
 * Current local time at a UTC offset, formatted `HH:MM`. Runs only in the
 * browser island; safe because the profile page is client-hydrated.
 */
export function localTimeAtOffset(offsetMinutes: number): string {
	const now = new Date();
	const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
	const local = new Date(utcMs + offsetMinutes * 60_000);
	return `${String(local.getHours()).padStart(2, '0')}:${
		String(local.getMinutes()).padStart(2, '0')
	}`;
}

/** Very small markdown-lite: `**bold**` → segments. Returns tokens for JSX. */
export function parseInlineBold(text: string): { text: string; bold: boolean }[] {
	const out: { text: string; bold: boolean }[] = [];
	const re = /\*\*(.+?)\*\*/g;
	let last = 0;
	let m: RegExpExecArray | null;
	while ((m = re.exec(text)) !== null) {
		if (m.index > last) out.push({ text: text.slice(last, m.index), bold: false });
		out.push({ text: m[1], bold: true });
		last = m.index + m[0].length;
	}
	if (last < text.length) out.push({ text: text.slice(last), bold: false });
	return out;
}

/** ISO date helpers (no external date lib needed for the calendar grid). */
export const isoDate = (d: Date): string =>
	`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${
		String(d.getDate()).padStart(2, '0')
	}`;

export function parseIso(iso: string): Date {
	const [y, m, d] = iso.split('-').map(Number);
	return new Date(y, m - 1, d);
}

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
