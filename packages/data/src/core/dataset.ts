import type { Key } from './types.ts';

/**
 * A single item wrapper that separates the raw data from UI state.
 */
export interface NormalizedItem<T> {
	/** Stable unique key (derived from DB ID or generated) */
	key: Key;
	/** The actual domain object (e.g., User, Project) */
	data: T;
	/** Is this item currently selected? */
	selected: boolean;
	/** Is this item effectively a placeholder/loading state? */
	isSkeleton: boolean;
	/** Layout hints for variable height calculations */
	layout?: {
		estimatedHeight?: number;
		measuredHeight?: number;
	};
}

/**
 * The state container representing the current view of the data.
 * This is "Snapshot" safe - replace the whole object to trigger UI updates.
 */
export interface Dataset<T> {
	/** Map of Key -> Item for O(1) lookups */
	items: Map<Key, NormalizedItem<T>>;

	/** Ordered list of keys currently visible/loaded in the specific sort order */
	order: Key[];

	/** Total count of items on the server (if known) */
	totalCount: number | null;

	/** Tracks loading states for specific ranges to prevent double-fetching */
	pendingRanges: Array<{ start: number; end: number }>;
}

/**
 * Factory to create an empty dataset.
 */
export function createEmptyDataset<T>(): Dataset<T> {
	return {
		items: new Map(),
		order: [],
		totalCount: null,
		pendingRanges: [],
	};
}

// Add this helper
export function createSkeletonItem<T>(index: number): NormalizedItem<T> {
	return {
		key: `skeleton-${index}`,
		data: {} as T, // Empty data for skeletons
		selected: false,
		isSkeleton: true,
		layout: { estimatedHeight: 50 }, // Default height
	};
}
