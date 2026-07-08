/**
 * @file callback.ts
 * @description API Route Controller for handling the OAuth PKCE redirect from Supabase.
 */

// #region Imports
import { define } from '@utils';
import { clearPkceCookie, getPkceCookie, setAuthCookies } from '@projective/backend';
import { setCookie } from '@std/http/cookie';
import { OAuthBackendService } from '@features/auth/services/OAuthBackendService.ts';
// #endregion

// #region Helpers
function redirect(headers: Headers, location: string): Response {
	headers.set('Location', location);
	return new Response(null, { status: 303, headers });
}

function loginError(headers: Headers, message: string): Response {
	return redirect(headers, `/login?error=${encodeURIComponent(message)}`);
}
// #endregion

// #region Handlers
export const handler = define.handlers({
	async GET(ctx) {
		const reqUrl = new URL(ctx.req.url);
		const code = reqUrl.searchParams.get('code');
		const next = reqUrl.searchParams.get('next') || '/dashboard';
		const verifier = getPkceCookie(ctx.req);

		// Always tear down the one-shot handshake cookie, whatever the outcome.
		const headers = new Headers();
		clearPkceCookie(headers, reqUrl);

		// Surface provider-side errors (e.g. user denied consent) cleanly.
		const providerError = reqUrl.searchParams.get('error_description') ||
			reqUrl.searchParams.get('error');
		if (providerError) {
			return loginError(headers, providerError.replace(/\+/g, ' '));
		}

		if (!code || !verifier) {
			return loginError(headers, 'Your sign-in link was invalid or has expired. Please try again.');
		}

		// Delegate the PKCE exchange + onboarding detection to the Fat Service.
		const res = await OAuthBackendService.handleCallback(code, verifier);
		if (!res.ok) {
			// Log the real reason to the terminal; surface a trimmed reason in the URL
			// so the failure is diagnosable during local development.
			console.error('[callback] ❌ OAuth sign-in failed:', JSON.stringify(res.error));
			const reason = res.error?.message
				? `Sign-in failed: ${res.error.message}`
				: 'We could not complete sign-in. Please try again.';
			return loginError(headers, reason);
		}

		// Establish the secure HTTP-only session.
		setAuthCookies(headers, {
			accessToken: res.data.session.access_token,
			refreshToken: res.data.session.refresh_token,
			requestUrl: reqUrl,
		});

		if (res.data.isOnboarded) {
			// Already onboarded -> go straight to the requested destination.
			return redirect(headers, next);
		}

		// Needs onboarding -> hand provider metadata to the client for form hydration.
		// The onboarding wizard lives at /join; the sso_partial_data cookie below is
		// what auto-advances it past the account step (there is no /onboarding route).
		setCookie(headers, {
			name: 'sso_partial_data',
			value: encodeURIComponent(JSON.stringify(res.data.ssoData)),
			path: '/',
			maxAge: 60 * 15, // 15 minutes TTL
			httpOnly: false, // must be readable by frontend JS to hydrate the wizard
			secure: reqUrl.protocol === 'https:',
			sameSite: 'Lax',
		});

		return redirect(headers, '/join');
	},
});
// #endregion
