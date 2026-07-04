/**
 * @file auth-backend-service.ts
 * @description Backend service layer for handling authentication contexts and user profile retrieval.
 */

import { SupabaseClient } from 'supabaseClient';

// #region Interfaces
export interface Deps {
	getClient?: () => Promise<SupabaseClient>;
}

/** A switchable business/team context (id + display name). */
interface OrgRef {
	id: string;
	name: string;
}
// #endregion

// #region Helpers
/**
 * Merge owned + membership org rows into a unique, id-keyed list.
 * @param {Array<OrgRef | null | undefined>} refs - Raw rows (may contain nulls).
 * @returns {OrgRef[]} De-duplicated references preserving first-seen order.
 */
function dedupeOrgRefs(refs: Array<OrgRef | null | undefined>): OrgRef[] {
	const seen = new Map<string, OrgRef>();
	for (const r of refs) {
		if (r?.id && !seen.has(r.id)) seen.set(r.id, { id: r.id, name: r.name });
	}
	return [...seen.values()];
}
// #endregion

export class AuthBackendService {
	// #region Main Methods
	/**
	 * Retrieves the current authenticated user's profile and session context.
	 * @param {Deps} deps - Dependency injection containing the Supabase client getter.
	 * @returns {Promise<{ok: boolean, data?: any, error?: any}>}
	 */
	static async getMe(deps: Deps = {}) {
		if (!deps.getClient) {
			console.error('[AuthBackendService] Missing database client context');
			return { ok: false, error: { status: 500, code: 'internal_error' } };
		}

		const sb = await deps.getClient();

		// 1. Get Auth User
		const { data: userRes, error: userErr } = await sb.auth.getUser();

		if (userErr || !userRes?.user) {
			return { ok: false, error: { status: 401, code: 'unauthorized' } };
		}

		// 2. Fetch Public Profile
		const { data: publicProfile } = await sb
			.schema('org')
			.from('users_public')
			.select('user_id, first_name, last_name, username, avatar_file_id')
			.eq('user_id', userRes.user.id)
			.single();

		// 3. Fetch Session Context
		const { data: sessionContext } = await sb
			.schema('security')
			.from('session_context')
			.select('active_profile_type, active_profile_id, active_team_id')
			.eq('user_id', userRes.user.id)
			.single();

		// 4. Fetch switchable contexts (best-effort — any failure resolves to []).
		const userId = userRes.user.id;
		const [freelancerRes, ownedBizRes, memberBizRes, ownedTeamRes, memberTeamRes] = await Promise
			.all([
				sb.schema('org').from('freelancer_profiles').select('user_id').eq('user_id', userId)
					.maybeSingle(),
				sb.schema('org').from('business_profiles').select('id, name').eq('owner_user_id', userId),
				sb.schema('org').from('business_members').select('business:business_profiles(id, name)')
					.eq('user_id', userId).eq('status', 'active'),
				sb.schema('org').from('teams').select('id, name').eq('owner_user_id', userId),
				sb.schema('org').from('team_members').select('team:teams(id, name)').eq('user_id', userId)
					.eq('status', 'active'),
			]);

		const memberBiz = (memberBizRes.data ?? []) as unknown as Array<{ business: OrgRef | null }>;
		const memberTeams = (memberTeamRes.data ?? []) as unknown as Array<{ team: OrgRef | null }>;

		const businesses = dedupeOrgRefs([
			...((ownedBizRes.data ?? []) as OrgRef[]),
			...memberBiz.map((r) => r.business),
		]);
		const teams = dedupeOrgRefs([
			...((ownedTeamRes.data ?? []) as OrgRef[]),
			...memberTeams.map((r) => r.team),
		]);
		const hasFreelancer = !!freelancerRes.data;

		// 5. Construct Payload
		const payload = {
			id: userRes.user.id,
			displayName: publicProfile
				? `${publicProfile.first_name || ''} ${publicProfile.last_name || ''}`.trim() ||
					publicProfile.username
				: null,
			username: publicProfile?.username ?? null,
			avatarUrl: publicProfile?.avatar_file_id ?? null,

			activeProfileType: (sessionContext?.active_profile_type as
				| 'freelancer'
				| 'business'
				| null) ?? null,
			activeProfileId: (sessionContext?.active_profile_id as string | null) ?? null,
			activeTeamId: (sessionContext?.active_team_id as string | null) ?? null,

			hasFreelancer,
			freelancerProfileId: hasFreelancer ? userId : null,
			businesses,
			teams,
		};

		return { ok: true, data: payload };
	}
	// #endregion
}
