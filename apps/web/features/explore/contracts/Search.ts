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
}
// #endregion

// #region 3. Entity-Specific Search Parameters
/**
 * @interface TeamSearchParams
 * @description Filter parameters for searching teams.
 */
export interface TeamSearchParams extends BaseSearchParams {
	minRate?: number;
	maxRate?: number;
}

/**
 * @interface FreelancerSearchParams
 * @description Filter parameters for searching freelancers.
 */
export interface FreelancerSearchParams extends BaseSearchParams {
	minRate?: number;
	maxRate?: number;
	skills?: string[];
}

/**
 * @interface UserSearchParams
 * @description Filter parameters for searching users (social/people).
 */
export interface UserSearchParams extends BaseSearchParams {
	country?: string;
}

/**
 * @interface BusinessSearchParams
 * @description Filter parameters for searching business profiles.
 */
export interface BusinessSearchParams extends BaseSearchParams {
	country?: string;
}

/**
 * @interface ProjectSearchParams
 * @description Filter parameters for searching open projects/gigs.
 */
export interface ProjectSearchParams extends BaseSearchParams {
	industryId?: string;
}

/**
 * @interface ServiceSearchParams
 * @description Filter parameters for searching marketplace services/portfolios.
 */
export interface ServiceSearchParams extends BaseSearchParams {}
// #endregion
