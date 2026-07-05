// Day/Week date mapping over the shared infinite-viewport physics engine.
//
// `useViewportScroll` owns the virtual `offset` (there is no native scroll); this
// hook fixes a stable time origin at canvas y=0, translates offset → the centred
// page date (broadcast to the host), and re-anchors the offset when the host
// cursor changes (toolbar nav / date picking). No feedback loop: the broadcast
// and the cursor effect guard on a single `syncedCentre` ref.

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
	/** Pixels per hour (for the intra-page landing offset). */
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
	/** State + handlers for the floating custom scrollbar. */
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
	const vp = useViewportScroll({ onScroll: (o) => broadcast.current(o) });

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
		scrollbar: vp.scrollbar,
	};
}
