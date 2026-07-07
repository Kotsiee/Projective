/**
 * @file ConfirmBackendService.ts
 * @description Backend service for verifying email token-hash links (signup
 * confirmation, recovery, magic link, email change) via Supabase `verifyOtp`.
 *
 * This is the cross-device-safe counterpart to the OAuth PKCE flow: the token
 * hash arrives in the email link and is verified server-side with no client-held
 * verifier, so the link works from any browser or device.
 */

// #region Imports
import {
	fail,
	freshAnonClient,
	normaliseSupabaseError,
	normaliseUnknownError,
	ok,
	Result,
} from '@projective/backend';
// #endregion

// #region Types
/** Subset of Supabase `EmailOtpType` we accept from confirmation links. */
export type EmailConfirmType =
	| 'signup'
	| 'email'
	| 'recovery'
	| 'magiclink'
	| 'invite'
	| 'email_change';

const VALID_TYPES: readonly EmailConfirmType[] = [
	'signup',
	'email',
	'recovery',
	'magiclink',
	'invite',
	'email_change',
];

export function isEmailConfirmType(value: string | null): value is EmailConfirmType {
	return !!value && (VALID_TYPES as readonly string[]).includes(value);
}

export interface ConfirmResult {
	// deno-lint-ignore no-explicit-any
	session: any;
	// deno-lint-ignore no-explicit-any
	user: any;
	isOnboarded: boolean;
}
// #endregion

// #region Service Definition
export class ConfirmBackendService {
	/**
	 * Verifies an email OTP token hash and reports the user's onboarding status.
	 *
	 * @param tokenHash The `token_hash` query param from the email link.
	 * @param type The OTP type (e.g. `email` for signup confirmation, `recovery`).
	 */
	static async verifyTokenHash(
		tokenHash: string,
		type: EmailConfirmType,
	): Promise<Result<ConfirmResult>> {
		if (!tokenHash) return fail('bad_request', 'Missing confirmation token.', 400);

		try {
			// Fresh client: verifyOtp authenticates it in-memory on success.
			const supabase = freshAnonClient();

			const { data, error } = await supabase.auth.verifyOtp({
				token_hash: tokenHash,
				type,
			});

			if (error || !data.session || !data.user) {
				const n = normaliseSupabaseError(error);
				return fail(n.code, n.message, n.status || 401);
			}

			// Reuse the now-authenticated client to check onboarding completion.
			const { data: profile } = await supabase
				.schema('org')
				.from('users_public')
				.select('user_id')
				.eq('user_id', data.user.id)
				.maybeSingle();

			return ok({
				session: data.session,
				user: data.user,
				isOnboarded: !!profile,
			});
		} catch (err) {
			const n = normaliseUnknownError(err);
			return fail(n.code, n.message, 500);
		}
	}
}
// #endregion
