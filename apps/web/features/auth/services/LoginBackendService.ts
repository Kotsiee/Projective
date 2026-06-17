/**
 * @file LoginBackendService.ts
 * @description Secure backend service layer for handling credential authentication and profile routing logic.
 */

// #region Imports
import {
	Deps,
	fail,
	isLikelyEmail,
	normaliseSupabaseError,
	normaliseUnknownError,
	ok,
	Result,
	supabaseClient,
} from '@projective/backend';
import { LoginWithEmailRequest } from '../contracts/login.ts';
// #endregion

// #region Interfaces
export interface LoginResult {
	// deno-lint-ignore no-explicit-any
	session: any;
	// deno-lint-ignore no-explicit-any
	user: any;
	isOnboarded: boolean;
}
// #endregion

// #region Service Definition
export class LoginBackendService {
	/**
	 * Authenticates a user via email/password and determines their onboarding completion status.
	 *
	 * @param {LoginWithEmailRequest} payload The user credentials.
	 * @param {Deps} [deps] Dependency injection object for the Supabase client.
	 * @returns {Promise<Result<LoginResult>>} The session, user, and routing metadata.
	 */
	static async loginWithEmail(
		payload: LoginWithEmailRequest,
		deps: Deps = {},
	): Promise<Result<LoginResult>> {
		console.log('[LoginBackendService] 🔐 Initiating email authentication...');

		const email = (payload.email ?? '').trim().toLowerCase();
		const password = (payload.password ?? '').trim();

		if (!email || !password) {
			return fail('bad_request', 'Email and password are required.', 400);
		}
		if (!isLikelyEmail(email)) {
			return fail('bad_request', 'Invalid email format.', 400);
		}

		try {
			const getClient = deps.getClient ?? supabaseClient;
			const supabase = await getClient();

			// 1. Authenticate Identity
			const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (authError || !authData.session || !authData.user) {
				console.error('[LoginBackendService] ❌ Authentication rejected:', authError?.message);
				const n = normaliseSupabaseError(authError);
				return fail(n.code, n.message, n.status);
			}

			console.log(`[LoginBackendService] ✅ Identity verified for: ${authData.user.id}`);

			// 2. Query Profile State (Is Onboarded?)
			const { data: profile, error: dbError } = await supabase
				.schema('org')
				.from('users_public')
				.select('user_id')
				.eq('user_id', authData.user.id)
				.maybeSingle();

			if (dbError) {
				console.error('[LoginBackendService] ⚠️ Profile lookup failed:', dbError);
			}

			const isOnboarded = !!profile;
			console.log(
				`[LoginBackendService] Onboarding check: ${isOnboarded ? 'Complete' : 'Pending'}`,
			);

			return ok({
				session: authData.session,
				user: authData.user,
				isOnboarded,
			});
		} catch (err) {
			console.error('[LoginBackendService] 💥 Unexpected failure:', err);
			const n = normaliseUnknownError(err);
			return fail(n.code, n.message, 500);
		}
	}
}
// #endregion
