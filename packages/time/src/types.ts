// Shared types for @projective/time scheduling components.

/** Day of week, 0 = Sunday … 6 = Saturday. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** A single weekly availability window on a given day. Times are 'HH:mm'. */
export interface AvailabilitySlot {
	day: Weekday;
	start: string;
	end: string;
}

/** A range of dates the entity is unavailable. `from`/`to` are ISO date strings ('YYYY-MM-DD'). */
export interface AwayDate {
	id: string;
	from: string;
	to: string;
	note?: string;
}

/** Full availability payload: display timezone, weekly windows and away ranges. */
export interface AvailabilityValue {
	timezone: string;
	weekly: AvailabilitySlot[];
	away: AwayDate[];
}
