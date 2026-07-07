/**
 * @file PasswordResetBackendService.ts
 * @description Backend service for the forgot/reset password flow.
 *
 * Request:  `resetPasswordForEmail` sends a recovery email whose {{ .TokenHash }}
 *           link lands on /api/v1/auth/confirm?type=recovery, which establishes a
 *           session and forwards to /reset.
 * Update:   the /reset form (authorised by that recovery session) calls
 *           `updateUser({ password })`.
 */

// #region Imports
import {
	Config,
	fail,
	isLikelyEmail,
	normaliseSupabaseError,
	normaliseUnknownError,
	ok,
	Result,
	supabaseClient,
	validatePassword,
} from '@projective/backend';
// #endregion

// #region Service Definition
export class PasswordResetBackendService {
	/**
	 * Sends a password-recovery email. Always resolves successfully (even for
	 * unknown addresses) so the endpoint cannot be used to enumerate accounts.
	 */
	static async requestReset(email: string): Promise<Result<{ sent: true }>> {
		const normalised = (email ?? '').trim().toLowerCase();

		// Silently no-op on malformed input — never reveal account existence.
		if (!normalised || !isLikelyEmail(normalised)) {
			return ok({ sent: true });
		}

		try {
			const supabase = await supabaseClient();
			const redirectTo = `${Config.BASE_URL}/api/v1/auth/confirm`;

			const { error } = await supabase.auth.resetPasswordForEmail(normalised, {
				redirectTo,
			});

			// Log for observability but still report success to the caller.
			if (error) {
				console.error('[PasswordResetBackendService] resetPasswordForEmail failed:', error.message);
			}

			return ok({ sent: true });
		} catch (err) {
			console.error('[PasswordResetBackendService] Unexpected error:', err);
			return ok({ sent: true });
		}
	}

	/**
	 * Updates the current user's password. Requires a valid (recovery or normal)
	 * session, supplied via auth cookies on the request.
	 */
	static async updatePassword(
		newPassword: string,
		req: Request,
	): Promise<Result<{ updated: true }>> {
		const password = (newPassword ?? '').trim();

		const psv = validatePassword(password);
		if (!psv.isValid) {
			return fail('bad_request', 'Password does not meet the security requirements.', 400);
		}

		try {
			const supabase = await supabaseClient(req);

			// Guard: no session → not authorised to change a password.
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) {
				return fail('unauthorized', 'Your reset link has expired. Please request a new one.', 401);
			}

			const { error } = await supabase.auth.updateUser({ password });
			if (error) {
				const n = normaliseSupabaseError(error);
				return fail(n.code, n.message, n.status);
			}

			return ok({ updated: true });
		} catch (err) {
			const n = normaliseUnknownError(err);
			return fail(n.code, n.message, 500);
		}
	}
}
// #endregion
