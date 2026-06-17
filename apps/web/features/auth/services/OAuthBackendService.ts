/**
 * @file oauth-service.ts
 * @description Backend service layer for handling OAuth callbacks, session exchange, and onboarding state detection.
 */

// #region Imports
import { Deps, fail, normaliseUnknownError, ok, Result, supabaseClient } from '@projective/backend';
// #endregion

// #region Interfaces
export interface OAuthCallbackResult {
	// deno-lint-ignore no-explicit-any
	session: any;
	// deno-lint-ignore no-explicit-any
	user: any;
	isOnboarded: boolean;
	ssoData: {
		email: string;
		firstName: string;
		lastName: string;
		username: string;
		profilePicture: string;
	};
}
// #endregion

// #region Service Definition
export class OAuthBackendService {
	/**
	 * Exchanges an OAuth code for a Supabase session and determines if the user requires onboarding.
	 *
	 * @param {string} code The OAuth code returned by the provider.
	 * @param {Deps} [deps] Dependency injection object for the Supabase client.
	 * @returns {Promise<Result<OAuthCallbackResult>>} The session and parsed metadata.
	 */
	static async handleCallback(
		code: string,
		deps: Deps = {},
	): Promise<Result<OAuthCallbackResult>> {
		try {
			const getClient = deps.getClient ?? supabaseClient;
			const supabase = await getClient();

			// 1. Exchange Code for Session
			const { data, error } = await supabase.auth.exchangeCodeForSession(code);
			if (error || !data.session) {
				return fail('unauthorized', 'Failed to exchange OAuth code for session', 401);
			}

			// 2. Check if user is fully onboarded (exists in org.users_public)
			const { data: profile } = await supabase
				.schema('org')
				.from('users_public')
				.select('user_id')
				.eq('user_id', data.user.id)
				.single();

			const isOnboarded = !!profile;

			// 3. Safely extract metadata from provider identities
			const meta = data.user.user_metadata || {};
			const identities = data.user.identities || [];
			const identityData = identities[0]?.identity_data || {};

			const fullName = meta.full_name || meta.name || identityData.full_name || identityData.name ||
				'';
			const [firstName, ...rest] = fullName.split(' ');
			const lastName = rest.join(' ');

			const username = meta.preferred_username || identityData.preferred_username || '';
			const profilePicture = meta.avatar_url || identityData.avatar_url || '';

			return ok({
				session: data.session,
				user: data.user,
				isOnboarded,
				ssoData: {
					email: data.user.email || '',
					firstName: firstName || '',
					lastName: lastName || '',
					username,
					profilePicture,
				},
			});
		} catch (err) {
			const n = normaliseUnknownError(err);
			return fail(n.code, n.message, 500);
		}
	}
}
// #endregion
