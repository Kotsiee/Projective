// packages/lib/search/explore/explore-categories.ts
// Explore-specific categories, subcategories, and sort options.

export type ExploreCategory = 'work' | 'resources' | 'projects';

export type ExploreSubcategory =
	| 'services'
	| 'freelancers'
	| 'teams'
	| 'templates'
	| 'products'
	| 'articles'
	| 'courses'
	| 'projects';

export type IExploreRequestSortBy =
	| 'recommended'
	| 'newest'
	| 'oldest'
	| 'mostPopular'
	| 'highestRated'
	| 'lowestRated'
	| 'priceLowToHigh'
	| 'priceHighToLow';

// Compile-time mapping from subcategory → category.
// This is purely a type-level mapping, no runtime code.
export type ExploreCategoryForSubcategory<S extends ExploreSubcategory> = S extends
	| 'services'
	| 'freelancers'
	| 'teams' ? 'work'
	: S extends 'projects' ? 'projects'
	: 'resources';
