/**
 * @file complete-onboarding.ts
 * @description API route for an authenticated user (a first-time OAuth sign-up) to
 * finish onboarding. Thin controller: guards the session cookie, delegates to the
 * backend service, and returns the post-onboarding redirect target.
 */

// #region Imports
import { define } from '@utils';
import { getAuthCookies, supabaseClient } from '@projective/backend';
import { CompleteOnboardingBackendService } from '@features/auth/services/CompleteOnboardingServiceBackend.ts';
// #endregion

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };

// #region Handlers
export const handler = define.handlers({
	async POST(ctx) {
		const { accessToken } = getAuthCookies(ctx.req);
		if (!accessToken) {
			return new Response(
				JSON.stringify({ error: { code: 'unauthorized' }, message: 'You must be signed in.' }),
				{ status: 401, headers: JSON_HEADERS },
			);
		}

		const body = await ctx.req.json().catch(() => ({}));

		const res = await CompleteOnboardingBackendService.completeOnboarding(body, {
			getClient: async () => await supabaseClient(ctx.req),
		});

		if (!res.ok) {
			const status = res.error.status ?? (res.error.code === 'bad_request' ? 400 : 500);
			return new Response(
				JSON.stringify({ error: res.error, message: res.error.message }),
				{ status, headers: JSON_HEADERS },
			);
		}

		return new Response(
			JSON.stringify({ ok: true, redirectTo: '/dashboard' }),
			{ status: 200, headers: JSON_HEADERS },
		);
	},
});
// #endregion
