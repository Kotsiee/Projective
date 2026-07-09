// SVG-driven continuous vertical timeline engine for the Day and Week views.
//
// There is NO native scroll, NO spacer, and NO bounds. A single virtual `offset`
// signal (boundless viewport, driven by the wheel, a velocity accelerator thumb,
// and a middle-mouse pan — see useViewportScroll) selects the visible slice,
// which a single absolutely-positioned SVG repaints. Nothing mounts or unmounts
// while scrolling, so there is no render loop.
//
// `useTimelineScroll` maps `offset` → a continuous time coordinate (origin at
// canvas y=0). Everything drawn — hour rules, midnight demarcations, day
// columns, availability washes, events, the now-line, hover + drag selections —
// is pure vector math against that offset. A single pointer handler converts
// clientX/Y back into a precise date + 30-minute block for booking.
//
// External viewers pass `masked`: booked events collapse into anonymous
// "Reserved" blocks so no title, attendee, or project context ever leaks.

import { type Signal, useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import type { JSX } from 'preact';
import type { AvailabilityWindow, CalendarEvent, TimeOffRange } from '../types/calendar.ts';
import {
	addDays,
	daysBetween,
	isoWeekday,
	minutesToTime,
	MONTH_LABELS,
	startOfWeek,
	todayIso,
	WEEKDAY_LABELS,
} from '../hooks/date-utils.ts';
import { useTimelineScroll } from '../hooks/useTimelineScroll.ts';
import { type MinimapMark, TimelineScrollbar } from './TimelineScrollbar.tsx';
import { PresentButton } from './PresentButton.tsx';
import {
	eventsForDate,
	isWithinWindow,
	overlapsEvent,
	timeOffForDate,
	tint,
	windowsForDate,
} from './calendar-grid.ts';

/** Width of the hour-label gutter, in px. */
const GUTTER_W = 56;

/** Half-window (in pages) the schedule minimap maps around the viewport centre. */
const MINIMAP_HALF_PAGES = 3;

export interface TimeGridViewProps {
	/** Externally-controlled cursor (ISO date) the timeline is anchored to. */
	anchor: string;
	/** Days per page: 1 for Day view, 7 for Week view. */
	daysPerPage: number;
	events: CalendarEvent[];
	windows: AvailabilityWindow[];
	timeOff: TimeOffRange[];
	slotMinutes: number;
	/** Pixel height of one hour row. Default 60. */
	pxPerHour?: number;
	/** Hour the matrix vertically lands on within the anchor page. Default 7. */
	scrollToHour?: number;
	/**
	 * Hide all private booking detail (title / attendee / project). Booked spans
	 * render as anonymous "Reserved" blocks. Set for external profile viewers.
	 */
	masked?: boolean;
	onSelectSlot?: (date: string, startMin: number) => void;
	onEventClick?: (event: CalendarEvent) => void;
	/** Live centred page date as the timeline scrolls (drives toolbar/mini). */
	onAnchorChange?: (iso: string) => void;
	/** Live inclusive visible page range as the timeline scrolls. */
	onVisibleRangeChange?: (startIso: string, endIso: string) => void;
}

/** Minutes-from-midnight of "now". */
function nowMinutes(): number {
	const d = new Date();
	return d.getHours() * 60 + d.getMinutes();
}

/** Truncate a label to an approximate character budget for a given column width. */
function fit(text: string, width: number): string {
	const max = Math.max(0, Math.floor((width - 14) / 6.5));
	if (text.length <= max) return text;
	return max <= 1 ? '' : `${text.slice(0, max - 1)}…`;
}

/** Short "Sat 12 Jul" stamp for a midnight demarcation. */
function dayStamp(iso: string): string {
	const dt = new Date(iso + 'T00:00:00');
	return `${WEEKDAY_LABELS[isoWeekday(iso) - 1]} ${dt.getDate()} ${
		MONTH_LABELS[dt.getMonth()].slice(0, 3)
	}`;
}

interface Slot {
	page: number;
	col: number;
	date: string;
	startMin: number;
}

function DayHead({ iso }: { iso: string }) {
	const d = new Date(iso + 'T00:00:00');
	const isToday = iso === todayIso();
	return (
		<div class='cal-grid__day-head' data-today={isToday}>
			<span class='cal-grid__dow'>{WEEKDAY_LABELS[(d.getDay() + 6) % 7]}</span>
			<span class='cal-grid__date' data-today={isToday}>{d.getDate()}</span>
		</div>
	);
}

export function TimeGridView(props: TimeGridViewProps) {
	const {
		anchor,
		daysPerPage: dpp,
		events,
		windows,
		timeOff,
		slotMinutes,
		pxPerHour = 60,
		scrollToHour = 7,
		masked = false,
		onSelectSlot,
		onEventClick,
		onAnchorChange,
		onVisibleRangeChange,
	} = props;

	const pxPerMin = pxPerHour / 60;
	const pageHeight = 24 * pxPerHour; // one full continuous day (or week row)

	const { scrollRef, offset, viewportH, viewportW, origin, animateTo, beginPan, scrollbar } =
		useTimelineScroll({
			anchor,
			daysPerPage: dpp,
			pageHeight,
			pxPerHour,
			scrollToHour,
			onAnchorChange,
			onVisibleRangeChange,
		});

	const paintRef = useRef<HTMLDivElement | null>(null);

	// Interaction state.
	const hover: Signal<Slot | null> = useSignal(null);
	const drag: Signal<{ page: number; col: number; startMin: number; endMin: number } | null> =
		useSignal(null);
	const dragStart = useRef<Slot | null>(null);
	const dragging = useRef(false);

	// Re-tick the now line every minute so it stays live.
	const now = useSignal<number | null>(nowMinutes());
	useEffect(() => {
		now.value = nowMinutes();
		const id = setInterval(() => (now.value = nowMinutes()), 60_000);
		return () => clearInterval(id);
	}, []);

	const st = offset.value;
	const vh = viewportH.value;
	const vw = viewportW.value;
	const colW = vw > 0 ? (vw - GUTTER_W) / dpp : 0;

	// The centred page drives the header band (and matches the broadcast date).
	const centrePage = Math.floor((st + vh / 2) / pageHeight);
	const headerDates = Array.from({ length: dpp }, (_, c) => addDays(origin, centrePage * dpp + c));

	// "Now" in canvas-y — shared by the now-line, the minimap anchor, and teleport.
	const today = todayIso();
	const pToday = daysBetween(origin, dpp === 7 ? startOfWeek(today) : today) / dpp;
	const colToday = dpp === 7 ? daysBetween(startOfWeek(today), today) : 0;
	const nowAbsY = pToday * pageHeight + (now.value ?? 0) * pxPerMin;

	// #region Pure geometry helpers ------------------------------------------
	const dateAt = (page: number, col: number) => addDays(origin, page * dpp + col);
	const isOpen = (date: string, startMin: number): boolean =>
		!timeOffForDate(date, timeOff) &&
		isWithinWindow(startMin, startMin + slotMinutes, windowsForDate(date, windows)) &&
		!overlapsEvent(startMin, startMin + slotMinutes, eventsForDate(date, events));

	const slotAt = (clientX: number, clientY: number): Slot | null => {
		const box = paintRef.current?.getBoundingClientRect();
		if (!box || colW <= 0) return null;
		const ox = clientX - box.left;
		const oy = clientY - box.top;
		if (ox < GUTTER_W) return null;
		const col = Math.floor((ox - GUTTER_W) / colW);
		if (col < 0 || col >= dpp) return null;
		const canvasY = st + oy;
		const page = Math.floor(canvasY / pageHeight);
		const withinMin = (canvasY - page * pageHeight) / pxPerMin;
		const startMin = Math.floor(withinMin / slotMinutes) * slotMinutes;
		return { page, col, date: dateAt(page, col), startMin };
	};
	// #endregion

	// #region Pointer interactions -------------------------------------------
	const onMove = (e: MouseEvent) => {
		const slot = slotAt(e.clientX, e.clientY);
		const ds = dragStart.current;
		if (ds) {
			if (slot && slot.page === ds.page && slot.col === ds.col) {
				const endMin = Math.max(ds.startMin + slotMinutes, slot.startMin + slotMinutes);
				// Only surface the band once it spans more than the initial slot, so a
				// plain double-click never flashes a selection.
				if (endMin > ds.startMin + slotMinutes) {
					dragging.current = true;
					drag.value = { page: ds.page, col: ds.col, startMin: ds.startMin, endMin };
				}
			}
			return;
		}
		const open = slot && isOpen(slot.date, slot.startMin);
		const cur = hover.value;
		if (!open) {
			if (cur) hover.value = null;
		} else if (
			!cur || cur.page !== slot.page || cur.col !== slot.col || cur.startMin !== slot.startMin
		) {
			hover.value = slot;
		}
	};

	const onDown = (e: MouseEvent) => {
		// Middle button → grab-pan the whole canvas (does not start a booking).
		if (e.button === 1) {
			beginPan(e);
			return;
		}
		if (e.button !== 0) return;
		const slot = slotAt(e.clientX, e.clientY);
		if (!slot || !isOpen(slot.date, slot.startMin)) return;
		dragStart.current = slot;
		dragging.current = false;
		hover.value = null;
	};

	const endDrag = () => {
		const ds = dragStart.current;
		if (ds && dragging.current) onSelectSlot?.(ds.date, ds.startMin);
		dragStart.current = null;
		dragging.current = false;
		drag.value = null;
	};

	const onDouble = (e: MouseEvent) => {
		const slot = slotAt(e.clientX, e.clientY);
		if (slot && isOpen(slot.date, slot.startMin)) onSelectSlot?.(slot.date, slot.startMin);
	};

	const onLeave = () => {
		dragStart.current = null;
		dragging.current = false;
		drag.value = null;
		hover.value = null;
	};
	// #endregion

	// #region Build the visible vector slice ---------------------------------
	const grid: JSX.Element[] = [];
	const daybreaks: JSX.Element[] = [];
	const washes: JSX.Element[] = [];
	const blocks: JSX.Element[] = [];
	const labels: JSX.Element[] = [];
	const overlays: JSX.Element[] = [];

	if (vw > 0 && vh > 0) {
		const firstPage = Math.floor(st / pageHeight);
		const lastPage = Math.floor((st + vh) / pageHeight);

		// Vertical day-column separators (+ gutter edge).
		grid.push(
			<line key='gx' class='cal-svg__axis' x1={GUTTER_W} y1={0} x2={GUTTER_W} y2={vh} />,
		);
		for (let c = 1; c < dpp; c++) {
			const x = GUTTER_W + c * colW;
			grid.push(<line key={`cx${c}`} class='cal-svg__col' x1={x} y1={0} x2={x} y2={vh} />);
		}

		// Horizontal hour rules + gutter labels, continuously across the slice.
		const firstHourY = Math.floor(st / pxPerHour) * pxPerHour;
		for (let cy = firstHourY; cy <= st + vh; cy += pxPerHour) {
			const y = cy - st;
			const hourOfDay = ((Math.round(cy / pxPerHour) % 24) + 24) % 24;
			const boundary = cy % pageHeight === 0;
			if (!boundary) {
				grid.push(
					<line key={`h${cy}`} class='cal-svg__hour' x1={GUTTER_W} y1={y} x2={vw} y2={y} />,
				);
			}
			if (y > 8) {
				labels.push(
					<text key={`hl${cy}`} class='cal-svg__label' x={GUTTER_W - 8} y={y + 3} text-anchor='end'>
						{minutesToTime(hourOfDay * 60)}
					</text>,
				);
			}
		}

		// #region Midnight demarcations — a premium boundary between calendar days.
		// A soft downward gradient wash into the new day + a crisp accent rule and
		// a dated pill, so scrolling past 00:00 reads unmistakably.
		const firstBoundary = Math.ceil(st / pageHeight) * pageHeight;
		for (let cy = firstBoundary; cy <= st + vh; cy += pageHeight) {
			const y = cy - st;
			const pageIdx = Math.round(cy / pageHeight);
			const startDate = dateAt(pageIdx, 0);
			daybreaks.push(
				<g key={`db${cy}`}>
					<rect
						class='cal-svg__daybreak-wash'
						x={GUTTER_W}
						y={y}
						width={Math.max(0, vw - GUTTER_W)}
						height={28}
					/>
					<line class='cal-svg__daybreak' x1={0} y1={y} x2={vw} y2={y} />
				</g>,
			);
			const stampText = dpp === 7
				? `${dayStamp(startDate)} – ${dayStamp(addDays(startDate, 6))}`
				: dayStamp(startDate);
			labels.push(
				<g key={`dbl${cy}`} class='cal-svg__daybreak-tag'>
					<rect
						class='cal-svg__daybreak-tag-bg'
						x={GUTTER_W + 6}
						y={y + 6}
						width={Math.min(Math.max(0, vw - GUTTER_W - 12), stampText.length * 6.6 + 16)}
						height={17}
						rx={8.5}
					/>
					<text class='cal-svg__daybreak-tag-text' x={GUTTER_W + 15} y={y + 18}>
						{stampText}
					</text>
				</g>,
			);
		}
		// #endregion

		for (let p = firstPage; p <= lastPage; p++) {
			for (let c = 0; c < dpp; c++) {
				const date = dateAt(p, c);
				const x = GUTTER_W + c * colW;
				const off = timeOffForDate(date, timeOff);

				// Faint full-column wash for today.
				if (date === today) {
					const yTop = Math.max(0, p * pageHeight - st);
					const yBot = Math.min(vh, (p + 1) * pageHeight - st);
					if (yBot > yTop) {
						washes.push(
							<rect
								key={`td${p}-${c}`}
								class='cal-svg__today'
								x={x}
								y={yTop}
								width={colW}
								height={yBot - yTop}
							/>,
						);
					}
				}

				if (off) {
					const yTop = Math.max(0, p * pageHeight - st);
					const yBot = Math.min(vh, (p + 1) * pageHeight - st);
					if (yBot > yTop) {
						washes.push(
							<rect
								key={`off${p}-${c}`}
								x={x}
								y={yTop}
								width={colW}
								height={yBot - yTop}
								fill='url(#cal-hatch)'
							/>,
						);
					}
				} else {
					// Availability windows.
					for (const [i, w] of windowsForDate(date, windows).entries()) {
						const yTop = p * pageHeight + w.start * pxPerMin - st;
						const h = (w.end - w.start) * pxPerMin;
						if (yTop + h < 0 || yTop > vh) continue;
						const colour = w.colour ?? 'var(--primary)';
						washes.push(
							<g key={`w${p}-${c}-${i}`}>
								<rect x={x} y={yTop} width={colW} height={h} style={{ fill: tint(colour, 8) }} />
								<rect x={x} y={yTop} width={2} height={h} style={{ fill: tint(colour, 55) }} />
							</g>,
						);
					}
				}

				// Events. External viewers see anonymous "Reserved" spans only.
				for (const ev of eventsForDate(date, events)) {
					const yTop = p * pageHeight + ev.start * pxPerMin - st;
					const h = Math.max((ev.end - ev.start) * pxPerMin, 18);
					if (yTop + h < 0 || yTop > vh) continue;
					const ex = x + 3;
					const ew = Math.max(0, colW - 6);

					if (masked) {
						blocks.push(
							<g key={ev.id} class='cal-svg__event cal-svg__event--reserved'>
								<rect
									class='cal-svg__reserved-bg'
									x={ex}
									y={yTop}
									width={ew}
									height={h}
									rx={6}
								/>
								<text class='cal-svg__reserved-title' x={ex + 9} y={yTop + 15}>
									{fit('Reserved', ew)}
								</text>
							</g>,
						);
						continue;
					}

					const colour = ev.colour ?? 'var(--primary)';
					blocks.push(
						<g
							key={ev.id}
							class='cal-svg__event'
							onClick={onEventClick
								? (e: MouseEvent) => {
									e.stopPropagation();
									onEventClick(ev);
								}
								: undefined}
						>
							<rect
								class='cal-svg__event-bg'
								x={ex}
								y={yTop}
								width={ew}
								height={h}
								rx={6}
								style={{ fill: tint(colour, 16) }}
							/>
							<rect x={ex} y={yTop} width={3} height={h} rx={1.5} style={{ fill: colour }} />
							<text class='cal-svg__event-title' x={ex + 9} y={yTop + 15}>
								{fit(ev.title, ew)}
							</text>
							{h >= 34 && (
								<text class='cal-svg__event-time' x={ex + 9} y={yTop + 29}>
									{fit(`${minutesToTime(ev.start)}–${minutesToTime(ev.end)}`, ew)}
								</text>
							)}
						</g>,
					);
				}
			}
		}

		// Hover highlight (open slot under the cursor).
		if (hover.value) {
			const s = hover.value;
			const y = s.page * pageHeight + s.startMin * pxPerMin - st;
			overlays.push(
				<rect
					key='hover'
					class='cal-svg__hover'
					x={GUTTER_W + s.col * colW + 1}
					y={y}
					width={colW - 2}
					height={slotMinutes * pxPerMin}
					rx={4}
				/>,
			);
		}

		// Drag selection band.
		if (drag.value) {
			const s = drag.value;
			const y = s.page * pageHeight + s.startMin * pxPerMin - st;
			overlays.push(
				<rect
					key='sel'
					class='cal-svg__sel'
					x={GUTTER_W + s.col * colW + 1}
					y={y}
					width={colW - 2}
					height={(s.endMin - s.startMin) * pxPerMin}
					rx={4}
				/>,
			);
		}

		// Now line (only when today's column is in view).
		if (now.value !== null) {
			const y = nowAbsY - st;
			if (y >= 0 && y <= vh) {
				const x = GUTTER_W + colToday * colW;
				overlays.push(
					<g key='now'>
						<line class='cal-svg__now' x1={x} y1={y} x2={x + colW} y2={y} />
						<circle class='cal-svg__now-dot' cx={x} cy={y} r={3.5} />
					</g>,
				);
			}
		}
	}
	// #endregion

	// #region Schedule minimap — a local availability map around the viewport ---
	// Maps a ±MINIMAP_HALF_PAGES window centred on the viewport onto the scrollbar
	// track: Available windows, Reserved bookings, Unavailable time-off, plus the
	// live "now" anchor. Recomputed each paint but cheap (small seed arrays) and
	// pure — no DOM reads, so it never thrashes layout even at max accel speed.
	const minimap = (() => {
		if (vh <= 0) return undefined;
		const centreY = st + vh / 2;
		const half = MINIMAP_HALF_PAGES * pageHeight;
		const spanTop = centreY - half;
		const span = 2 * half;
		const toFrac = (y: number) => (y - spanTop) / span;
		const marks: MinimapMark[] = [];
		const p0 = Math.floor(spanTop / pageHeight);
		const p1 = Math.floor((centreY + half) / pageHeight);
		for (let p = p0; p <= p1; p++) {
			for (let c = 0; c < dpp; c++) {
				const date = dateAt(p, c);
				const base = p * pageHeight;
				if (timeOffForDate(date, timeOff)) {
					marks.push({ top: toFrac(base), height: pageHeight / span, state: 'unavailable' });
					continue;
				}
				for (const w of windowsForDate(date, windows)) {
					marks.push({
						top: toFrac(base + w.start * pxPerMin),
						height: ((w.end - w.start) * pxPerMin) / span,
						state: 'available',
					});
				}
				for (const ev of eventsForDate(date, events)) {
					marks.push({
						top: toFrac(base + ev.start * pxPerMin),
						height: Math.max((ev.end - ev.start) * pxPerMin, 6) / span,
						state: 'reserved',
					});
				}
			}
		}
		const visible = marks.filter((m) => m.top + m.height > 0 && m.top < 1);
		const nf = toFrac(nowAbsY);
		return { marks: visible, nowFrac: nf >= 0 && nf <= 1 ? nf : null };
	})();
	// #endregion

	// #region Return-to-present teleport -------------------------------------
	// "Present" is in view when the now-line sits inside the current slice.
	const presentVisible = vh > 0 && nowAbsY >= st && nowAbsY <= st + vh;
	const presentDir: 'up' | 'down' = nowAbsY < st ? 'up' : 'down';
	const jumpToPresent = () => animateTo(nowAbsY - vh * 0.4, false);
	// #endregion

	return (
		<div class='cal-grid' style={{ ['--cal-hour-h' as string]: `${pxPerHour}px` }}>
			<div class='cal-grid__headband'>
				<span class='cal-grid__head-gutter' aria-hidden='true' />
				{headerDates.map((iso) => <DayHead key={iso} iso={iso} />)}
			</div>

			<div class='cal-viewport' ref={scrollRef}>
				<div
					class='cal-viewport__paint'
					ref={paintRef}
					onMouseMove={onMove}
					onMouseDown={onDown}
					onMouseUp={endDrag}
					onMouseLeave={onLeave}
					onDblClick={onDouble}
				>
					<svg class='cal-svg' width={vw} height={vh}>
						<defs>
							<pattern
								id='cal-hatch'
								width={14}
								height={14}
								patternTransform='rotate(45)'
								patternUnits='userSpaceOnUse'
							>
								<rect width={14} height={14} class='cal-svg__hatch-bg' />
								<line x1={0} y1={0} x2={0} y2={14} class='cal-svg__hatch-line' />
							</pattern>
							<linearGradient id='cal-daybreak-grad' x1='0' y1='0' x2='0' y2='1'>
								<stop offset='0%' class='cal-svg__daybreak-stop-a' />
								<stop offset='100%' class='cal-svg__daybreak-stop-b' />
							</linearGradient>
						</defs>
						{washes}
						{grid}
						{daybreaks}
						{blocks}
						{overlays}
						{labels}
					</svg>
				</div>
				<TimelineScrollbar viewportH={viewportH} scrollbar={scrollbar} minimap={minimap} />
				<PresentButton
					show={vh > 0 && !presentVisible}
					direction={presentDir}
					label='Now'
					onClick={jumpToPresent}
				/>
			</div>
		</div>
	);
}
