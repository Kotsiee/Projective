// #region 1. Core Interfaces
/**
 * @interface SearchResult
 * @description The standardized return format from all search RPCs.
 */
export interface SearchResult {
	id: string;
	similarity: number;
}
// #endregion

// #region 2. Base Search Parameters
/**
 * @interface BaseSearchParams
 * @description Standard parameters applied to all search queries.
 */
export interface BaseSearchParams {
	query?: string;
	limit?: number;
	offset?: number;
}
// #endregion

/**
 * @interface PeopleSearchParams extends BaseSearchParams {

 * @description Filter parameters for searching people.
 */
export interface PeopleSearchParams extends BaseSearchParams {
	minRate?: number;
	maxRate?: number;
	type?: string; // Freelancer, Agency, etc.
	skills?: string;
	serviceTypes?: string;
	location?: string;
	languages?: string[];
}

export interface ProjectsSearchParams extends BaseSearchParams {
	category?: string;
	budgetMin?: number;
	budgetMax?: number;
	durationMin?: number;
	durationMax?: number;
	skills?: string;
}

export interface ServicesSearchParams extends BaseSearchParams {
	type?: string; // File, Session, Maintenance, etc.
	revisions?: number;
	priceMin?: number;
	priceMax?: number;
	languages?: string[];
}

export type SearchParams = PeopleSearchParams | ProjectsSearchParams | ServicesSearchParams;
