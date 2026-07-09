// Boundless velocity viewport physics — the shared scroll engine for every
// calendar view (Day / Week / Month).
//
// There is NO native scroll, NO spacer, and NO bounds. The container is
// `overflow: hidden`; a single unbounded `offset` signal (virtual px from a
// stable time origin) is driven by the wheel, a velocity accelerator thumb, and
// a middle-mouse pan. Rendering is a pure function of `offset`, so the timeline
// is genuinely infinite in both directions and never mounts/unmounts DOM or
// leaks: only the visible slice is ever painted.
//
// The custom scrollbar is a *relative velocity* control (like a jog/shuttle
// wheel), not a position mapper: the thumb rests centred at 50% of the track,
// drifts + shortens with scroll velocity, and eases home when idle. Dragging it
// off-centre sets a continuous scroll velocity proportional to the displacement
// — the further from centre, the faster the timeline flies.

import { type Signal, useSignal } from '@preact/signals';
import { useEffect, useLayoutEffect, useRef } from 'preact/hooks';
import type { RefObject } from 'preact';

/** How strongly a wheel delta nudges the thumb off centre. */
const DRIFT_K = 0.32;
/** Soft cap for wheel-driven thumb drift, in px (the scrollbar re-clamps to fit). */
const DRIFT_MAX = 96;
/** Idle delay before the thumb eases back to centre + the offset snaps. */
const IDLE_MS = 140;
/** Peak accelerator speed at full thumb deflection, in px per 60fps-frame. */
const MAX_ACCEL = 62;

function clamp(n: number, lo: number, hi: number): number {
	return Math.min(Math.max(n, lo), hi);
}

/** Overshoot easing → a soft bounce past the target before it settles. */
function easeOutBack(t: number): number {
	const c1 = 1.70158;
	const c3 = c1 + 1;
	return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/** Clean deceleration for teleports (no overshoot). */
function easeOutCubic(t: number): number {
	return 1 - Math.pow(1 - t, 3);
}

export interface ViewportScrollOptions {
	/** Fired with the new offset whenever it changes (wheel, accel, pan, anim). */
	onScroll?: (offset: number) => void;
	/** Maps a settled offset → its nearest premium resting line (bounce-snap). */
	snap?: (offset: number) => number;
}

export interface ViewportScrollbar {
	/** Signed thumb drift from centre, in px (eases to 0 when idle). */
	drift: Signal<number>;
	/** 0…1 velocity shrink factor for the thumb length. */
	shrink: Signal<number>;
	/** True while the accelerator thumb is being dragged. */
	dragging: Signal<boolean>;
	/**
	 * Begin an accelerator drag from a pointer-down on the thumb. `metrics()`
	 * yields the live max drift (½ the track headroom) so the pointer maps onto a
	 * bounded velocity: at `maxDrift` the timeline flies at full speed.
	 */
	beginAccel: (e: PointerEvent, metrics: () => { maxDrift: number }) => void;
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
	/** Smoothly animate the offset to a target (teleport to "now"). */
	animateTo: (target: number, bounce?: boolean) => void;
	/** Begin a middle-mouse / grab pan from a pointer-down on the canvas. */
	beginPan: (e: MouseEvent) => void;
	/** State + handlers for the velocity scrollbar / minimap. */
	scrollbar: ViewportScrollbar;
}

/**
 * Owns the virtual offset, viewport size, wheel + accelerator + middle-mouse pan
 * input, and the elastic relative-thumb state. Rendering reads `offset` and
 * repaints a slice — nothing mounts on scroll, in either direction, forever.
 */
export function useViewportScroll(opts: ViewportScrollOptions = {}): ViewportScroll {
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const offset = useSignal(0);
	const viewportH = useSignal(0);
	const viewportW = useSignal(0);

	const drift = useSignal(0);
	const shrink = useSignal(0);
	const dragging = useSignal(false);

	const cfg = useRef(opts);
	cfg.current = opts;
	const emit = () => cfg.current.onScroll?.(offset.value);

	// #region rAF tween (teleport + snap settle) -----------------------------
	const anim = useRef<number | null>(null);
	const cancelAnim = () => {
		if (anim.current !== null) {
			cancelAnimationFrame(anim.current);
			anim.current = null;
		}
	};
	const animateTo = (target: number, bounce = false) => {
		cancelAnim();
		const from = offset.value;
		const dist = target - from;
		if (Math.abs(dist) < 0.5) {
			offset.value = target;
			emit();
			return;
		}
		const dur = clamp(Math.abs(dist) * 0.4, 220, 640);
		const ease = bounce ? easeOutBack : easeOutCubic;
		const start = performance.now();
		const step = (t: number) => {
			const p = Math.min(1, (t - start) / dur);
			offset.value = from + dist * ease(p);
			emit();
			if (p < 1) {
				anim.current = requestAnimationFrame(step);
			} else {
				anim.current = null;
				offset.value = target;
				emit();
			}
		};
		anim.current = requestAnimationFrame(step);
	};
	// #endregion

	// Settle after a free gesture: ease the thumb home + bounce-snap the offset.
	const idleTimer = useRef<number | null>(null);
	const settle = () => {
		drift.value = 0; // eased back to centre by the thumb's CSS transition
		shrink.value = 0;
		const snapped = cfg.current.snap?.(offset.value);
		if (snapped !== undefined && Math.abs(snapped - offset.value) > 0.5) {
			animateTo(snapped, /* bounce */ true);
		}
	};
	const scheduleIdle = () => {
		if (idleTimer.current !== null) clearTimeout(idleTimer.current);
		idleTimer.current = setTimeout(settle, IDLE_MS) as unknown as number;
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

	// #region Wheel → virtual offset (elastic thumb, bounce-snap on idle).
	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;
		const onWheel = (e: WheelEvent) => {
			e.preventDefault();
			cancelAnim();
			const dy = e.deltaMode === 1
				? e.deltaY * 16 // line mode
				: e.deltaMode === 2
				? e.deltaY * viewportH.value // page mode
				: e.deltaY;
			offset.value += dy;
			drift.value = clamp(drift.value + dy * DRIFT_K, -DRIFT_MAX, DRIFT_MAX);
			shrink.value = 1;
			emit();
			scheduleIdle();
		};
		el.addEventListener('wheel', onWheel, { passive: false });
		return () => el.removeEventListener('wheel', onWheel);
	}, []);
	// #endregion

	// #region Middle-mouse / grab pan across the canvas (1:1, precise).
	const panState = useRef({ startY: 0, startOffset: 0 });
	const onPanMove = (e: PointerEvent) => {
		// Natural grab: dragging the surface down reveals earlier time (offset ↓).
		offset.value = panState.current.startOffset - (e.clientY - panState.current.startY);
		emit();
	};
	const onPanUp = () => {
		globalThis.removeEventListener('pointermove', onPanMove);
		globalThis.removeEventListener('pointerup', onPanUp);
		settle();
	};
	const beginPan = (e: MouseEvent) => {
		e.preventDefault();
		cancelAnim();
		panState.current = { startY: e.clientY, startOffset: offset.value };
		globalThis.addEventListener('pointermove', onPanMove);
		globalThis.addEventListener('pointerup', onPanUp);
	};
	// #endregion

	// #region Accelerator thumb drag → continuous velocity scroll.
	// Displacement from centre sets a speed, not a position. A rAF loop advances
	// the offset each frame while the thumb is held off-centre; speed is
	// time-scaled so it is frame-rate independent, and eases (^1.6) for fine
	// low-speed control. Max deflection → the timeline flies; nothing clamps it.
	const accel = useRef<number | null>(null);
	const accelState = useRef({ startY: 0, maxDrift: 1, last: 0 });
	const stopAccel = () => {
		if (accel.current !== null) {
			cancelAnimationFrame(accel.current);
			accel.current = null;
		}
	};
	const accelStep = (t: number) => {
		const s = accelState.current;
		const dt = s.last === 0 ? 1 : Math.min(3, (t - s.last) / 16.67);
		s.last = t;
		const ratio = clamp(drift.value / s.maxDrift, -1, 1);
		const speed = Math.sign(ratio) * Math.pow(Math.abs(ratio), 1.6) * MAX_ACCEL;
		if (speed !== 0) {
			offset.value += speed * dt;
			shrink.value = Math.abs(ratio);
			emit();
		}
		accel.current = requestAnimationFrame(accelStep);
	};
	const onAccelMove = (e: PointerEvent) => {
		if (!dragging.value) return;
		const { maxDrift } = accelState.current;
		drift.value = clamp(e.clientY - accelState.current.startY, -maxDrift, maxDrift);
	};
	const onAccelUp = () => {
		if (!dragging.value) return;
		dragging.value = false;
		stopAccel();
		globalThis.removeEventListener('pointermove', onAccelMove);
		globalThis.removeEventListener('pointerup', onAccelUp);
		settle();
	};
	const beginAccel = (e: PointerEvent, metrics: () => { maxDrift: number }) => {
		e.preventDefault();
		cancelAnim();
		dragging.value = true;
		accelState.current = {
			startY: e.clientY,
			maxDrift: Math.max(1, metrics().maxDrift),
			last: 0,
		};
		drift.value = 0;
		globalThis.addEventListener('pointermove', onAccelMove);
		globalThis.addEventListener('pointerup', onAccelUp);
		accel.current = requestAnimationFrame(accelStep);
	};
	// #endregion

	useEffect(() => () => {
		cancelAnim();
		stopAccel();
		if (idleTimer.current !== null) clearTimeout(idleTimer.current);
		globalThis.removeEventListener('pointermove', onPanMove);
		globalThis.removeEventListener('pointerup', onPanUp);
		globalThis.removeEventListener('pointermove', onAccelMove);
		globalThis.removeEventListener('pointerup', onAccelUp);
	}, []);

	return {
		scrollRef,
		offset,
		viewportH,
		viewportW,
		setOffset: (v) => {
			cancelAnim();
			offset.value = v;
		},
		animateTo,
		beginPan,
		scrollbar: { drift, shrink, dragging, beginAccel },
	};
}
