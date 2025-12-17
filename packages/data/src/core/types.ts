/**
 * A stable unique identifier for an item.
 * Internally, we always convert this to a string for Map lookups.
 */
export type Key = string;

/**
 * Generic range request (index-based).
 */
export interface Range {
	start: number;
	length: number;
}

/**
 * A function that transforms raw backend data (Tin) into the target UI shape (Tout).
 */
export type Mapper<Tin = unknown, Tout = unknown> = (raw: Tin) => Tout;

/**
 * Metadata accompanying a fetch response.
 */
export interface FetchMeta {
	totalCount?: number;
	hasMoreForward?: boolean;
	hasMoreBackward?: boolean;
	cursor?: string;
}
