/**
 * @file search-service.ts
 * @description Frontend Service layer for Explore & Search interactions.
 * Handles API calls to /api/v1/public/search/* ensuring Islands remain thin.
 */

import { SearchType } from '../contracts/Explore.ts';
import { SearchParams, SearchResult } from '../contracts/Search.ts';

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
					searchParams.append(key, value.join(','));
				} else {
					searchParams.append(key, String(value));
				}
			}
		}
		return searchParams.toString();
	}
	// #endregion

	static async search(params: SearchParams, type?: SearchType): Promise<SearchResult[]> {
		const qs = SearchService.buildQueryString(params);
		const searchType = type || 'all';
		const res = await fetch(`/api/v1/public/search/${searchType}?${qs}`);
		if (!res.ok) throw new Error(`Failed to search ${searchType}: ${res.statusText}`);
		return await res.json() as SearchResult[];
	}
}
