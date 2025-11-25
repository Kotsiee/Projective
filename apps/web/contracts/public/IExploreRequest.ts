import {
	ExploreCategoryForSubcategory,
	ExploreSubcategory,
	IExploreRequestSortBy,
} from './IExploreCategories.ts';
import {
	ArticlesFilters,
	CoursesFilters,
	FreelancerFilters,
	ProductsFilters,
	ProjectsFilters,
	ServicesFilters,
	TeamFilters,
	TemplatesFilters,
} from './IExploreFilters.ts';
import { ISearchRequestWithSortAndFilter } from './ISearchRequest.ts';

// Text/semantic query shape, extendable later.
export interface ExploreQuery {
	term?: string;
}

// Mapping from subcategory → filters interface.
export interface ExploreFiltersBySubcategory {
	services: ServicesFilters;
	freelancers: FreelancerFilters;
	teams: TeamFilters;
	templates: TemplatesFilters;
	products: ProductsFilters;
	articles: ArticlesFilters;
	courses: CoursesFilters;
	projects: ProjectsFilters;
}

export type ExploreFilters<S extends ExploreSubcategory> = ExploreFiltersBySubcategory[S];

export type ExploreRequestFor<S extends ExploreSubcategory> =
	& ISearchRequestWithSortAndFilter<
		ExploreQuery,
		ExploreFilters<S>,
		IExploreRequestSortBy
	>
	& {
		category: ExploreCategoryForSubcategory<S>;
		subcategory: S;
	};

// Union type for handlers that accept any explore subcategory.
export type ExploreRequest =
	| ExploreRequestFor<'services'>
	| ExploreRequestFor<'freelancers'>
	| ExploreRequestFor<'teams'>
	| ExploreRequestFor<'templates'>
	| ExploreRequestFor<'products'>
	| ExploreRequestFor<'articles'>
	| ExploreRequestFor<'courses'>
	| ExploreRequestFor<'projects'>;

// Optional convenience helper to infer subcategory from a request.
export type InferExploreSubcategory<T extends ExploreRequest> = T['subcategory'];

// Optional convenience helper to get filters type from a subcategory.
export type InferExploreFilters<T extends ExploreRequest> = T extends
	ExploreRequestFor<infer S extends ExploreSubcategory> ? ExploreFilters<S>
	: never;
