/**
 * @file ForgotPasswordService.ts
 * @description Frontend service for requesting a password-recovery email.
 */

// #region Service Definition
export class ForgotPasswordService {
	/**
	 * Requests a recovery email. Resolves `true` on any 2xx — the endpoint always
	 * succeeds to avoid leaking whether the address is registered.
	 */
	static async requestReset(email: string): Promise<boolean> {
		const res = await fetch(`/api/v1/auth/forgot-password`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email }),
		});

		if (!res.ok) {
			const data = await res.json().catch(() => ({}));
			throw new Error(data.error?.message || `Failed to send reset email: ${res.statusText}`);
		}

		return true;
	}
}
// #endregion
