/**
 * @file index.ts
 * @description API Route Controller for handling the OAuth redirect from Supabase.
 */

// #region Imports
import { define } from '@utils';
import { setAuthCookies } from '@projective/backend';
import { setCookie } from '@std/http/cookie';
import { OAuthBackendService } from '@features/auth/services/OAuthBackendService.ts';
// #endregion

// #region Handlers
export const handler = define.handlers({
	async GET(ctx) {
		const reqUrl = new URL(ctx.req.url);
		const code = reqUrl.searchParams.get('code');
		const next = reqUrl.searchParams.get('next') || '/dashboard';

		if (!code) {
			return new Response(
				JSON.stringify({ error: 'Missing OAuth code parameter' }),
				{ status: 400, headers: { 'content-type': 'application/json' } },
			);
		}

		// Delegate to Fat Service
		const res = await OAuthBackendService.handleCallback(code);

		if (!res.ok) {
			return new Response(
				JSON.stringify({ error: res.error }),
				{ status: res.error.status || 500, headers: { 'content-type': 'application/json' } },
			);
		}

		const headers = new Headers();

		// Set core secure HTTP-only auth cookies to establish session
		setAuthCookies(headers, {
			accessToken: res.data.session.access_token,
			refreshToken: res.data.session.refresh_token,
			requestUrl: reqUrl,
		});

		if (res.data.isOnboarded) {
			// Already onboarded -> Go straight to dashboard (or requested next path)
			headers.set('Location', next);
			return new Response(null, { status: 303, headers });
		} else {
			// Needs Onboarding -> Pass metadata to frontend via temporary readable cookie
			setCookie(headers, {
				name: 'sso_partial_data',
				value: encodeURIComponent(JSON.stringify(res.data.ssoData)),
				path: '/',
				maxAge: 60 * 15, // 15 minutes TTL
				httpOnly: false, // Must be false so frontend JS can read/hydrate it
				secure: reqUrl.protocol === 'https:',
				sameSite: 'Lax',
			});

			headers.set('Location', '/onboarding?step=2');
			return new Response(null, { status: 303, headers });
		}
	},
});
// #endregion
