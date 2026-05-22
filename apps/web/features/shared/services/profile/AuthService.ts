/**
 * @file auth-service.ts
 * @description Backend service layer for handling authentication and user profile retrieval.
 */

// #region Imports
import { SupabaseClient } from 'supabaseClient';
// #endregion

// #region 1. Interfaces
export interface Deps {
	getClient?: () => Promise<SupabaseClient>;
}
// #endregion

export class AuthService {
	// #region 2. Main Methods
	/**
	 * Retrieves the current authenticated user along with their public profile and session context.
	 * * @param {Deps} deps - Dependency injection container.
	 * @returns {Promise<{ ok: boolean, data?: any, error?: any }>} The user payload or an error.
	 */
	static async getMe(deps: Deps = {}) {
		if (!deps.getClient) {
			console.error('[AuthService.getMe] Missing database client context');
			return {
				ok: false,
				error: { status: 500, code: 'internal_error', message: 'Missing database client context' },
			};
		}

		try {
			const sb = await deps.getClient();
			const { data: userRes, error: userErr } = await sb.auth.getUser();

			if (userErr || !userRes?.user) {
				return {
					ok: false,
					error: { status: 401, code: 'unauthorized', message: 'Unauthorized' },
				};
			}

			const { data: publicProfile } = await sb
				.schema('org')
				.from('users_public')
				.select('user_id, first_name, last_name, username, avatar_url')
				.eq('user_id', userRes.user.id)
				.single();

			const { data: sessionContext } = await sb
				.schema('security')
				.from('session_context')
				.select('active_profile_type, active_profile_id, active_team_id')
				.eq('user_id', userRes.user.id)
				.single();

			const payload = {
				id: userRes.user.id,

				displayName: publicProfile
					? `${publicProfile.first_name || ''} ${publicProfile.last_name || ''}`.trim() ||
						publicProfile.username
					: null,
				username: publicProfile?.username ?? null,
				avatarUrl: publicProfile?.avatar_url ?? null,

				activeProfileType: (sessionContext?.active_profile_type as
					| 'freelancer'
					| 'business'
					| null) ?? null,
				activeProfileId: (sessionContext?.active_profile_id as string | null) ?? null,
				activeTeamId: (sessionContext?.active_team_id as string | null) ?? null,
			};

			return { ok: true, data: { user: payload } };
		} catch (err) {
			console.error('[AuthService.getMe] Unexpected error:', err);
			return {
				ok: false,
				error: { status: 500, code: 'internal_error', message: 'An unexpected error occurred' },
			};
		}
	}
	// #endregion
}
