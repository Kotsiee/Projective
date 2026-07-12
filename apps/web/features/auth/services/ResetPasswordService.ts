/**
 * @file ResetPasswordService.ts
 * @description Frontend service for setting a new password during recovery.
 */

// #region Imports
import { getCsrfToken } from '@projective/utils';
// #endregion

// #region Service Definition
export class ResetPasswordService {
	/**
	 * Submits the new password. The recovery session makes this an authenticated,
	 * state-changing request, so the double-submit CSRF token is required.
	 *
	 * @returns The path to redirect to on success.
	 */
	static async updatePassword(password: string): Promise<string> {
		const res = await fetch(`/api/v1/auth/reset-password`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRF': getCsrfToken() || '',
			},
			body: JSON.stringify({ password }),
		});

		const data = await res.json().catch(() => ({}));

		if (!res.ok) {
			throw new Error(data.error?.message || data.message || `Failed to reset password.`);
		}

		return data.redirectTo || '/home';
	}
}
// #endregion
