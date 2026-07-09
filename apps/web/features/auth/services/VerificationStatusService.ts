/**
 * @file VerificationStatusService.ts
 * @description Frontend service for the /verify page's live subscription. Polls
 * GET /api/v1/auth/verification-status so the waiting tab transitions the moment
 * the email is confirmed — no manual refresh. Cookies (verify_email, session,
 * pjv_return_to) ride along automatically with `credentials: 'include'`.
 */

// #region Types
export interface VerificationStatus {
	/** The email has been confirmed (drives the success UI). */
	verified: boolean;
	/** This device now holds a valid session (drives automatic login). */
	authenticated: boolean;
	/** Where to land once signed in — the captured redirect context. */
	next: string;
}
// #endregion

// #region Service Definition
export class VerificationStatusService {
	/** Fetches the current verification status for the waiting device. */
	static async check(signal?: AbortSignal): Promise<VerificationStatus> {
		const res = await fetch('/api/v1/auth/verification-status', {
			method: 'GET',
			headers: { 'Accept': 'application/json' },
			credentials: 'include',
			signal,
		});

		if (!res.ok) {
			throw new Error(`Verification status check failed: ${res.status}`);
		}

		return await res.json() as VerificationStatus;
	}
}
// #endregion
