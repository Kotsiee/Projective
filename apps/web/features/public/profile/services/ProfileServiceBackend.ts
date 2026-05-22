/**
 * @file ProfileServiceBackend.ts
 * @description Backend service layer for resolving and fetching Profile entities (Users, Teams, Businesses).
 * Handles the separation of Core Profile data and paginated Tab Data.
 */

// #region Imports
import { SupabaseClient } from 'supabaseClient';
import { ProfileData, ProfileTab } from '../contracts/Profile.ts';
// #endregion

// #region Interfaces
export interface Deps {
	getClient?: () => Promise<SupabaseClient>;
}

export interface TabPaginationParams {
	limit: number;
	offset: number;
	filter?: string;
}
// #endregion

export class ProfileBackendService {
	// #region 1. Core Profile Fetching
	/**
	 * Resolves a handle to an entity and fetches its core profile data (Header & Body 1).
	 * Utilizes the unified org.profiles_index view for a single-query resolution.
	 * Resolves viewer permissions if authenticated.
	 */
	static async getProfileCore(name: string, deps: Deps = {}) {
		const handle = name.toLowerCase();

		if (!deps.getClient) return { ok: false, error: { status: 500, message: 'Missing DB Client' } };
		const client = await deps.getClient();

		try {
			// 1. Fetch Viewer Session
			const { data: { user } } = await client.auth.getUser();

			// 2. Resolve Profile Entity
			const { data, error } = await client
				.schema('org')
				.from('profiles_index')
				.select('*')
				.ilike('handle', handle)
				.single();

			if (error || !data) {
				return { ok: false, error: { status: 404, message: 'Profile not found' } };
			}

			// 3. Resolve Viewer Permissions (RBAC)
			let viewerPermissions: string[] = [];

			if (user) {
				if (data.entity_type === 'person' || data.entity_type === 'freelancer') {
					// 1:1 Ownership
					if (user.id === data.entity_id) {
						viewerPermissions = [
							'manage_profile',
							'manage_portfolio',
							'manage_services',
							'manage_projects',
						];
					}
				} else if (data.entity_type === 'team') {
					// Team RBAC resolution
					const { data: memberData } = await client
						.schema('org')
						.from('team_members')
						.select('team_roles(permissions)')
						.eq('team_id', data.entity_id)
						.eq('user_id', user.id)
						.single();

					// @ts-ignore - Supabase join typing workaround
					if (memberData?.team_roles?.permissions) {
						// @ts-ignore
						viewerPermissions = memberData.team_roles.permissions;
					}
				} else if (data.entity_type === 'business') {
					// Business RBAC resolution
					const { data: memberData } = await client
						.schema('org')
						.from('business_members')
						.select('business_roles(permissions)')
						.eq('business_profile_id', data.entity_id)
						.eq('user_id', user.id)
						.single();

					// @ts-ignore
					if (memberData?.business_roles?.permissions) {
						// @ts-ignore
						viewerPermissions = memberData.business_roles.permissions;
					}
				}
			}

			// 4. Map Payload
			const mappedProfile: Partial<ProfileData> = {
				id: data.entity_id,
				type: data.entity_type as any,
				handle: data.handle,
				name: data.name || data.handle,
				avatarUrl: data.avatar_file_id ? `/api/v1/files/${data.avatar_file_id}/access` : null,
				bannerUrl: data.banner_file_id ? `/api/v1/files/${data.banner_file_id}/access` : null,
				headline: data.headline || '',
				bio: data.bio || '',
				skills: [],
				stats: {
					ratingAsClient: Number(data.rating_as_client) || 0,
					reviewsAsClient: Number(data.reviews_as_client) || 0,
					ratingAsFreelancer: Number(data.rating_as_freelancer) || 0,
					reviewsAsFreelancer: Number(data.reviews_as_freelancer) || 0,
					activeProjects: Number(data.active_project_count) || 0,
					totalProjects: Number(data.total_project_count) || 0,
					serviceCount: Number(data.service_count) || 0,
					productCount: Number(data.product_count) || 0,
				},
				logistics: {
					isOnline: false,
					location: data.location || 'Global',
					languages: data.languages || [],
					timezone: data.timezone || 'UTC',
					availabilitySummary: '',
					averageResponseTime: '',
					hasSchedule: false,
				},
				clients: [],
				viewerConnectionStatus: 'none',
				viewerPermissions,
			};

			return { ok: true, data: mappedProfile as ProfileData };
		} catch (error: any) {
			console.error('[ProfileBackendService.getProfileCore] Unhandled Exception:', error);
			return { ok: false, error: { status: 500, message: 'Failed to fetch profile core' } };
		}
	}
	// #endregion

	// #region 2. Tab Data Fetching
	static async getProfileTab(
		handle: string,
		tab: ProfileTab,
		params: TabPaginationParams,
		deps: Deps = {},
	) {
		if (!deps.getClient) return { ok: false, error: { status: 500, message: 'Missing DB Client' } };
		const client = await deps.getClient();

		try {
			const { data: indexData, error: indexError } = await client
				.schema('org')
				.from('profiles_index')
				.select('entity_id, entity_type')
				.ilike('handle', handle)
				.single();

			if (indexError || !indexData) {
				console.error(
					'[ProfileBackendService.getProfileTab] Handle resolution failed:',
					indexError,
				);
				throw new Error('Profile not found for tab data');
			}

			let tabData: any[] = [];
			let totalCount = 0;

			switch (tab) {
				case 'services': {
					const { data, count, error } = await client.schema('marketplace').from('services')
						.select('*', { count: 'exact' })
						.eq('owner_id', indexData.entity_id)
						.range(params.offset, params.offset + params.limit - 1);
					if (error) throw error;
					tabData = data;
					totalCount = count || 0;
					break;
				}
				case 'projects': {
					const { data, count, error } = await client.schema('projects').from('projects')
						.select('*', { count: 'exact' })
						.eq('owner_user_id', indexData.entity_id)
						.range(params.offset, params.offset + params.limit - 1);
					if (error) throw error;
					tabData = data;
					totalCount = count || 0;
					break;
				}
				default:
					return { ok: false, error: { status: 400, message: `Unknown tab: ${tab}` } };
			}

			return { ok: true, data: { items: tabData, meta: { totalCount } } };
		} catch (error: any) {
			console.error(`[ProfileBackendService.getProfileTab] Error fetching tab ${tab}:`, error);
			return { ok: false, error: { status: 500, message: `Failed to fetch ${tab} data` } };
		}
	}
	// #endregion
}
