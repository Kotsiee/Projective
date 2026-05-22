/**
 * @file ViewService.ts
 * @description Frontend Service layer for public Entity viewing.
 * Handles API calls to /api/v1/public/view/* ensuring Islands remain thin.
 */

// #region Imports
import { FullProjectResponse } from '@projective/types';
// #endregion

export class ViewService {
	// #region Main Fetcher
	/**
	 * Fetches the full public details for a specific entity.
	 * @param {string} entity The type of entity (e.g., 'project', 'service', 'person').
	 * @param {string} id The UUID of the entity.
	 * @returns {Promise<any>} The strongly typed Full Response object.
	 */
	static async getView(entity: 'project', id: string): Promise<FullProjectResponse>;
	// Overload signatures for future entities can be added here
	// static async getView(entity: 'service', id: string): Promise<FullServiceResponse>;
	// deno-lint-ignore no-explicit-any
	static async getView(entity: string, id: string): Promise<any> {
		const res = await fetch(`/api/v1/public/view/${entity}?id=${id}`);

		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			throw new Error(err.error?.message || `Failed to fetch ${entity} view: ${res.statusText}`);
		}

		return await res.json();
	}
	// #endregion
}
