/**
 * @file Explore.ts
 * @description Contracts and reactive state definitions for the Unified Explore & Discovery Engine.
 */

import { Signal } from '@preact/signals';
import { EntityType, ExploreEntity, ExploreFilters, ExploreSort } from '@projective/types';

// #region 1. LEGACY ALIASES
// Retained so the (currently unused) REST search services + API route handlers keep type-checking.
// The live discovery surfaces below are driven entirely by the frontend seed.
export type ViewMode = 'grid' | 'list' | 'masonry';
export type SortType = ExploreSort;
export type SearchType =
	| 'projects'
	| 'marketplace'
	| 'traders'
	| 'services'
	| 'people'
	| 'posts'
	| 'all';
// #endregion

// #region 2. DISCOVERY MODEL

/** Session role state that drives the contextual hero CTA banner. */
export type UserRole = 'guest' | 'client' | 'freelancer';

/** The active entity-type facet. `'all'` is the federated (multi-entity) view. */
export type EntityFilter = EntityType | 'all';

/**
 * @interface ExploreState
 * @description Central reactive state contract for the Explore & Search discovery engine.
 */
export interface ExploreState {
	/** Current search term. */
	exploreQuery: Signal<string | null>;
	/** Active entity-type facet — `'all'` unlocks the federated view; a concrete type isolates it. */
	entityType: Signal<EntityFilter>;
	/** Active sort parameter (only meaningful in single-entity view). */
	sort: Signal<ExploreSort>;
	/** Advanced filter parameters (only applied in single-entity view). */
	filters: Signal<ExploreFilters>;
	/** The entity currently open in the split-pane inspector (single-entity view only). */
	selectedItem: Signal<ExploreEntity | null>;
	/** Whether the collapsible filter sidebar is open. */
	isFiltersOpen: Signal<boolean>;
	/** Session role — drives the contextual hero CTA. */
	userRole: Signal<UserRole>;
}

/** Convenience: default filter parameter set. */
export const DEFAULT_FILTERS: ExploreFilters = {
	entity_type: null,
	budget_min_cents: 0,
	budget_max_cents: 1_000_000,
	availability: null,
	min_rating: 0,
	skills: [],
	locations: [],
	languages: [],
};

// #endregion
