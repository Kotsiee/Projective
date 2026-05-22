/**
 * @file SearchServiceBackend.ts
 * @description Backend service layer for handling search and discovery queries via pgvector and fts.
 */

// #region Imports
import { PartialEntityResponse } from '@projective/types';
import { SupabaseClient } from 'supabaseClient';

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
	// deno-lint-ignore no-explicit-any
	private static buildArgs(args: Record<string, any>) {
		return Object.fromEntries(
			Object.entries(args).filter(([_, v]) => v !== null && v !== undefined),
		);
	}
	// #endregion

	// #region 3. Main Router
	static async search(entity: string, params: PaginatedSearchQuery, deps: Deps = {}) {
		if (!deps.getClient) {
			console.error('[SearchBackendService] Missing database client context');
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
				console.error(`[SearchBackendService] Invalid search entity requested: ${entity}`);
				return { ok: false, error: { status: 400, message: `Invalid search entity: ${entity}` } };
		}
	}
	// #endregion

	// #region 4. Entity Search Implementations
	private static async searchPeople(params: PaginatedSearchQuery, deps: Deps) {
		const client = await deps.getClient!();

		const selectColumns = params.countOnly
			? 'entity_id'
			: 'entity_id, entity_type, display_name, headline, metadata, rating_average, rating_count, updated_at';

		let query = client
			.schema('search')
			.from('profiles_index')
			.select(selectColumns, {
				count: 'exact',
				head: params.countOnly,
			})
			.eq('is_active', true);

		if (params.query) {
			query = query.textSearch('fts', params.query, { config: 'english', type: 'websearch' });
		}

		if (!params.countOnly) {
			query = query.range(params.offset, params.offset + params.limit - 1);
		}

		const { data, count, error } = await query;

		if (error) {
			console.error(
				'[SearchBackendService.searchPeople] Supabase Error:',
				JSON.stringify(error, null, 2),
			);
			return { ok: false, error };
		}

		// Map to PartialEntityResponse
		const formattedItems: PartialEntityResponse[] = params.countOnly
			? []
			// deno-lint-ignore no-explicit-any
			: (data || []).map((item: any) => ({
				id: item.entity_id,
				entity_type: item.entity_type === 'user' ? 'person' : item.entity_type,
				created_at: item.updated_at,
				rating_average: Number(item.rating_average) || 0,
				rating_count: Number(item.rating_count) || 0,
				owner_id: item.entity_id,
				owner_type: item.entity_type === 'team'
					? 'team'
					: (item.entity_type === 'business' ? 'business' : 'user'),
				display_title: item.display_name,
				display_description: item.headline || item.metadata?.skills?.join(', ') || null,
				display_image: item.metadata?.avatar || item.metadata?.logo || null,
				tags: item.metadata?.skills || [],
			}));

		return {
			ok: true,
			data: {
				items: formattedItems,
				meta: { totalCount: count || 0 },
			},
		};
	}

	private static async searchProjects(params: PaginatedSearchQuery, deps: Deps) {
		const client = await deps.getClient!();

		// Step 1: Query the Fast Search Index
		const selectColumns = params.countOnly
			? 'project_id'
			: 'project_id, title, status, is_active, target_start_date, updated_at';

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

		const { data: indexData, count, error: indexError } = await query;

		if (indexError) {
			console.error(
				'[SearchBackendService.searchProjects] Supabase Index Error:',
				JSON.stringify(indexError, null, 2),
			);
			return { ok: false, error: indexError };
		}

		if (params.countOnly || !indexData || indexData.length === 0) {
			return {
				ok: true,
				data: { items: [], meta: { totalCount: count || 0 } },
			};
		}

		// Step 2: Fetch the full details from the primary schema for the matched IDs
		const projectIds = indexData.map((d: any) => d.project_id);
		const { data: projectsData, error: projectsError } = await client
			.schema('projects')
			.from('projects')
			.select('id, description_text, thumbnail_url, created_at, owner_user_id, client_business_id')
			.in('id', projectIds);

		if (projectsError) {
			console.error(
				'[SearchBackendService.searchProjects] Supabase Details Error:',
				JSON.stringify(projectsError, null, 2),
			);
			return { ok: false, error: projectsError };
		}

		// Create a quick lookup map
		const projectMap = new Map(projectsData?.map((p: any) => [p.id, p]));

		// Map to normalized PartialEntityResponse
		// deno-lint-ignore no-explicit-any
		const formattedItems: PartialEntityResponse[] = indexData.map((item: any) => {
			const p = projectMap.get(item.project_id);

			return {
				id: item.project_id,
				entity_type: 'project',
				created_at: p?.created_at || item.updated_at,
				rating_average: 0,
				rating_count: 0,
				owner_id: p?.client_business_id || p?.owner_user_id || '',
				owner_type: p?.client_business_id ? 'business' : 'user',
				display_title: item.title,
				display_description: p?.description_text || null,
				display_image: null,
				tags: [],
			} as PartialEntityResponse;
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

		const selectColumns = params.countOnly
			? 'service_id'
			: 'service_id, title, rating_average, rating_count, updated_at';

		let query = client
			.schema('search')
			.from('services_index')
			.select(selectColumns, {
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

		if (error) {
			console.error(
				'[SearchBackendService.searchServices] Supabase Error:',
				JSON.stringify(error, null, 2),
			);
			return { ok: false, error };
		}

		// Map to PartialEntityResponse
		// deno-lint-ignore no-explicit-any
		const formattedItems: PartialEntityResponse[] = params.countOnly
			? []
			: (data || []).map((item: any) => ({
				id: item.service_id,
				entity_type: 'service',
				created_at: item.updated_at,
				rating_average: Number(item.rating_average) || 0,
				rating_count: Number(item.rating_count) || 0,
				owner_id: '', // Requires similar secondary lookup mapped to blueprint logic if needed
				owner_type: 'user',
				display_title: item.title,
				display_description: null,
				display_image: null,
				tags: [],
			}));

		return {
			ok: true,
			data: {
				items: formattedItems,
				meta: { totalCount: count || 0 },
			},
		};
	}
	// #endregion
}
