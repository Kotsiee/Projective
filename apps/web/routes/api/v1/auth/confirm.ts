/**
 * @file confirm.ts
 * @description Verifies email token-hash links (signup confirmation, recovery,
 * etc.) server-side and establishes a session. Target of the `{{ .TokenHash }}`
 * links emitted by the Supabase email templates.
 *
 * Link shape: /api/v1/auth/confirm?token_hash=...&type=email&next=/dashboard
 */

// #region Imports
import { define } from '@utils';
import { safeReturnTo, setAuthCookies } from '@projective/backend';
import { deleteCookie, getCookies } from '@std/http/cookie';
import {
	ConfirmBackendService,
	isEmailConfirmType,
} from '@features/auth/services/ConfirmBackendService.ts';
// #endregion

// #region Helpers
function redirectTo(headers: Headers, location: string): Response {
	headers.set('Location', location);
	return new Response(null, { status: 303, headers });
}
// #endregion

// #region Handlers
export const handler = define.handlers({
	async GET(ctx) {
		const url = new URL(ctx.req.url);
		const tokenHash = url.searchParams.get('token_hash');
		const type = url.searchParams.get('type');

		// Resolve the return target: the same-browser pjv_return_to cookie wins (most
		// reliable), then the link's ?next=, then the /dashboard default. safeReturnTo
		// blocks open redirects from either source.
		const cookies = getCookies(ctx.req.headers);
		const cookieNext = cookies['pjv_return_to']
			? decodeURIComponent(cookies['pjv_return_to'])
			: null;
		const next = safeReturnTo(cookieNext ?? url.searchParams.get('next'));

		const headers = new Headers();

		// Where to send the user if verification fails, by flow.
		const failTarget = type === 'recovery' ? '/forgot-password?error=' : '/verify?error=';

		if (!tokenHash || !isEmailConfirmType(type)) {
			return redirectTo(
				headers,
				`${failTarget}${encodeURIComponent('This link is invalid or has expired.')}`,
			);
		}

		const res = await ConfirmBackendService.verifyTokenHash(tokenHash, type);
		if (!res.ok) {
			return redirectTo(
				headers,
				`${failTarget}${encodeURIComponent('This link is invalid or has expired.')}`,
			);
		}

		// Establish the secure session for the confirmed user.
		setAuthCookies(headers, {
			accessToken: res.data.session.access_token,
			refreshToken: res.data.session.refresh_token,
			requestUrl: url,
		});

		// Verification succeeded — the return target has now been consumed, so clear it
		// (only on success; failures above keep it so a resent link still works).
		deleteCookie(headers, 'pjv_return_to', { path: '/' });

		// Recovery: land on the reset form; the session authorises the password update.
		if (type === 'recovery') {
			return redirectTo(headers, '/reset');
		}

		// Confirmation / magic link: route by onboarding completion. Not-yet-onboarded
		// users finish on /join — carry the return target so complete_onboarding lands
		// them back where they started.
		return redirectTo(
			headers,
			res.data.isOnboarded ? next : `/join?redirectTo=${encodeURIComponent(next)}`,
		);
	},
});
// #endregion
