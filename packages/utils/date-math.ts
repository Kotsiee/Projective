import { DateTime } from '@projective/types';

export interface CalendarDay {
	date: DateTime;
	isCurrentMonth: boolean;
	isToday: boolean;
	isDisabled: boolean;
	// Selection States
	isSelected: boolean; // Exact match (Single mode)
	isRangeStart: boolean; // [Start, ...]
	isRangeEnd: boolean; // [..., End]
	isRangeMiddle: boolean; // Between Start and End
}

export function getCalendarGrid(
	viewDate: DateTime,
	value?: DateTime | [DateTime | null, DateTime | null], // Single or Range
	hoverDate?: DateTime | null, // For ghost range preview
	min?: DateTime,
	max?: DateTime,
	startOfWeek: 0 | 1 = 1,
): CalendarDay[] {
	const days: CalendarDay[] = [];
	const today = DateTime.today();

	// Normalize Selection
	let start: DateTime | null = null;
	let end: DateTime | null = null;

	if (Array.isArray(value)) {
		start = value[0];
		end = value[1];
	} else if (value) {
		start = value;
		end = value;
	}

	// Ghost Range Logic (If we have a start but no end, use hover as temporary end)
	if (Array.isArray(value) && start && !end && hoverDate) {
		if (hoverDate.isAfter(start)) {
			end = hoverDate;
		} else {
			// If user hovers before start, swap visually
			end = start;
			start = hoverDate;
		}
	}

	// 1. Grid Start Calculation
	const startOfMonth = viewDate.startOf('month');
	const currentDayOfWeek = startOfMonth.getDay();
	const daysToSubtract = (currentDayOfWeek - startOfWeek + 7) % 7;
	let currentIter = startOfMonth.minus(daysToSubtract, 'days');

	// 2. Generate Grid
	for (let i = 0; i < 42; i++) {
		const isCurrentMonth = currentIter.getMonth() === viewDate.getMonth();

		let isDisabled = false;
		if (min && currentIter.isBefore(min.startOf('day'))) isDisabled = true;
		if (max && currentIter.isAfter(max.endOf('day'))) isDisabled = true;

		// Range Checks
		const isRangeStart = !!start && currentIter.isSameDay(start);
		const isRangeEnd = !!end && currentIter.isSameDay(end);

		let isRangeMiddle = false;
		if (start && end) {
			// isBetween is exclusive '()', so we use custom logic for inclusive
			isRangeMiddle = currentIter.isAfter(start) && currentIter.isBefore(end);
		}

		days.push({
			date: currentIter,
			isCurrentMonth,
			isToday: currentIter.isSameDay(today),
			isDisabled,
			isSelected: isRangeStart || isRangeEnd, // For single select, start==end
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
