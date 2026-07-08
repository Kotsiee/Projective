/**
 * @file CompleteOnboardingService.ts
 * @description Frontend service that posts the onboarding payload for an
 * already-authenticated (OAuth) user to /api/v1/auth/complete-onboarding.
 */

// #region Imports
import { getCsrfToken } from '@projective/utils';
import { CompleteOnboardingRequest } from '../contracts/complete-onboarding.ts';
// #endregion

// #region Service Definition
export class CompleteOnboardingService {
	// deno-lint-ignore no-explicit-any
	static async complete(payload: CompleteOnboardingRequest): Promise<any> {
		// This runs for an already-authenticated (OAuth) user, so the middleware
		// enforces the CSRF double-submit token on the POST.
		const res = await fetch(`/api/v1/auth/complete-onboarding`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRF': getCsrfToken() || '',
			},
			body: JSON.stringify(payload),
		});

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}));
			throw new Error(errorData.message || `Failed to complete onboarding: ${res.statusText}`);
		}

		return await res.json();
	}
}
// #endregion
