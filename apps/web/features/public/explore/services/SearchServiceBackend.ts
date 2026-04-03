import { SupabaseClient } from 'supabaseClient';
import { ProjectResponse } from '../contracts/ProjectResponse.ts';

// #region 1. Interfaces
export interface PaginatedSearchQuery {
	query: string;
	limit: number;
	offset: number;
	countOnly: boolean;
	id?: string;
}

export interface Deps {
	getClient?: () => Promise<SupabaseClient>;
}
// #endregion

export class SearchBackendService {
	// #region 2. Helper Methods
	private static buildArgs(args: Record<string, any>) {
		return Object.fromEntries(
			Object.entries(args).filter(([_, v]) => v !== null && v !== undefined),
		);
	}
	// #endregion

	// #region 3. Main Router
	static async search(entity: string, params: PaginatedSearchQuery, deps: Deps = {}) {
		if (!deps.getClient) {
			return { ok: false, error: { status: 500, message: 'Missing database client context' } };
		}

		switch (entity) {
			case 'people':
				return await this.searchPeople(params, deps);
			case 'projects':
				return await this.searchProjects(params, deps);
			case 'services':
				return await this.searchServices(params, deps);
			default:
				return { ok: false, error: { status: 400, message: `Invalid search entity: ${entity}` } };
		}
	}
	// #endregion

	// #region 4. Entity Search Implementations
	private static async searchPeople(params: PaginatedSearchQuery, deps: Deps) {
		const client = await deps.getClient!();

		let query = client
			.schema('search')
			.from('profiles_index')
			.select(
				params.countOnly ? '*' : 'entity_id, entity_type, display_name, headline, metadata',
				{
					count: 'exact',
					head: params.countOnly,
				},
			)
			.eq('is_active', true);

		if (params.query) {
			query = query.textSearch('fts', params.query, { config: 'english', type: 'websearch' });
		}

		if (!params.countOnly) {
			query = query.range(params.offset, params.offset + params.limit - 1);
		}

		const { data, count, error } = await query;
		if (error) return { ok: false, error };

		return {
			ok: true,
			data: {
				items: params.countOnly ? [] : data || [],
				meta: { totalCount: count || 0 },
			},
		};
	}

	/**
	 * @private
	 * @description Queries the search.projects_index table.
	 * Security Note: RLS policies on projects.projects will cascade here if configured properly,
	 * but currently the index is filtered strictly by is_active (public visibility).
	 */
	private static async searchProjects(params: PaginatedSearchQuery, deps: Deps) {
		const client = await deps.getClient!();

		const selectColumns = params.countOnly
			? 'project_id'
			: 'project_id, title, description, thumbnail_url, status, is_active, industry_category_id, target_project_start_date, created_at, owner_id, owner_type, owner_name, owner_username, owner_avatar_url, nda_required, ip_ownership_mode, languages, locations, skills, stages, roles';

		let query = client
			.schema('search')
			.from('projects_index')
			.select(selectColumns, { count: 'exact', head: params.countOnly })
			.eq('is_active', true);

		if (params.id) {
			query = query.eq('project_id', params.id);
		} else if (params.query) {
			query = query.textSearch('fts', params.query, { config: 'english', type: 'websearch' });
		}

		if (!params.countOnly) {
			query = query.range(params.offset, params.offset + params.limit - 1);
		}

		const { data, count, error } = await query;
		if (error) return { ok: false, error };

		// Map the flat database row to the nested ProjectResponse structure
		const formattedItems: ProjectResponse[] = params.countOnly
			? []
			: (data || []).map((item: any) => {
				// Extract owner fields to construct the nested object
				const {
					owner_id,
					owner_type,
					owner_name,
					owner_username,
					owner_avatar_url,
					...projectData
				} = item;

				return {
					...projectData,
					owner: {
						id: owner_id,
						type: owner_type,
						name: owner_name,
						username: owner_username,
						avatar_url: owner_avatar_url,
					},
				} as ProjectResponse;
			});

		return {
			ok: true,
			data: {
				items: formattedItems,
				meta: { totalCount: count || 0 },
			},
		};
	}

	private static async searchServices(params: PaginatedSearchQuery, deps: Deps) {
		const client = await deps.getClient!();

		let query = client
			.schema('search')
			.from('services_index')
			.select(params.countOnly ? '*' : 'service_id, title, avg_rating', {
				count: 'exact',
				head: params.countOnly,
			})
			.eq('is_public', true);

		if (params.query) {
			query = query.textSearch('fts', params.query, { config: 'english', type: 'websearch' });
		}

		if (!params.countOnly) {
			query = query.range(params.offset, params.offset + params.limit - 1);
		}

		const { data, count, error } = await query;
		if (error) return { ok: false, error };

		return {
			ok: true,
			data: {
				items: params.countOnly ? [] : data || [],
				meta: { totalCount: count || 0 },
			},
		};
	}
	// #endregion
}
