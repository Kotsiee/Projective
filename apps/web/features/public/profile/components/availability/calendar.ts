/**
 * @file calendar.ts
 * @description Pure helpers shared by the availability grid components. Resolves
 * which availability slots apply to a given ISO date, detects time-off overlaps,
 * and slices the day into fixed granularity cells for the schedule fabric.
 *
 * No signals / no JSX here — presentational components import these to keep the
 * grid rendering declarative.
 */

import type {
	AvailabilityRule,
	BookingEntry,
	TimeOffBlock,
	TimeSlot,
} from '../../contracts/Profile.ts';
import { isoWeekday } from '../../utils.ts';

/** The vertical window the schedule fabric paints (minutes from midnight). */
export const DAY_START_MIN = 7 * 60; // 07:00
export const DAY_END_MIN = 20 * 60; // 20:00
/** Row height per 30 minutes, in px. Drives the absolute-positioned overlays. */
export const HALF_HOUR_PX = 26;
export const PX_PER_MIN = HALF_HOUR_PX / 30;

/** A resolved availability window on a concrete date (carries its rule colour). */
export interface ResolvedWindow {
	ruleId: string;
	ruleLabel: string;
	colour: string;
	start: number;
	end: number;
	slotLabel?: string;
}

/** Returns every availability window that applies to `iso`, across all rules. */
export function windowsForDate(iso: string, rules: AvailabilityRule[]): ResolvedWindow[] {
	const wd = isoWeekday(iso);
	const out: ResolvedWindow[] = [];
	for (const rule of rules) {
		if (!rule.days.includes(wd)) continue;
		for (const slot of rule.slots) {
			out.push({
				ruleId: rule.id,
				ruleLabel: rule.label,
				colour: rule.colour,
				start: slot.start,
				end: slot.end,
				slotLabel: slot.label,
			});
		}
	}
	return out.sort((a, b) => a.start - b.start);
}

/** The time-off block covering `iso`, if any (inclusive range). */
export function timeOffForDate(iso: string, timeOff: TimeOffBlock[]): TimeOffBlock | null {
	return timeOff.find((t) => iso >= t.startDate && iso <= t.endDate) ?? null;
}

/** Bookings on `iso`, sorted by start. */
export function bookingsForDate(iso: string, bookings: BookingEntry[]): BookingEntry[] {
	return bookings.filter((b) => b.date === iso).sort((a, b) => a.start - b.start);
}

/** True when `[start,end)` falls fully inside at least one availability window. */
export function isWithinWindow(start: number, end: number, windows: ResolvedWindow[]): boolean {
	return windows.some((w) => start >= w.start && end <= w.end);
}

/** True when the cell overlaps an existing booking. */
export function overlapsBooking(start: number, end: number, bookings: BookingEntry[]): boolean {
	return bookings.some((b) => start < b.end && end > b.start);
}

/** Ordered list of cell start-minutes for the painted day window. */
export function cellStarts(slotMinutes: number): number[] {
	const starts: number[] = [];
	for (let m = DAY_START_MIN; m < DAY_END_MIN; m += slotMinutes) starts.push(m);
	return starts;
}

/** Hour labels down the time gutter (07:00 … 20:00). */
export function hourMarks(): number[] {
	const marks: number[] = [];
	for (let h = DAY_START_MIN; h <= DAY_END_MIN; h += 60) marks.push(h);
	return marks;
}

/** Top offset (px) for a minute value within the painted window. */
export function minuteToTop(min: number): number {
	return (min - DAY_START_MIN) * PX_PER_MIN;
}

/** Height (px) for a duration in minutes. */
export function durationToHeight(start: number, end: number): number {
	return (end - start) * PX_PER_MIN;
}

/** Total painted column height (px). */
export function columnHeight(): number {
	return (DAY_END_MIN - DAY_START_MIN) * PX_PER_MIN;
}

/** Compact `HH:MM–HH:MM` label for a slot. */
export function slotRange(slot: TimeSlot): string {
	const fmt = (m: number) =>
		`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
	return `${fmt(slot.start)}–${fmt(slot.end)}`;
}
