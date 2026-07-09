// Day/Week date mapping over the shared boundless-viewport physics engine.
//
// `useViewportScroll` owns the virtual `offset` (there is no native scroll and no
// bounds — the timeline is truly infinite in both directions); this hook fixes a
// stable time origin at canvas y=0, gives the engine a ½-hour bounce-snap,
// translates offset → the centred page date (broadcast to the host), and
// re-anchors when the host cursor changes (toolbar nav / picking). No feedback
// loop: broadcast + cursor effect guard on a single `syncedCentre`.

import type { Signal } from '@preact/signals';
import { useEffect, useLayoutEffect, useRef } from 'preact/hooks';
import type { RefObject } from 'preact';
import { addDays, daysBetween, startOfWeek } from './date-utils.ts';
import { useViewportScroll, type ViewportScrollbar } from './useViewportScroll.ts';

export interface TimelineScrollOptions {
	/** Externally-controlled cursor (ISO date) the timeline anchors to. */
	anchor: string;
	/** Days per page: 1 for Day view, 7 for Week view. */
	daysPerPage: number;
	/** Height of one page (a full 24h) in px. */
	pageHeight: number;
	/** Pixels per hour (for the intra-page landing offset + snap grid). */
	pxPerHour: number;
	/** Hour the view lands on within the anchor page. Default 7. */
	scrollToHour?: number;
	/** Fired with the centred page date whenever it changes. */
	onAnchorChange?: (iso: string) => void;
	/** Fired with the inclusive centred page range [start, end]. */
	onVisibleRangeChange?: (startIso: string, endIso: string) => void;
}

export interface TimelineScroll {
	scrollRef: RefObject<HTMLDivElement>;
	/** Virtual offset (canvas-y at the viewport top), in px. */
	offset: Signal<number>;
	viewportH: Signal<number>;
	viewportW: Signal<number>;
	/** Fixed ISO date at canvas y = 0 (a page start). */
	origin: string;
	/** Smoothly animate the offset to a target (teleport to "now"). */
	animateTo: (target: number, bounce?: boolean) => void;
	/** Begin a middle-mouse / grab pan from a pointer-down on the canvas. */
	beginPan: (e: MouseEvent) => void;
	/** State + handlers for the velocity scrollbar / schedule minimap. */
	scrollbar: ViewportScrollbar;
}

/** The page a date belongs to: week-aligned for Week view, the day itself otherwise. */
function pageStart(iso: string, daysPerPage: number): string {
	return daysPerPage === 7 ? startOfWeek(iso) : iso;
}

export function useTimelineScroll(opts: TimelineScrollOptions): TimelineScroll {
	const { anchor, daysPerPage: dpp, pageHeight, pxPerHour, scrollToHour = 7 } = opts;

	// Fixed coordinate origin (y=0) — computed once so the mapping never shifts.
	const origin = useRef(pageStart(anchor, dpp)).current;
	const intra = Math.max(0, scrollToHour * pxPerHour);

	const pageIndexOf = (iso: string) => daysBetween(origin, pageStart(iso, dpp)) / dpp;

	// The centre page we last applied/broadcast — breaks the cursor⇄scroll loop.
	const syncedCentre = useRef(pageStart(anchor, dpp));

	const cbAnchor = useRef(opts.onAnchorChange);
	const cbRange = useRef(opts.onVisibleRangeChange);
	cbAnchor.current = opts.onAnchorChange;
	cbRange.current = opts.onVisibleRangeChange;

	const broadcast = useRef<(offset: number) => void>(() => {});
	// Half-hour bounce-snap: canvas y=0 is a midnight, so ½-hour lines are exact
	// multiples of (pxPerHour / 2) — the timeline settles cleanly on the interval.
	const snapStep = pxPerHour / 2;
	const vp = useViewportScroll({
		onScroll: (o) => broadcast.current(o),
		snap: (o) => Math.round(o / snapStep) * snapStep,
	});

	broadcast.current = (offset: number) => {
		const centreY = offset + vp.viewportH.value / 2;
		const centreDate = addDays(origin, Math.floor(centreY / pageHeight) * dpp);
		if (centreDate !== syncedCentre.current) {
			syncedCentre.current = centreDate;
			cbAnchor.current?.(centreDate);
			cbRange.current?.(centreDate, addDays(centreDate, dpp - 1));
		}
	};

	// Initial landing on the anchor page's working hours.
	useLayoutEffect(() => {
		vp.setOffset(pageIndexOf(anchor) * pageHeight + intra);
	}, []);

	// Host cursor → programmatic re-anchor (no broadcast; guard already set).
	useEffect(() => {
		const target = pageStart(anchor, dpp);
		if (target === syncedCentre.current) return;
		syncedCentre.current = target;
		vp.setOffset(pageIndexOf(anchor) * pageHeight + intra);
	}, [anchor]);

	return {
		scrollRef: vp.scrollRef,
		offset: vp.offset,
		viewportH: vp.viewportH,
		viewportW: vp.viewportW,
		origin,
		animateTo: vp.animateTo,
		beginPan: vp.beginPan,
		scrollbar: vp.scrollbar,
	};
}
