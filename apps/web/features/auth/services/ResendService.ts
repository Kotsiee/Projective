/**
 * @file ResendService.ts
 * @description Frontend Service layer for requesting a verification email resend.
 * Handles API calls to /api/v1/auth/resend
 */

// #region Service Definition
export class ResendService {
	/**
	 * Submits a request to resend the verification email to the specified address.
	 *
	 * @param {string} email The email address to resend the verification link to.
	 * @returns {Promise<boolean>} True if the request was successful.
	 * @throws {Error} Throws an error if the network request fails or returns a non-200 status.
	 */
	static async resendEmail(email: string): Promise<boolean> {
		const res = await fetch(`/api/v1/auth/resend`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email }),
		});

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}));
			throw new Error(errorData.error?.message || `Failed to resend email: ${res.statusText}`);
		}

		return true;
	}
}
// #endregion
