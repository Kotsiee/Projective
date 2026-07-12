/**
 * @file enable-freelancer.ts
 * @description API route behind the "Become a Partner" CTAs. Thin controller: guards the session
 * cookie (CSRF is enforced globally by routes/_middleware.ts for authenticated, cookie-auth POSTs),
 * delegates to the backend service which calls the `org.enable_freelancer_profile` RPC, and returns
 * where to land the freshly-minted partner. A full navigation to that target re-runs `getMe`, so the
 * app-wide persona flips (nav gates, profile rail, milestone tracker) without any client patching.
 */

// #region Imports
import { define } from '@utils';
import { getAuthCookies, supabaseClient } from '@projective/backend';
import { BecomePartnerServiceBackend } from '@features/marketing/become-partner/services/BecomePartnerServiceBackend.ts';
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
		const skills = Array.isArray(body?.skills)
			? body.skills.filter((s: unknown): s is string => typeof s === 'string')
			: [];

		const res = await BecomePartnerServiceBackend.enableFreelancer(skills, {
			getClient: async () => await supabaseClient(ctx.req),
		});

		if (!res.ok) {
			const status = res.error.status ?? 500;
			return new Response(
				JSON.stringify({ error: res.error, message: res.error.message }),
				{ status, headers: JSON_HEADERS },
			);
		}

		// Land the new partner on their persona home so the freelancer suite + new profile milestone
		// are the first thing they see.
		return new Response(
			JSON.stringify({ ok: true, redirectTo: '/home', created: res.data.created }),
			{ status: 200, headers: JSON_HEADERS },
		);
	},
});
// #endregion
