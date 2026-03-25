import {
	Deps,
	fail,
	normaliseSupabaseError,
	normaliseUnknownError,
	ok,
	Result,
	supabaseClient,
} from '@projective/backend';
import {
	BusinessSearchParams,
	FreelancerSearchParams,
	ProjectSearchParams,
	SearchResult,
	ServiceSearchParams,
	TeamSearchParams,
	UserSearchParams,
} from '../contracts/Search.ts';

export interface PaginatedSearchQuery {
	query: string;
	limit: number;
	offset: number;
	countOnly: boolean;
}

export class SearchBackendService {
	private static buildArgs(args: Record<string, any>) {
		return Object.fromEntries(
			Object.entries(args).filter(([_, v]) => v !== null && v !== undefined),
		);
	}

	/**
	 * @function searchAndHydrate
	 * Orchestrates RPC searching, count evaluation, array slicing, and hydration.
	 */
	static async searchAndHydrate(
		entity: string,
		params: PaginatedSearchQuery,
		deps: Deps = {},
	): Promise<Result<{ items: any[]; meta: { totalCount: number } }>> {
		try {
			const getClient = deps.getClient ?? supabaseClient;
			const supabase = await getClient();

			let searchRes;
			const fetchCount = params.offset + params.limit;

			if (entity === 'teams') {
				searchRes = await this.searchTeams({ query: params.query, limit: fetchCount }, {
					getClient,
				});
			} else if (entity === 'projects') {
				searchRes = await this.searchProjects({ query: params.query, limit: fetchCount }, {
					getClient,
				});
			} else {
				return fail('bad_request', `Unsupported search entity: ${entity}`, 400);
			}

			if (!searchRes.ok) return searchRes;

			const totalCount = searchRes.data.length;

			if (params.countOnly) {
				return ok({ items: [], meta: { totalCount } });
			}

			const paginatedResults = searchRes.data.slice(params.offset, params.offset + params.limit);
			const ids = paginatedResults.map((r: any) => r.id);

			if (ids.length === 0) {
				return ok({ items: [], meta: { totalCount } });
			}

			let items: any[] = [];

			if (entity === 'teams') {
				const { data: teams, error: dbError } = await supabase
					.schema('org')
					.from('teams')
					.select('id, name, headline, avatar_url, banner_url')
					.in('id', ids);

				if (dbError) throw dbError;

				items = (teams || []).map((t: any) => ({
					id: t.id,
					type: 'Team',
					title: t.name,
					description: t.headline || 'No description provided.',
					owner: { name: t.name, profilePictureUrl: t.avatar_url },
					bannerUrl: t.banner_url || `https://picsum.photos/seed/${t.id}/400/300`,
					rating: 4.5,
					reviews: 12,
					price: '£50/hr',
				}));
			} else if (entity === 'projects') {
				const { data: projects, error: dbError } = await supabase
					.schema('projects')
					.from('projects')
					.select(
						'id, title, description, thumbnail_url, currency, owner_user_id, client_business_id',
					)
					.in('id', ids);

				if (dbError) throw dbError;

				const userIds = [
					...new Set((projects || []).map((p: any) => p.owner_user_id).filter(Boolean)),
				];
				const businessIds = [
					...new Set((projects || []).map((p: any) => p.client_business_id).filter(Boolean)),
				];

				const { data: users } = await supabase
					.schema('org')
					.from('users_public')
					.select('user_id, first_name, last_name, avatar_url')
					.in('user_id', userIds);

				const { data: businesses } = await supabase
					.schema('org')
					.from('business_profiles')
					.select('id, name, logo_url')
					.in('id', businessIds);

				const userMap = new Map(users?.map((u: any) => [u.user_id, u]));
				const businessMap = new Map(businesses?.map((b: any) => [b.id, b]));

				items = (projects || []).map((p: any) => {
					const business = p.client_business_id ? businessMap.get(p.client_business_id) : null;
					const user = p.owner_user_id ? userMap.get(p.owner_user_id) : null;

					const ownerName = business
						? business.name
						: user
						? `${user.first_name} ${user.last_name}`.trim()
						: 'Unknown Client';

					const ownerAvatar = business ? business.logo_url : user ? user.avatar_url : undefined;

					return {
						id: p.id,
						type: 'Project',
						title: p.title,
						description: typeof p.description === 'string' ? p.description : 'Open gig',
						owner: {
							name: ownerName,
							profilePictureUrl: ownerAvatar,
						},
						bannerUrl: p.thumbnail_url || `https://picsum.photos/seed/${p.id}/400/300`,
						rating: 0,
						reviews: 0,
						price: p.currency,
					};
				});
			}

			return ok({ items, meta: { totalCount } });
		} catch (err) {
			const n = normaliseUnknownError(err);
			return fail(n.code, n.message, 500);
		}
	}

	static async searchTeams(
		params: TeamSearchParams,
		deps: Deps = {},
	): Promise<Result<SearchResult[]>> {
		try {
			const getClient = deps.getClient ?? supabaseClient;
			const supabase = await getClient();

			const args = this.buildArgs({
				search_query: params.query || '',
				match_count: params.limit || 20,
				min_rate: params.minRate,
				max_rate: params.maxRate,
			});

			const { data, error } = await supabase
				.schema('search')
				.rpc('simple_search_teams', args);

			if (error) {
				const n = normaliseSupabaseError(error);
				return fail(n.code, n.message, 400);
			}

			return ok(data as SearchResult[]);
		} catch (err) {
			const n = normaliseUnknownError(err);
			return fail(n.code, n.message, 500);
		}
	}

	static async searchFreelancers(
		params: FreelancerSearchParams,
		deps: Deps = {},
	): Promise<Result<SearchResult[]>> {
		try {
			const getClient = deps.getClient ?? supabaseClient;
			const supabase = await getClient();

			const args = this.buildArgs({
				search_query: params.query || '',
				match_count: params.limit || 20,
				min_rate: params.minRate,
				max_rate: params.maxRate,
				required_skills: params.skills?.length ? params.skills : undefined,
			});

			const { data, error } = await supabase
				.schema('search')
				.rpc('simple_search_freelancers', args);

			if (error) {
				const n = normaliseSupabaseError(error);
				return fail(n.code, n.message, 400);
			}

			return ok(data as SearchResult[]);
		} catch (err) {
			const n = normaliseUnknownError(err);
			return fail(n.code, n.message, 500);
		}
	}

	static async searchUsers(
		params: UserSearchParams,
		deps: Deps = {},
	): Promise<Result<SearchResult[]>> {
		try {
			const getClient = deps.getClient ?? supabaseClient;
			const supabase = await getClient();

			const args = this.buildArgs({
				search_query: params.query || '',
				match_count: params.limit || 20,
				target_country: params.country,
			});

			const { data, error } = await supabase
				.schema('search')
				.rpc('simple_search_users', args);

			if (error) {
				const n = normaliseSupabaseError(error);
				return fail(n.code, n.message, 400);
			}

			return ok(data as SearchResult[]);
		} catch (err) {
			const n = normaliseUnknownError(err);
			return fail(n.code, n.message, 500);
		}
	}

	static async searchBusinesses(
		params: BusinessSearchParams,
		deps: Deps = {},
	): Promise<Result<SearchResult[]>> {
		try {
			const getClient = deps.getClient ?? supabaseClient;
			const supabase = await getClient();

			const args = this.buildArgs({
				search_query: params.query || '',
				match_count: params.limit || 20,
				target_country: params.country,
			});

			const { data, error } = await supabase
				.schema('search')
				.rpc('simple_search_businesses', args);

			if (error) {
				const n = normaliseSupabaseError(error);
				return fail(n.code, n.message, 400);
			}

			return ok(data as SearchResult[]);
		} catch (err) {
			const n = normaliseUnknownError(err);
			return fail(n.code, n.message, 500);
		}
	}

	static async searchProjects(
		params: ProjectSearchParams,
		deps: Deps = {},
	): Promise<Result<SearchResult[]>> {
		try {
			const getClient = deps.getClient ?? supabaseClient;
			const supabase = await getClient();

			const args = this.buildArgs({
				search_query: params.query || '',
				match_count: params.limit || 20,
				target_industry_id: params.industryId,
			});

			const { data, error } = await supabase
				.schema('search')
				.rpc('simple_search_projects', args);

			if (error) {
				const n = normaliseSupabaseError(error);
				return fail(n.code, n.message, 400);
			}

			return ok(data as SearchResult[]);
		} catch (err) {
			const n = normaliseUnknownError(err);
			return fail(n.code, n.message, 500);
		}
	}

	static async searchServices(
		params: ServiceSearchParams,
		deps: Deps = {},
	): Promise<Result<SearchResult[]>> {
		try {
			const getClient = deps.getClient ?? supabaseClient;
			const supabase = await getClient();

			const args = this.buildArgs({
				search_query: params.query || '',
				match_count: params.limit || 20,
			});

			const { data, error } = await supabase
				.schema('search')
				.rpc('simple_search_services', args);

			if (error) {
				const n = normaliseSupabaseError(error);
				return fail(n.code, n.message, 400);
			}

			return ok(data as SearchResult[]);
		} catch (err) {
			const n = normaliseUnknownError(err);
			return fail(n.code, n.message, 500);
		}
	}
}
