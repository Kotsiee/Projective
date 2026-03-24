/**
 * @file search-service.ts
 * @description Frontend Service layer for Explore & Search interactions.
 * Handles API calls to /api/v1/public/search/* ensuring Islands remain thin.
 */

import {
	BusinessSearchParams,
	FreelancerSearchParams,
	ProjectSearchParams,
	SearchResult,
	ServiceSearchParams,
	TeamSearchParams,
	UserSearchParams,
} from '../contracts/Search.ts';

export class SearchService {
	// #region 1. Helper Methods
	/**
	 * @private
	 * @description Safely serializes query parameters, dropping undefined values and handling arrays.
	 */
	private static buildQueryString(params: Record<string, any>): string {
		const searchParams = new URLSearchParams();
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== null) {
				if (Array.isArray(value)) {
					// Encode arrays as comma-separated strings
					searchParams.append(key, value.join(','));
				} else {
					searchParams.append(key, String(value));
				}
			}
		}
		return searchParams.toString();
	}
	// #endregion

	// #region 2. Entity Search Methods
	/**
	 * @function searchTeams
	 * @description Fetches a list of team IDs matching the query and filters.
	 * @param {TeamSearchParams} params
	 * @returns {Promise<SearchResult[]>}
	 */
	static async searchTeams(params: TeamSearchParams): Promise<SearchResult[]> {
		const qs = SearchService.buildQueryString(params);
		const res = await fetch(`/api/v1/public/search/teams?${qs}`);
		if (!res.ok) throw new Error(`Failed to search teams: ${res.statusText}`);
		return await res.json() as SearchResult[];
	}

	/**
	 * @function searchFreelancers
	 * @description Fetches a list of freelancer IDs matching the query and filters.
	 * @param {FreelancerSearchParams} params
	 * @returns {Promise<SearchResult[]>}
	 */
	static async searchFreelancers(params: FreelancerSearchParams): Promise<SearchResult[]> {
		const qs = SearchService.buildQueryString(params);
		const res = await fetch(`/api/v1/public/search/freelancers?${qs}`);
		if (!res.ok) throw new Error(`Failed to search freelancers: ${res.statusText}`);
		return await res.json() as SearchResult[];
	}

	/**
	 * @function searchUsers
	 * @description Fetches a list of user IDs matching the query and filters.
	 * @param {UserSearchParams} params
	 * @returns {Promise<SearchResult[]>}
	 */
	static async searchUsers(params: UserSearchParams): Promise<SearchResult[]> {
		const qs = SearchService.buildQueryString(params);
		const res = await fetch(`/api/v1/public/search/users?${qs}`);
		if (!res.ok) throw new Error(`Failed to search users: ${res.statusText}`);
		return await res.json() as SearchResult[];
	}

	/**
	 * @function searchBusinesses
	 * @description Fetches a list of business IDs matching the query and filters.
	 * @param {BusinessSearchParams} params
	 * @returns {Promise<SearchResult[]>}
	 */
	static async searchBusinesses(params: BusinessSearchParams): Promise<SearchResult[]> {
		const qs = SearchService.buildQueryString(params);
		const res = await fetch(`/api/v1/public/search/businesses?${qs}`);
		if (!res.ok) throw new Error(`Failed to search businesses: ${res.statusText}`);
		return await res.json() as SearchResult[];
	}

	/**
	 * @function searchProjects
	 * @description Fetches a list of project IDs matching the query and filters.
	 * @param {ProjectSearchParams} params
	 * @returns {Promise<SearchResult[]>}
	 */
	static async searchProjects(params: ProjectSearchParams): Promise<SearchResult[]> {
		const qs = SearchService.buildQueryString(params);
		const res = await fetch(`/api/v1/public/search/projects?${qs}`);
		if (!res.ok) throw new Error(`Failed to search projects: ${res.statusText}`);
		return await res.json() as SearchResult[];
	}

	/**
	 * @function searchServices
	 * @description Fetches a list of portfolio/service IDs matching the query and filters.
	 * @param {ServiceSearchParams} params
	 * @returns {Promise<SearchResult[]>}
	 */
	static async searchServices(params: ServiceSearchParams): Promise<SearchResult[]> {
		const qs = SearchService.buildQueryString(params);
		const res = await fetch(`/api/v1/public/search/services?${qs}`);
		if (!res.ok) throw new Error(`Failed to search services: ${res.statusText}`);
		return await res.json() as SearchResult[];
	}
	// #endregion
}
