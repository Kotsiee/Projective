// Day view — a single day column in a continuously virtualized time grid. The
// timeline scrolls day-by-day; the vertical axis is the full 24-hour matrix.

import type { AvailabilityWindow, CalendarEvent, TimeOffRange } from '../types/calendar.ts';
import { TimeGridView } from './TimeGridView.tsx';

export interface DayViewProps {
	/** The day (ISO date) the timeline is anchored to. */
	day: string;
	events: CalendarEvent[];
	windows: AvailabilityWindow[];
	timeOff: TimeOffRange[];
	slotMinutes: number;
	pxPerHour?: number;
	scrollToHour?: number;
	onSelectSlot?: (date: string, startMin: number) => void;
	onEventClick?: (event: CalendarEvent) => void;
	onAnchorChange?: (iso: string) => void;
	onVisibleRangeChange?: (startIso: string, endIso: string) => void;
}

export function DayView({ day, ...rest }: DayViewProps) {
	return <TimeGridView daysPerPage={1} anchor={day} {...rest} />;
}
