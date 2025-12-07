import { DateTime } from '@projective/types';
import { DateValue } from '../fields/src/types/components/date-field.ts';

export interface CalendarDay {
	date: DateTime;
	isCurrentMonth: boolean;
	isToday: boolean;
	isDisabled: boolean;
	isSelected: boolean;
	isRangeStart: boolean;
	isRangeEnd: boolean;
	isRangeMiddle: boolean;
}

export function getCalendarGrid(
	viewDate: DateTime,
	value?: DateValue,
	hoverDate?: DateTime | null,
	min?: DateTime,
	max?: DateTime,
	startOfWeek: 0 | 1 = 1,
): CalendarDay[] {
	const days: CalendarDay[] = [];
	const today = DateTime.today();

	let start: DateTime | null = null;
	let end: DateTime | null = null;
	let multiDates: DateTime[] = [];
	let mode: 'single' | 'range' | 'multiple' = 'single';

	if (Array.isArray(value)) {
		if (
			value.length === 2 && (value[0] === null || value[0] instanceof DateTime) &&
			(value[1] === null || value[1] instanceof DateTime)
		) {
			start = value[0] as DateTime | null;
			end = value[1] as DateTime | null;
			mode = 'range';
		} else {
			multiDates = value as DateTime[];
			mode = 'multiple';
		}
	} else if (value) {
		start = value as DateTime;
		end = value as DateTime; // For single, start=end for logic simplification
		mode = 'single';
	}

	// Ghost Range Logic
	if (mode === 'range' && start && !end && hoverDate) {
		if (hoverDate.isAfter(start)) {
			end = hoverDate;
		} else {
			end = start;
			start = hoverDate;
		}
	}

	const startOfMonth = viewDate.startOf('month');
	const currentDayOfWeek = startOfMonth.getDay();
	const daysToSubtract = (currentDayOfWeek - startOfWeek + 7) % 7;
	let currentIter = startOfMonth.minus(daysToSubtract, 'days');

	for (let i = 0; i < 42; i++) {
		const isCurrentMonth = currentIter.getMonth() === viewDate.getMonth();

		let isDisabled = false;
		if (min && currentIter.isBefore(min.startOf('day'))) isDisabled = true;
		if (max && currentIter.isAfter(max.endOf('day'))) isDisabled = true;

		let isSelected = false;
		let isRangeStart = false;
		let isRangeEnd = false;
		let isRangeMiddle = false;

		if (mode === 'multiple') {
			// FIX: Use isSameDay
			isSelected = multiDates.some((d) => currentIter.isSameDay(d));
		} else {
			isRangeStart = !!start && currentIter.isSameDay(start);
			isRangeEnd = !!end && currentIter.isSameDay(end);

			if (mode === 'single') {
				isSelected = isRangeStart;
			} else {
				if (start && end) {
					isRangeMiddle = currentIter.isAfter(start) && currentIter.isBefore(end);
				}
				isSelected = isRangeStart || isRangeEnd;
			}
		}

		days.push({
			date: currentIter,
			isCurrentMonth,
			isToday: currentIter.isSameDay(today),
			isDisabled,
			isSelected,
			isRangeStart,
			isRangeEnd,
			isRangeMiddle,
		});

		currentIter = currentIter.add(1, 'days');
	}

	return days;
}

export function getWeekdayLabels(startOfWeek: 0 | 1 = 1): string[] {
	const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	if (startOfWeek === 1) {
		const sun = labels.shift();
		if (sun) labels.push(sun);
	}
	return labels;
}
