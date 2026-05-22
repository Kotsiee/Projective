/**
 * @file auth-backend-service.ts
 * @description Backend service layer for handling authentication contexts and user profile retrieval.
 */

import { SupabaseClient } from 'supabaseClient';

// #region Interfaces
export interface Deps {
	getClient?: () => Promise<SupabaseClient>;
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

		// 4. Construct Payload
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
		};

		return { ok: true, data: payload };
	}
	// #endregion
}
