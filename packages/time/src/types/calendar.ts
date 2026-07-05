// Types for the generic minimalist calendar in @projective/time.

/** Which time span the calendar renders. */
export type CalendarView = 'day' | 'week' | 'month';

/** A single placed event on the calendar (booking / busy / tentative). */
export interface CalendarEvent {
	id: string;
	title: string;
	/** ISO date, `YYYY-MM-DD`. */
	date: string;
	/** Minutes from midnight, e.g. 540 = 09:00. */
	start: number;
	/** Minutes from midnight. */
	end: number;
	/** Visual treatment of the chip. Defaults to 'booking'. */
	kind?: 'booking' | 'busy' | 'tentative';
	/** Chip accent colour (any CSS colour). Falls back to `--primary`. */
	colour?: string;
	/** Small secondary line under the title (e.g. attendee / platform). */
	subtitle?: string;
}

/** A recurring weekly window during which the entity is available. */
export interface AvailabilityWindow {
	/** ISO weekday, 1 = Mon … 7 = Sun. */
	weekday: number;
	/** Minutes from midnight. */
	start: number;
	/** Minutes from midnight. */
	end: number;
	/** Tint colour for the window (any CSS colour). Falls back to `--primary`. */
	colour?: string;
}

/** An inclusive date range the entity is unavailable (holiday / time-off). */
export interface TimeOffRange {
	id: string;
	/** Inclusive ISO start date, `YYYY-MM-DD`. */
	from: string;
	/** Inclusive ISO end date, `YYYY-MM-DD`. */
	to: string;
	label?: string;
}
