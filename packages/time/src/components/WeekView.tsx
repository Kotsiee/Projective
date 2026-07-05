// Week view — seven day columns in a continuously virtualized time grid.

import type { AvailabilityWindow, CalendarEvent, TimeOffRange } from '../types/calendar.ts';
import { TimeGridView } from './TimeGridView.tsx';

export interface WeekViewProps {
	/** Cursor (ISO date) the week is anchored to. */
	anchor: string;
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

export function WeekView(props: WeekViewProps) {
	return <TimeGridView daysPerPage={7} {...props} />;
}
