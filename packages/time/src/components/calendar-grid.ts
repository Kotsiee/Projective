// Pure geometry + lookups shared by the day/week/month calendar views. No JSX,
// no signals — keeps the rendering components declarative.

import type { AvailabilityWindow, CalendarEvent, TimeOffRange } from '../types/calendar.ts';
import { isoWeekday } from '../hooks/date-utils.ts';

/** Layout constants for the vertical time grid. */
export interface GridGeometry {
	startMin: number;
	endMin: number;
	pxPerMin: number;
}

/** Builds grid geometry from an hour range and a pixel height per hour. */
export function makeGeometry(startHour: number, endHour: number, pxPerHour: number): GridGeometry {
	return {
		startMin: startHour * 60,
		endMin: endHour * 60,
		pxPerMin: pxPerHour / 60,
	};
}

/** Total painted column height in px. */
export function columnHeight(g: GridGeometry): number {
	return (g.endMin - g.startMin) * g.pxPerMin;
}

/** Top offset (px) for a minute value, clamped to the visible window. */
export function minuteToTop(g: GridGeometry, min: number): number {
	return (Math.max(min, g.startMin) - g.startMin) * g.pxPerMin;
}

/** Height (px) for a [start,end) span clipped to the visible window. */
export function spanHeight(g: GridGeometry, start: number, end: number): number {
	const s = Math.max(start, g.startMin);
	const e = Math.min(end, g.endMin);
	return Math.max(0, (e - s) * g.pxPerMin);
}

/** The hour marks (minutes) shown down the gutter, inclusive of the end hour. */
export function hourMarks(g: GridGeometry): number[] {
	const marks: number[] = [];
	for (let m = g.startMin; m <= g.endMin; m += 60) marks.push(m);
	return marks;
}

/** Availability windows that apply to an ISO date, sorted by start. */
export function windowsForDate(iso: string, windows: AvailabilityWindow[]): AvailabilityWindow[] {
	const wd = isoWeekday(iso);
	return windows.filter((w) => w.weekday === wd).sort((a, b) => a.start - b.start);
}

/** Events on an ISO date, sorted by start. */
export function eventsForDate(iso: string, events: CalendarEvent[]): CalendarEvent[] {
	return events.filter((e) => e.date === iso).sort((a, b) => a.start - b.start);
}

/** The time-off range covering an ISO date, if any (inclusive). */
export function timeOffForDate(iso: string, timeOff: TimeOffRange[]): TimeOffRange | null {
	return timeOff.find((t) => iso >= t.from && iso <= t.to) ?? null;
}

/** True when [start,end) lies fully inside at least one window. */
export function isWithinWindow(
	start: number,
	end: number,
	windows: AvailabilityWindow[],
): boolean {
	return windows.some((w) => start >= w.start && end <= w.end);
}

/** True when [start,end) overlaps any of `events`. */
export function overlapsEvent(start: number, end: number, events: CalendarEvent[]): boolean {
	return events.some((e) => start < e.end && end > e.start);
}

/** Cell start minutes within the visible window, at `slotMinutes` granularity. */
export function cellStarts(g: GridGeometry, slotMinutes: number): number[] {
	const starts: number[] = [];
	for (let m = g.startMin; m < g.endMin; m += slotMinutes) starts.push(m);
	return starts;
}

/**
 * A translucent tint of an arbitrary CSS colour, for painting availability
 * windows softly. Uses `color-mix` so it works with any colour token.
 */
export function tint(colour: string, pct: number): string {
	return `color-mix(in srgb, ${colour} ${pct}%, transparent)`;
}
