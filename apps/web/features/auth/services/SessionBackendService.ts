/**
 * @file SessionBackendService.ts
 * @description Secure backend service layer for parsing incoming authentication tokens and mapping user session contexts.
 */

// #region Imports
import {
	fail,
	normaliseUnknownError,
	ok,
	Result,
	setAuthCookies,
	supabaseClient,
} from '@projective/backend';
import { deleteCookie } from '@std/http/cookie';
// #endregion

// #region Interfaces
export interface SessionCreationPayload {
	accessToken: string;
	refreshToken: string;
}

export interface SessionResult {
	user_id: string;
	isOnboarded: boolean;
}
// #endregion

// #region Service Definition
export class SessionBackendService {
	/**
	 * Validates an externally provided access token and configures server-side HTTP session contexts.
	 *
	 * @param {SessionCreationPayload} payload The raw credentials forwarded from the client state.
	 * @param {URL} requestUrl The current target origin layout URL used to safely compute cookie domains.
	 * @param {Headers} headers The outgoing HTTP response headers collection to attach cookie scopes onto.
	 * @returns {Promise<Result<SessionResult>>} The logical identity result and profile status map.
	 */
	static async establishSession(
		payload: SessionCreationPayload,
		requestUrl: URL,
		headers: Headers,
	): Promise<Result<SessionResult>> {
		console.log('[SessionBackendService] Establishing authenticated runtime session...');

		if (!payload.accessToken || !payload.refreshToken) {
			return fail('bad_request', 'Missing mandatory token parameters.', 400);
		}

		try {
			// Initialize a standard server instance passing a simulated context using the client's new tokens
			const mockReq = new Request(requestUrl.href, {
				headers: {
					'Authorization': `Bearer ${payload.accessToken}`,
				},
			});

			const supabase = await supabaseClient(mockReq);

			// 1. Verify identity directly against Supabase Identity service
			const { data: { user }, error: authError } = await supabase.auth.getUser(payload.accessToken);

			if (authError || !user) {
				console.error('[SessionBackendService] Supabase token validation rejected:', authError);
				return fail('unauthorized', 'Provided session token is invalid or expired.', 401);
			}

			console.log(`[SessionBackendService] Identity verified successfully for: ${user.id}`);

			// 2. Query structural data to confirm onboarding completion profile records
			const { data: profile, error: dbError } = await supabase
				.schema('org')
				.from('users_public')
				.select('user_id')
				.eq('user_id', user.id)
				.maybeSingle();

			if (dbError) {
				console.error(
					'[SessionBackendService] Database lookups failed during initialization:',
					dbError,
				);
			}

			const isOnboarded = !!profile;
			console.log(
				`[SessionBackendService] Profile registration check complete. isOnboarded = ${isOnboarded}`,
			);

			// 3. Write strict HTTP-Only secure cookies into the server response lifecycle
			setAuthCookies(headers, {
				accessToken: payload.accessToken,
				refreshToken: payload.refreshToken,
				requestUrl,
			});

			// Clear tracking cookies immediately if a valid verification handshake occurs
			deleteCookie(headers, 'verify_email', { path: '/' });

			return ok({
				user_id: user.id,
				isOnboarded,
			});
		} catch (err) {
			console.error(
				'[SessionBackendService] Unhandled failure executing session establishment:',
				err,
			);
			const n = normaliseUnknownError(err);
			return fail(n.code, n.message, 500);
		}
	}
}
// #endregion
