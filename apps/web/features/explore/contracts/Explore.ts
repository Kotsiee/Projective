import { Signal } from '@preact/signals';

// #region 1. TYPE DEFINITIONS
export type ViewMode = 'grid' | 'list' | 'masonry';
export type SearchTab = 'all' | 'products' | 'services' | 'work' | 'resources' | 'projects';
export type SortType = 'recommended' | 'price' | 'rating' | 'recent';
// #endregion

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
	searchTab: Signal<SearchTab>;
	/** The active sorting parameter */
	sortType: Signal<SortType>;
	/** The ID of the item currently selected for split-view or modal inspection */
	selectedItemId: Signal<string | null>;
	/** Controls the visibility of the sticky filter sidebar */
	isFiltersOpen: Signal<boolean>;
}
