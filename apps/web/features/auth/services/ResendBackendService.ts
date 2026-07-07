/**
 * @file ResendBackendService.ts
 * @description Backend service layer for handling Supabase email verification resends.
 */

// #region Imports
import {
	Config,
	fail,
	normaliseSupabaseError,
	normaliseUnknownError,
	ok,
	Result,
	supabaseClient,
} from '@projective/backend';
// #endregion

// #region Service Definition
export class ResendBackendService {
	/**
	 * Triggers a verification email resend via Supabase Auth.
	 *
	 * @param {string} email The user's email address.
	 * @returns {Promise<Result<{ sent: true }>>} The result of the resend operation.
	 */
	static async resendVerificationEmail(email: string): Promise<Result<{ sent: true }>> {
		if (!email) return fail('bad_request', 'Email is required.', 400);

		try {
			const emailRedirectTo = `${Config.BASE_URL}/api/v1/auth/confirm`;
			const supabase = await supabaseClient();

			const { error } = await supabase.auth.resend({
				type: 'signup',
				email,
				options: {
					emailRedirectTo,
				},
			});

			if (error) {
				const n = normaliseSupabaseError(error);
				return fail(n.code, n.message, n.status);
			}

			return ok({ sent: true });
		} catch (err) {
			const n = normaliseUnknownError(err);
			return fail(n.code, n.message, 500);
		}
	}
}
// #endregion
