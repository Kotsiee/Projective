// Figma-style relative infinite viewport physics — the shared scroll engine for
// every calendar view (Day / Week / Month).
//
// There is NO native scroll and NO massive spacer. The container is
// `overflow: hidden`; a single unbounded `offset` signal (virtual px from a
// stable time origin) is driven by the wheel and by dragging a custom thumb.
// Because the offset is just a number and rendering is a pure function of it,
// the timeline is genuinely infinite in both directions and never leaks DOM.
//
// The custom scrollbar is *relative* (like Figma's on an infinite canvas): the
// thumb rests centred with symmetric headroom, drifts + shortens slightly with
// scroll velocity, then eases back to centre when the gesture stops. This mirrors
// the Gantt chart's floating thumb (packages/charts) rather than an OS artifact.

import { type Signal, useSignal } from '@preact/signals';
import { useEffect, useLayoutEffect, useRef } from 'preact/hooks';
import type { RefObject } from 'preact';

/** Max thumb drift from centre, in px (the elastic headroom). */
const DRIFT_MAX = 64;
/** How strongly a wheel delta nudges the thumb off centre. */
const DRIFT_K = 0.35;
/** Thumb travel → offset gain while dragging the thumb (relative, ~3 viewports). */
const DRAG_GAIN = 3;
/** Idle delay before the thumb eases back to centre. */
const IDLE_MS = 140;

export interface ViewportScrollOptions {
	/** Fired with the new offset whenever the user scrolls (wheel or thumb drag). */
	onScroll?: (offset: number) => void;
}

export interface ViewportScrollbar {
	/** Signed thumb drift from centre, in px (eases to 0 when idle). */
	drift: Signal<number>;
	/** 0…1 velocity shrink factor for the thumb length. */
	shrink: Signal<number>;
	/** True while the thumb is being dragged. */
	dragging: Signal<boolean>;
	/** Begin a thumb drag from a pointer-down on the thumb. */
	onThumbDown: (e: MouseEvent) => void;
}

export interface ViewportScroll {
	/** Attach to the `overflow: hidden` viewport container. */
	scrollRef: RefObject<HTMLDivElement>;
	/** Virtual scroll offset (canvas-y at the viewport top), in px. Unbounded. */
	offset: Signal<number>;
	viewportH: Signal<number>;
	viewportW: Signal<number>;
	/** Imperatively jump the offset (used for cursor re-anchoring). */
	setOffset: (v: number) => void;
	/** State + handlers for the floating custom scrollbar. */
	scrollbar: ViewportScrollbar;
}

function clamp(n: number, lo: number, hi: number): number {
	return Math.min(Math.max(n, lo), hi);
}

/**
 * Owns the virtual offset, viewport size, wheel + thumb-drag input, and the
 * elastic relative-thumb state. Rendering reads `offset` and repaints a slice —
 * nothing mounts on scroll.
 */
export function useViewportScroll(opts: ViewportScrollOptions = {}): ViewportScroll {
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const offset = useSignal(0);
	const viewportH = useSignal(0);
	const viewportW = useSignal(0);

	const drift = useSignal(0);
	const shrink = useSignal(0);
	const dragging = useSignal(false);

	const onScroll = useRef(opts.onScroll);
	onScroll.current = opts.onScroll;

	const idleTimer = useRef<number | null>(null);
	const scheduleIdle = () => {
		if (idleTimer.current !== null) clearTimeout(idleTimer.current);
		idleTimer.current = setTimeout(() => {
			drift.value = 0; // eased back to centre by the thumb's CSS transition
			shrink.value = 0;
		}, IDLE_MS) as unknown as number;
	};

	// #region Measure viewport.
	useLayoutEffect(() => {
		const el = scrollRef.current;
		if (!el) return;
		viewportH.value = el.clientHeight;
		viewportW.value = el.clientWidth;
	}, []);

	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;
		const ro = new ResizeObserver(() => {
			viewportH.value = el.clientHeight;
			viewportW.value = el.clientWidth;
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, []);
	// #endregion

	// #region Wheel → virtual offset.
	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;
		const onWheel = (e: WheelEvent) => {
			e.preventDefault();
			const dy = e.deltaMode === 1
				? e.deltaY * 16 // line mode
				: e.deltaMode === 2
				? e.deltaY * viewportH.value // page mode
				: e.deltaY;
			offset.value += dy;
			drift.value = clamp(drift.value + dy * DRIFT_K, -DRIFT_MAX, DRIFT_MAX);
			shrink.value = 1;
			scheduleIdle();
			onScroll.current?.(offset.value);
		};
		el.addEventListener('wheel', onWheel, { passive: false });
		return () => el.removeEventListener('wheel', onWheel);
	}, []);
	// #endregion

	// #region Thumb drag → virtual offset (relative gain).
	const dragState = useRef({ startY: 0, startOffset: 0 });
	const onThumbMove = (e: PointerEvent) => {
		if (!dragging.value) return;
		const dy = e.clientY - dragState.current.startY;
		offset.value = dragState.current.startOffset + dy * DRAG_GAIN;
		drift.value = clamp(dy, -DRIFT_MAX, DRIFT_MAX);
		onScroll.current?.(offset.value);
	};
	const onThumbUp = () => {
		if (!dragging.value) return;
		dragging.value = false;
		drift.value = 0;
		shrink.value = 0;
		globalThis.removeEventListener('pointermove', onThumbMove);
		globalThis.removeEventListener('pointerup', onThumbUp);
	};
	const onThumbDown = (e: MouseEvent) => {
		e.preventDefault();
		dragging.value = true;
		dragState.current = { startY: e.clientY, startOffset: offset.value };
		globalThis.addEventListener('pointermove', onThumbMove);
		globalThis.addEventListener('pointerup', onThumbUp);
	};

	useEffect(() => () => {
		globalThis.removeEventListener('pointermove', onThumbMove);
		globalThis.removeEventListener('pointerup', onThumbUp);
		if (idleTimer.current !== null) clearTimeout(idleTimer.current);
	}, []);
	// #endregion

	return {
		scrollRef,
		offset,
		viewportH,
		viewportW,
		setOffset: (v) => (offset.value = v),
		scrollbar: { drift, shrink, dragging, onThumbDown },
	};
}
