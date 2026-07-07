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
import { setAuthCookies } from '@projective/backend';
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
		const next = url.searchParams.get('next') || '/dashboard';

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

		// Recovery: land on the reset form; the session authorises the password update.
		if (type === 'recovery') {
			return redirectTo(headers, '/reset');
		}

		// Confirmation / magic link: route by onboarding completion.
		return redirectTo(headers, res.data.isOnboarded ? next : '/join');
	},
});
// #endregion
