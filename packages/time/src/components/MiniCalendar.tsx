// Compact month calendar for a sidebar. Month label + prev/next, weekday
// initials, and day cells. The selected day gets a filled circle; days with any
// window or event carry a tiny dot. Clicking a day calls onSelect.

import { useSignal } from '@preact/signals';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-preact';
import type { AvailabilityWindow, CalendarEvent, TimeOffRange } from '../types/calendar.ts';
import {
	isoDate,
	MONTH_LABELS,
	monthGridDays,
	parseIso,
	todayIso,
	WEEKDAY_LABELS,
} from '../hooks/date-utils.ts';
import { eventsForDate, timeOffForDate, windowsForDate } from './calendar-grid.ts';

export interface MiniCalendarProps {
	/** The selected / cursor day (ISO). */
	value: string;
	onSelect: (date: string) => void;
	events?: CalendarEvent[];
	windows?: AvailabilityWindow[];
	timeOff?: TimeOffRange[];
}

export function MiniCalendar(props: MiniCalendarProps) {
	const { value, onSelect, events = [], windows = [], timeOff = [] } = props;

	// The visible month is internal (independent of the selected day).
	const viewMonth = useSignal(value);
	const anchor = parseIso(viewMonth.value);
	const month = anchor.getMonth();
	const today = todayIso();
	const days = monthGridDays(viewMonth.value);

	const stepMonth = (delta: number) => {
		const d = parseIso(viewMonth.value);
		d.setMonth(d.getMonth() + delta, 1);
		viewMonth.value = isoDate(d);
	};

	return (
		<div class='cal-mini'>
			<div class='cal-mini__head'>
				<span class='cal-mini__month'>
					{MONTH_LABELS[month]} {anchor.getFullYear()}
				</span>
				<div class='cal-mini__nav'>
					<button
						type='button'
						class='cal-mini__navbtn'
						aria-label='Previous month'
						onClick={() => stepMonth(-1)}
					>
						<IconChevronLeft size={15} />
					</button>
					<button
						type='button'
						class='cal-mini__navbtn'
						aria-label='Next month'
						onClick={() => stepMonth(1)}
					>
						<IconChevronRight size={15} />
					</button>
				</div>
			</div>

			<div class='cal-mini__dow'>
				{WEEKDAY_LABELS.map((d) => <span key={d} class='cal-mini__dow-cell'>{d[0]}</span>)}
			</div>

			<div class='cal-mini__grid'>
				{days.map((iso) => {
					const inMonth = parseIso(iso).getMonth() === month;
					const isSelected = iso === value;
					const isToday = iso === today;
					const off = timeOffForDate(iso, timeOff);
					const hasDot = !off &&
						(windowsForDate(iso, windows).length > 0 || eventsForDate(iso, events).length > 0);
					return (
						<button
							key={iso}
							type='button'
							class='cal-mini__day'
							data-outside={!inMonth}
							data-selected={isSelected}
							data-today={isToday}
							data-off={!!off}
							onClick={() => onSelect(iso)}
							title={off?.label}
						>
							<span class='cal-mini__daynum'>{parseIso(iso).getDate()}</span>
							{hasDot && <span class='cal-mini__dot' />}
						</button>
					);
				})}
			</div>
		</div>
	);
}
