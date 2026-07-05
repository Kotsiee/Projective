// Continuous, infinitely-scrollable Month view. Consecutive months stack
// vertically and stream through the SAME infinite-viewport engine as Day/Week
// (`useViewportScroll`) — no rigid month-to-month pagination. Only the handful of
// months intersecting the viewport are mounted; each is positioned by a pure
// transform from the virtual offset, so nothing thrashes layout on scroll.

import { useEffect, useLayoutEffect, useRef } from 'preact/hooks';
import type { JSX } from 'preact';
import type { AvailabilityWindow, CalendarEvent, TimeOffRange } from '../types/calendar.ts';
import {
	isoDate,
	minutesToTime,
	MONTH_LABELS,
	monthGridDays,
	parseIso,
	todayIso,
	WEEKDAY_LABELS,
} from '../hooks/date-utils.ts';
import { useViewportScroll } from '../hooks/useViewportScroll.ts';
import { TimelineScrollbar } from './TimelineScrollbar.tsx';
import { eventsForDate, timeOffForDate } from './calendar-grid.ts';

/** Fixed heights so month blocks are uniform (clean offset math). */
const LABEL_H = 40;
const ROW_H = 96;
const MONTH_H = LABEL_H + ROW_H * 6;
const MAX_CHIPS = 3;

export interface MonthTimelineProps {
	/** Cursor (ISO date) whose month the stream is anchored to. */
	anchor: string;
	events: CalendarEvent[];
	windows: AvailabilityWindow[];
	timeOff: TimeOffRange[];
	onSelectDay: (date: string) => void;
	onEventClick?: (event: CalendarEvent) => void;
	/** Live centred month (its 1st) as the stream scrolls. */
	onAnchorChange?: (iso: string) => void;
	onVisibleRangeChange?: (startIso: string, endIso: string) => void;
}

const monthStartIso = (iso: string): string => {
	const d = parseIso(iso);
	return isoDate(new Date(d.getFullYear(), d.getMonth(), 1));
};
const addMonthsIso = (iso: string, n: number): string => {
	const d = parseIso(iso);
	return isoDate(new Date(d.getFullYear(), d.getMonth() + n, 1));
};
const monthsBetween = (a: string, b: string): number => {
	const da = parseIso(a);
	const db = parseIso(b);
	return (db.getFullYear() - da.getFullYear()) * 12 + (db.getMonth() - da.getMonth());
};

function MonthBlock({
	monthIso,
	top,
	events,
	timeOff,
	onSelectDay,
	onEventClick,
}: {
	monthIso: string;
	top: number;
	events: CalendarEvent[];
	timeOff: TimeOffRange[];
	onSelectDay: (date: string) => void;
	onEventClick?: (event: CalendarEvent) => void;
}) {
	const anchorDate = parseIso(monthIso);
	const cursorMonth = anchorDate.getMonth();
	const today = todayIso();
	const days = monthGridDays(monthIso);

	return (
		<div
			class='cal-monthblock'
			style={{ transform: `translateY(${top}px)`, height: `${MONTH_H}px` }}
		>
			<div class='cal-monthblock__label'>
				{MONTH_LABELS[cursorMonth]} {anchorDate.getFullYear()}
			</div>
			<div class='cal-monthblock__grid' style={{ gridTemplateRows: `repeat(6, ${ROW_H}px)` }}>
				{days.map((iso) => {
					const inMonth = parseIso(iso).getMonth() === cursorMonth;
					const isToday = iso === today;
					const off = timeOffForDate(iso, timeOff);
					const dayEvents = eventsForDate(iso, events);
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
							onClick={() => onSelectDay(iso)}
						>
							<span class='cal-month__num' data-today={isToday}>{parseIso(iso).getDate()}</span>
							{off
								? <span class='cal-month__off'>{off.label ?? 'Time off'}</span>
								: (
									<span class='cal-month__events'>
										{shown.map((e) => (
											<span
												key={e.id}
												class='cal-month__chip'
												style={{ ['--cal-event-accent' as string]: e.colour ?? 'var(--primary)' }}
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

export function MonthTimeline(props: MonthTimelineProps) {
	const { anchor, events, windows: _windows, timeOff, onSelectDay, onEventClick } = props;

	// Fixed month origin (index 0) so the offset↔month mapping never shifts.
	const origin = useRef(monthStartIso(anchor)).current;
	const syncedCentre = useRef(monthStartIso(anchor));
	const monthIndexOf = (iso: string) => monthsBetween(origin, monthStartIso(iso));

	const cbAnchor = useRef(props.onAnchorChange);
	const cbRange = useRef(props.onVisibleRangeChange);
	cbAnchor.current = props.onAnchorChange;
	cbRange.current = props.onVisibleRangeChange;

	const broadcast = useRef<(offset: number) => void>(() => {});
	const vp = useViewportScroll({ onScroll: (o) => broadcast.current(o) });

	broadcast.current = (offset: number) => {
		const centre = addMonthsIso(origin, Math.floor((offset + vp.viewportH.value / 2) / MONTH_H));
		if (centre !== syncedCentre.current) {
			syncedCentre.current = centre;
			cbAnchor.current?.(centre);
			cbRange.current?.(centre, addMonthsIso(centre, 1));
		}
	};

	useLayoutEffect(() => {
		vp.setOffset(monthIndexOf(anchor) * MONTH_H);
	}, []);

	useEffect(() => {
		const target = monthStartIso(anchor);
		if (target === syncedCentre.current) return;
		syncedCentre.current = target;
		vp.setOffset(monthIndexOf(anchor) * MONTH_H);
	}, [anchor]);

	const st = vp.offset.value;
	const vh = vp.viewportH.value;

	const months: JSX.Element[] = [];
	if (vh > 0) {
		const first = Math.floor(st / MONTH_H) - 1;
		const last = Math.floor((st + vh) / MONTH_H) + 1;
		for (let m = first; m <= last; m++) {
			const monthIso = addMonthsIso(origin, m);
			months.push(
				<MonthBlock
					key={monthIso}
					monthIso={monthIso}
					top={m * MONTH_H - st}
					events={events}
					timeOff={timeOff}
					onSelectDay={onSelectDay}
					onEventClick={onEventClick}
				/>,
			);
		}
	}

	return (
		<div class='cal-month'>
			<div class='cal-month__dow'>
				{WEEKDAY_LABELS.map((d) => <span key={d} class='cal-month__dow-cell'>{d}</span>)}
			</div>
			<div class='cal-viewport' ref={vp.scrollRef}>
				{months}
				<TimelineScrollbar viewportH={vp.viewportH} scrollbar={vp.scrollbar} />
			</div>
		</div>
	);
}
