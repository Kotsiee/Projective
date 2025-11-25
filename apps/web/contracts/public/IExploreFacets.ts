// packages/lib/search/explore/explore-facets.ts
// Facet / aggregation models that you use to build filters from result sets.

export interface NumericFacet {
	min: number | null;
	max: number | null;
	avg?: number | null;
}

export interface TermFacetBucket {
	value: string;
	count: number;
}

export type TermFacet = TermFacetBucket[];

// Generic facets bag. You can extend this per endpoint if needed via generics.
export interface ExploreFacets {
	// money
	price?: NumericFacet;
	hourlyRate?: NumericFacet;
	budget?: NumericFacet;

	// common categorical facets
	languages?: TermFacet;
	skills?: TermFacet;
	countries?: TermFacet;
	timezones?: TermFacet;
	topics?: TermFacet;
	serviceCategories?: TermFacet;
	productTypes?: TermFacet;
	licenseTypes?: TermFacet;

	// allow extension without changing this file
	[key: string]: NumericFacet | TermFacet | undefined;
}

// Generic response wrapper for any explore endpoint.
export interface ExploreResponse<
	TItem,
	TFacets extends ExploreFacets = ExploreFacets,
> {
	items: TItem[];
	page: number;
	pageSize: number;
	total: number;
	facets: Partial<TFacets>;
}
