/**
 * @file login.ts
 * @description API Route Controller for user authentication.
 */

// #region Imports
import { define } from '@utils';
import { setAuthCookies } from '@projective/backend';
import { LoginBackendService } from '@features/auth/services/LoginBackendService.ts';
// #endregion

// #region Handlers
export const handler = define.handlers({
	async POST(ctx) {
		console.log('[API Route: login] 📨 Received POST request');

		const req = await ctx.req.json();
		const res = await LoginBackendService.loginWithEmail(req);

		// 1. Handle Failures & Intercept Verification Locks
		if (!res.ok) {
			const errorMsg = res.error.message?.toLowerCase() || '';
			const isUnverified = errorMsg.includes('email not confirmed');

			// Intercept Supabase's confirmation lock and direct the user to the verification UI
			if (isUnverified) {
				console.log('[API Route: login] ⚠️ User requires email verification. Redirecting...');
				return new Response(JSON.stringify({ redirectTo: '/verify', email: req.email }), {
					status: 403,
					headers: { 'content-type': 'application/json; charset=utf-8' },
				});
			}

			return new Response(JSON.stringify({ error: res.error, message: res.error.message }), {
				status: res.error.status ?? 400,
				headers: { 'content-type': 'application/json; charset=utf-8' },
			});
		}

		// 2. Handle Success & Establish Session Cookies
		console.log('[API Route: login] ✅ Success. Establishing secure session cookies...');
		const headers = new Headers({ 'content-type': 'application/json; charset=utf-8' });

		console.log(res);

		setAuthCookies(headers, {
			accessToken: res.data.session.access_token,
			refreshToken: res.data.session.refresh_token,
			requestUrl: new URL(ctx.req.url),
		});

		// 3. Route User Based on Profile State
		// Note: onboarding lives at /join (there is no /onboarding route).
		const redirectTo = res.data.isOnboarded ? '/home' : '/join';

		return new Response(JSON.stringify({ redirectTo }), {
			status: 200,
			headers,
		});
	},
});
// #endregion
