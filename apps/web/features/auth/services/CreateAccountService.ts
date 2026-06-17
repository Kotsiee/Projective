/**
 * @file CreateAccountService.ts
 * @description Frontend Service layer for the unified Account Creation and Onboarding flow.
 * Handles API calls to /api/v1/auth/create-account
 */

// #region Imports
import { CreateAccountRequest } from '../contracts/create-account.ts';
// #endregion

// #region Service Definition
export class CreateAccountService {
	/**
	 * Submits the unified onboarding payload to create a new user account and profile.
	 *
	 * @param {CreateAccountRequest} payload The complete onboarding dataset (Credentials, Identity, Objective).
	 * @returns {Promise<any>} The session and user data upon successful creation.
	 * @throws {Error} Throws an error if the network request fails or returns a non-200 status.
	 */
	// deno-lint-ignore no-explicit-any
	static async createAccount(payload: CreateAccountRequest): Promise<any> {
		const res = await fetch(`/api/v1/auth/create-account`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		});

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}));
			throw new Error(errorData.message || `Failed to create account: ${res.statusText}`);
		}

		return await res.json();
	}
}
// #endregion
