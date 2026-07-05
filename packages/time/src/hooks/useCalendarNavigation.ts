// A self-contained date-math engine for the calendar. Owns a cursor + view and
// derives the ISO dates currently visible for the active view. Pure signal
// math — no external date library.

import { type ReadonlySignal, type Signal, useComputed, useSignal } from '@preact/signals';
import type { CalendarView } from '../types/calendar.ts';
import { addDays, isoDate, monthGridDays, parseIso, startOfWeek, todayIso } from './date-utils.ts';

export interface UseCalendarNavigationOptions {
	/** Initial cursor ISO date. Defaults to today. */
	date?: string;
	/** Initial view. Defaults to 'week'. */
	view?: CalendarView;
}

export interface CalendarNavigation {
	cursor: Signal<string>;
	view: Signal<CalendarView>;
	setView: (view: CalendarView) => void;
	goPrev: () => void;
	goNext: () => void;
	goToday: () => void;
	goToDate: (iso: string) => void;
	/** ISO dates rendered by the active view (1 day / 7 week / 42 month). */
	visibleDays: ReadonlySignal<string[]>;
}

/**
 * Drives calendar navigation: a cursor date + a view, with prev/next/today
 * stepping that respects the active view (a day, a week, or a month) and a
 * derived `visibleDays` list the views iterate over.
 */
export function useCalendarNavigation(
	opts: UseCalendarNavigationOptions = {},
): CalendarNavigation {
	const cursor = useSignal(opts.date ?? todayIso());
	const view = useSignal<CalendarView>(opts.view ?? 'week');

	const visibleDays = useComputed<string[]>(() => {
		const c = cursor.value;
		switch (view.value) {
			case 'day':
				return [c];
			case 'week':
				return Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(c), i));
			case 'month':
				return monthGridDays(c);
		}
	});

	const step = (dir: -1 | 1) => {
		const c = cursor.value;
		if (view.value === 'day') {
			cursor.value = addDays(c, dir);
		} else if (view.value === 'week') {
			cursor.value = addDays(c, dir * 7);
		} else {
			const d = parseIso(c);
			d.setMonth(d.getMonth() + dir, 1);
			cursor.value = isoDate(d);
		}
	};

	return {
		cursor,
		view,
		setView: (v) => (view.value = v),
		goPrev: () => step(-1),
		goNext: () => step(1),
		goToday: () => (cursor.value = todayIso()),
		goToDate: (iso) => (cursor.value = iso),
		visibleDays,
	};
}
