/**
 * @file LoginService.ts
 * @description Frontend Service layer for handling user login and unverified redirects.
 */

// #region Imports
import { LoginWithEmailRequest } from '../contracts/login.ts';
// #endregion

// #region Service Definition
export class LoginService {
	/**
	 * Submits user credentials to authenticate and establish a session.
	 *
	 * @param {LoginWithEmailRequest} payload The user's email and password.
	 * @returns {Promise<{ redirectTo: string, email?: string }>} The response data containing a redirectTo path.
	 * @throws {Error} Throws an error if the network request fails or returns a generic non-200 status.
	 */
	static async loginWithEmail(
		payload: LoginWithEmailRequest,
	): Promise<{ redirectTo: string; email?: string }> {
		const res = await fetch(`/api/v1/auth/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		});

		const data = await res.json().catch(() => ({}));

		if (!res.ok) {
			// Handle 403 Forbidden scenarios where the email is valid but unverified
			if (res.status === 403 && data.redirectTo) {
				return data;
			}
			throw new Error(
				data.error?.message || data.message || `Failed to login: ${res.statusText}`,
			);
		}

		return data;
	}
}
// #endregion
