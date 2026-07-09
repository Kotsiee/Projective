// The velocity scrollbar, reimagined as a premium "Schedule Minimap".
//
// The thumb is a *relative velocity* control (a jog/shuttle wheel), not a
// position mapper: it rests centred at 50% of the track, shortens + drifts with
// scroll velocity, and eases home when idle via a CSS transition. Dragging it
// off-centre feeds `beginAccel`, which scrolls the timeline continuously at a
// speed set by the displacement.
//
// The track behind the thumb is a live minimap of a local time window around the
// viewport: ultra-thin, low-opacity ticks map Available / Reserved / Unavailable
// intervals, and a distinct anchor marks the exact current date/time (which sits
// near centre during normal usage). Visual language matches the Gantt chart's
// thumb (packages/charts) — an integrated tool asset, not an OS artifact.

import type { ViewportScrollbar } from '../hooks/useViewportScroll.ts';
import type { Signal } from '@preact/signals';
import { useSignal } from '@preact/signals';

/** Fraction of the track the centred thumb occupies at rest (exactly ½). */
const BASE_RATIO = 0.5;
const MARGIN = 4;
const MIN_LEN = 34;

/** One interval drawn on the minimap track, positioned as track fractions. */
export interface MinimapMark {
	/** Top edge as a 0…1 fraction of the track. */
	top: number;
	/** Height as a 0…1 fraction of the track. */
	height: number;
	state: 'available' | 'unavailable' | 'reserved';
}

export interface MinimapData {
	marks: MinimapMark[];
	/** Position of "now" as a 0…1 fraction of the track, or null if off-window. */
	nowFrac: number | null;
}

export interface TimelineScrollbarProps {
	viewportH: Signal<number>;
	scrollbar: ViewportScrollbar;
	minimap?: MinimapData;
}

function clamp(n: number, lo: number, hi: number): number {
	return Math.min(Math.max(n, lo), hi);
}

export function TimelineScrollbar({ viewportH, scrollbar, minimap }: TimelineScrollbarProps) {
	const { drift, shrink, dragging, beginAccel } = scrollbar;
	const hovered = useSignal(false);

	const vh = viewportH.value;
	if (vh <= 0) return null;

	const track = vh - MARGIN * 2;
	const base = track * BASE_RATIO;
	const len = Math.max(MIN_LEN, base * (1 - 0.34 * shrink.value));
	const maxDrift = Math.max(0, (track - len) / 2);
	const centreTop = MARGIN + (track - len) / 2;
	const top = centreTop + clamp(drift.value, -maxDrift, maxDrift);

	const active = hovered.value || dragging.value;

	return (
		<div class='cal-scrollbar' aria-hidden='true'>
			{/* Minimap track — a local schedule map behind the thumb. */}
			<div class='cal-scrollbar__track' style={{ top: `${MARGIN}px`, height: `${track}px` }}>
				{minimap?.marks.map((m, i) => (
					<span
						key={i}
						class='cal-scrollbar__tick'
						data-state={m.state}
						style={{
							top: `${clamp(m.top, 0, 1) * track}px`,
							height: `${Math.max(1.5, clamp(m.height, 0, 1) * track)}px`,
						}}
					/>
				))}
				{minimap?.nowFrac != null && (
					<span
						class='cal-scrollbar__now'
						style={{ top: `${clamp(minimap.nowFrac, 0, 1) * track}px` }}
					/>
				)}
			</div>

			<div
				class='cal-scrollbar__thumb'
				data-active={active}
				data-dragging={dragging.value}
				style={{ top: `${top}px`, height: `${len}px` }}
				onPointerDown={(e) => beginAccel(e, () => ({ maxDrift }))}
				onPointerEnter={() => (hovered.value = true)}
				onPointerLeave={() => (hovered.value = false)}
			/>
		</div>
	);
}
