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
import { type MinimapMark, TimelineScrollbar } from './TimelineScrollbar.tsx';
import { PresentButton } from './PresentButton.tsx';
import { eventsForDate, timeOffForDate } from './calendar-grid.ts';

/** Fixed heights so month blocks are uniform (clean offset math). */
const LABEL_H = 40;
const ROW_H = 96;
const MONTH_H = LABEL_H + ROW_H * 6;
const MAX_CHIPS = 3;
/** Half-window (in months) the schedule minimap maps around the viewport centre. */
const MINIMAP_HALF_MONTHS = 1.5;

/**
 * Bounce-snap a month-stream offset onto the nearest week-row line. Rows within a
 * month sit at `m·MONTH_H + LABEL_H + r·ROW_H`; the candidate set also spans the
 * neighbouring months' label seams so the settle never fights a boundary.
 */
function snapMonthRow(offset: number): number {
	const m = Math.floor(offset / MONTH_H);
	let best = offset;
	let bestDist = Infinity;
	for (let mm = m - 1; mm <= m + 1; mm++) {
		for (let r = 0; r <= 6; r++) {
			const line = mm * MONTH_H + LABEL_H + r * ROW_H;
			const d = Math.abs(line - offset);
			if (d < bestDist) {
				bestDist = d;
				best = line;
			}
		}
	}
	return best;
}

export interface MonthTimelineProps {
	/** Cursor (ISO date) whose month the stream is anchored to. */
	anchor: string;
	events: CalendarEvent[];
	windows: AvailabilityWindow[];
	timeOff: TimeOffRange[];
	onSelectDay: (date: string) => void;
	onEventClick?: (event: CalendarEvent) => void;
	/** Hide private booking detail — chips collapse to anonymous "Reserved". */
	masked?: boolean;
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
	masked,
	onSelectDay,
	onEventClick,
}: {
	monthIso: string;
	top: number;
	events: CalendarEvent[];
	timeOff: TimeOffRange[];
	masked?: boolean;
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
										{shown.map((e) =>
											masked
												? (
													<span
														key={e.id}
														class='cal-month__chip cal-month__chip--reserved'
														title='Reserved'
													>
														<span class='cal-month__chip-dot' />
														<span class='cal-month__chip-title'>Reserved</span>
													</span>
												)
												: (
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
												)
										)}
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
	const { anchor, events, windows: _windows, timeOff, masked = false, onSelectDay, onEventClick } =
		props;

	// Fixed month origin (index 0) so the offset↔month mapping never shifts.
	const origin = useRef(monthStartIso(anchor)).current;
	const syncedCentre = useRef(monthStartIso(anchor));
	const monthIndexOf = (iso: string) => monthsBetween(origin, monthStartIso(iso));

	const cbAnchor = useRef(props.onAnchorChange);
	const cbRange = useRef(props.onVisibleRangeChange);
	cbAnchor.current = props.onAnchorChange;
	cbRange.current = props.onVisibleRangeChange;

	const broadcast = useRef<(offset: number) => void>(() => {});
	const vp = useViewportScroll({
		onScroll: (o) => broadcast.current(o),
		snap: snapMonthRow,
	});

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
					masked={masked}
					onSelectDay={onSelectDay}
					onEventClick={onEventClick}
				/>,
			);
		}
	}

	// Return-to-present: today's month sits at monthIndexOf(today)·MONTH_H.
	const today = todayIso();
	const todayIdx = monthIndexOf(today);
	const presentTop = todayIdx * MONTH_H;
	const presentVisible = vh > 0 && presentTop + MONTH_H > st && presentTop < st + vh;
	const presentDir: 'up' | 'down' = presentTop < st ? 'up' : 'down';

	// Schedule minimap — Reserved (booked days) + Unavailable (time-off) ticks
	// plus the "now" anchor, mapped from a ±MINIMAP_HALF_MONTHS window. Pure math
	// over the small seed arrays; no DOM reads, so it never thrashes layout.
	const rowTop = (monthIdx: number, gridIndex: number) =>
		monthIdx * MONTH_H + LABEL_H + Math.floor(gridIndex / 7) * ROW_H;
	const minimap = (() => {
		if (vh <= 0) return undefined;
		const centreY = st + vh / 2;
		const half = MINIMAP_HALF_MONTHS * MONTH_H;
		const spanTop = centreY - half;
		const span = 2 * half;
		const toFrac = (y: number) => (y - spanTop) / span;
		const marks: MinimapMark[] = [];
		const m0 = Math.floor(spanTop / MONTH_H);
		const m1 = Math.floor((centreY + half) / MONTH_H);
		for (let m = m0; m <= m1; m++) {
			const monthIso = addMonthsIso(origin, m);
			const mMonth = parseIso(monthIso).getMonth();
			const days = monthGridDays(monthIso);
			days.forEach((iso, i) => {
				if (parseIso(iso).getMonth() !== mMonth) return; // skip spill-over days
				const y = rowTop(m, i);
				if (timeOffForDate(iso, timeOff)) {
					marks.push({ top: toFrac(y), height: ROW_H / span, state: 'unavailable' });
				} else if (eventsForDate(iso, events).length > 0) {
					marks.push({ top: toFrac(y), height: ROW_H / span, state: 'reserved' });
				}
			});
		}
		const visible = marks.filter((mk) => mk.top + mk.height > 0 && mk.top < 1);
		// Now anchor: today's row band within its month grid.
		const todayGridIdx = monthGridDays(monthStartIso(today)).indexOf(today);
		const nowY = todayGridIdx >= 0 ? rowTop(todayIdx, todayGridIdx) + ROW_H / 2 : presentTop;
		const nf = toFrac(nowY);
		return { marks: visible, nowFrac: nf >= 0 && nf <= 1 ? nf : null };
	})();

	// Middle-mouse grab-pan across the month canvas (left click still selects days).
	const onCanvasDown = (e: MouseEvent) => {
		if (e.button === 1) vp.beginPan(e);
	};

	return (
		<div class='cal-month'>
			<div class='cal-month__dow'>
				{WEEKDAY_LABELS.map((d) => <span key={d} class='cal-month__dow-cell'>{d}</span>)}
			</div>
			<div class='cal-viewport' ref={vp.scrollRef} onMouseDown={onCanvasDown}>
				{months}
				<TimelineScrollbar viewportH={vp.viewportH} scrollbar={vp.scrollbar} minimap={minimap} />
				<PresentButton
					show={vh > 0 && !presentVisible}
					direction={presentDir}
					label='Today'
					onClick={() => vp.animateTo(presentTop, false)}
				/>
			</div>
		</div>
	);
}
