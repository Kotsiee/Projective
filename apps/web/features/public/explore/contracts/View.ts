import { Signal } from '@preact/signals';
import { FullProjectResponse } from '@projective/types';

export type ExploreResponses = FullProjectResponse;
export type ViewMode = 'grid' | 'list' | 'masonry';
export type SortType = 'recommended' | 'price' | 'rating' | 'recent';
export type SearchType =
	| 'projects'
	| 'marketplace'
	| 'traders'
	| 'services'
	| 'people'
	| 'posts'
	| 'all';

/**
 * @interface ExploreState
 * @description The central state contract for the Explore & Search discovery engine.
 */
export interface ExploreState {
	/** The current search term entered by the user */
	exploreQuery: Signal<string | null>;
	/** The layout mode for the search results (e.g., grid vs list) */
	viewMode: Signal<ViewMode>;
	/** The active federated search tab */
	searchType: Signal<SearchType>;
	/** The active sorting parameter */
	sortType: Signal<SortType>;
	/** Store the full data object of the selected item instead of just the ID */
	selectedItem: Signal<any | null>;
	/** Controls the visibility of the sticky filter sidebar */
	isFiltersOpen: Signal<boolean>;
}
