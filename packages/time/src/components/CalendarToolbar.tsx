// The calendar's top bar: a range label, a Day/Week/Month segmented switch, and
// prev / today / next chevrons. Minimal chrome.

import { IconChevronLeft, IconChevronRight } from '@tabler/icons-preact';
import type { CalendarView } from '../types/calendar.ts';
import { addDays, MONTH_LABELS, parseIso, startOfWeek } from '../hooks/date-utils.ts';

export interface CalendarToolbarProps {
	view: CalendarView;
	cursor: string;
	onViewChange: (view: CalendarView) => void;
	onPrev: () => void;
	onNext: () => void;
	onToday: () => void;
}

const VIEWS: { key: CalendarView; label: string }[] = [
	{ key: 'day', label: 'Day' },
	{ key: 'week', label: 'Week' },
	{ key: 'month', label: 'Month' },
];

/** The human range label shown for the active view. */
function rangeLabel(view: CalendarView, cursor: string): string {
	const d = parseIso(cursor);
	if (view === 'day') {
		return `${MONTH_LABELS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
	}
	if (view === 'week') {
		const start = parseIso(startOfWeek(cursor));
		const end = parseIso(addDays(startOfWeek(cursor), 6));
		const sameMonth = start.getMonth() === end.getMonth();
		const startLabel = `${MONTH_LABELS[start.getMonth()].slice(0, 3)} ${start.getDate()}`;
		const endLabel = sameMonth
			? `${end.getDate()}`
			: `${MONTH_LABELS[end.getMonth()].slice(0, 3)} ${end.getDate()}`;
		return `${startLabel} – ${endLabel}, ${end.getFullYear()}`;
	}
	return `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`;
}

export function CalendarToolbar(props: CalendarToolbarProps) {
	const { view, cursor, onViewChange, onPrev, onNext, onToday } = props;

	return (
		<div class='cal-toolbar'>
			<div class='cal-toolbar__nav'>
				<span class='cal-toolbar__label'>{rangeLabel(view, cursor)}</span>
				<div class='cal-toolbar__stepper'>
					<button type='button' class='cal-toolbar__chev' aria-label='Previous' onClick={onPrev}>
						<IconChevronLeft size={16} />
					</button>
					<button type='button' class='cal-toolbar__chev' aria-label='Next' onClick={onNext}>
						<IconChevronRight size={16} />
					</button>
				</div>
				<button type='button' class='cal-toolbar__today' onClick={onToday}>Today</button>
			</div>

			<div class='cal-toolbar__views' role='tablist' aria-label='Calendar view'>
				{VIEWS.map((v) => (
					<button
						key={v.key}
						type='button'
						role='tab'
						class='cal-toolbar__view'
						aria-selected={view === v.key}
						data-active={view === v.key}
						onClick={() => onViewChange(v.key)}
					>
						{v.label}
					</button>
				))}
			</div>
		</div>
	);
}
