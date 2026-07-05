// Month view — a clean 6×7 day grid. Today's number sits in a filled primary
// circle; each day shows up to three small event chips then a "+N" overflow;
// time-off days are subtly shaded. Clicking a day drops into Day view.

import type { AvailabilityWindow, CalendarEvent, TimeOffRange } from '../types/calendar.ts';
import { minutesToTime, parseIso, todayIso, WEEKDAY_LABELS } from '../hooks/date-utils.ts';
import { eventsForDate, timeOffForDate, windowsForDate } from './calendar-grid.ts';

const MAX_CHIPS = 3;

export interface MonthViewProps {
	/** The 42 ISO dates of the month grid. */
	days: string[];
	/** The month the grid is anchored to (for out-of-month dimming). */
	cursor: string;
	events: CalendarEvent[];
	windows: AvailabilityWindow[];
	timeOff: TimeOffRange[];
	onSelectDay: (date: string) => void;
	onEventClick?: (event: CalendarEvent) => void;
}

export function MonthView(props: MonthViewProps) {
	const { days, cursor, events, windows, timeOff, onSelectDay, onEventClick } = props;
	const cursorMonth = parseIso(cursor).getMonth();
	const today = todayIso();

	return (
		<div class='cal-month'>
			<div class='cal-month__dow'>
				{WEEKDAY_LABELS.map((d) => <span key={d} class='cal-month__dow-cell'>{d}</span>)}
			</div>
			<div class='cal-month__grid'>
				{days.map((iso) => {
					const inMonth = parseIso(iso).getMonth() === cursorMonth;
					const isToday = iso === today;
					const off = timeOffForDate(iso, timeOff);
					const dayEvents = eventsForDate(iso, events);
					const hasWindows = windowsForDate(iso, windows).length > 0;
					const shown = dayEvents.slice(0, MAX_CHIPS);
					const overflow = dayEvents.length - shown.length;

					return (
						<button
							type='button'
							key={iso}
							class='cal-month__cell'
							data-outside={!inMonth}
							data-today={isToday}
							data-off={!!off}
							data-avail={hasWindows}
							onClick={() => onSelectDay(iso)}
						>
							<span class='cal-month__num' data-today={isToday}>
								{parseIso(iso).getDate()}
							</span>

							{off
								? <span class='cal-month__off'>{off.label ?? 'Time off'}</span>
								: (
									<span class='cal-month__events'>
										{shown.map((e) => (
											<span
												key={e.id}
												class='cal-month__chip'
												style={{
													['--cal-event-accent' as string]: e.colour ?? 'var(--primary)',
												}}
												title={`${e.title} · ${minutesToTime(e.start)}`}
												onClick={onEventClick
													? (ev) => {
														ev.stopPropagation();
														onEventClick(e);
													}
													: undefined}
											>
												<span class='cal-month__chip-dot' />
												<span class='cal-month__chip-time'>{minutesToTime(e.start)}</span>
												<span class='cal-month__chip-title'>{e.title}</span>
											</span>
										))}
										{overflow > 0 && <span class='cal-month__more'>+{overflow}</span>}
									</span>
								)}
						</button>
					);
				})}
			</div>
		</div>
	);
}
