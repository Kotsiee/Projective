// Floating custom scrollbar for the infinite timeline — visual + interaction
// parity with the Gantt chart's thumb (packages/charts): a softly rounded,
// low-contrast overlay that reads as an integrated tool asset, not an OS artifact.
//
// The thumb is *relative*: it rests centred with symmetric headroom (the 2×
// viewport model), drifts + shortens with scroll velocity, and eases back to
// centre when idle via a CSS transition. It is also a real control — dragging it
// pans the virtual offset.

import type { ViewportScrollbar } from '../hooks/useViewportScroll.ts';
import type { Signal } from '@preact/signals';
import { useSignal } from '@preact/signals';

/** Fraction of the track the centred thumb occupies (2× viewport headroom → ~½). */
const BASE_RATIO = 0.46;
const MARGIN = 4;
const MIN_LEN = 40;

export interface TimelineScrollbarProps {
	viewportH: Signal<number>;
	scrollbar: ViewportScrollbar;
}

function clamp(n: number, lo: number, hi: number): number {
	return Math.min(Math.max(n, lo), hi);
}

export function TimelineScrollbar({ viewportH, scrollbar }: TimelineScrollbarProps) {
	const { drift, shrink, dragging, onThumbDown } = scrollbar;
	const hovered = useSignal(false);

	const vh = viewportH.value;
	if (vh <= 0) return null;

	const track = vh - MARGIN * 2;
	const base = track * BASE_RATIO;
	const len = Math.max(MIN_LEN, base * (1 - 0.22 * shrink.value));
	const maxDrift = Math.max(0, (track - len) / 2);
	const top = MARGIN + (track - len) / 2 + clamp(drift.value, -maxDrift, maxDrift);

	const active = hovered.value || dragging.value;

	return (
		<div class='cal-scrollbar' aria-hidden='true'>
			<div
				class='cal-scrollbar__thumb'
				data-active={active}
				data-dragging={dragging.value}
				style={{ top: `${top}px`, height: `${len}px` }}
				onPointerDown={onThumbDown}
				onPointerEnter={() => (hovered.value = true)}
				onPointerLeave={() => (hovered.value = false)}
			/>
		</div>
	);
}
