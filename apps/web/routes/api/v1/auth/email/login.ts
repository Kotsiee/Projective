/**
 * @file callback.ts
 * @description API Route Controller for handling OAuth and Email PKCE Verification callbacks.
 */

// #region Imports
import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
// #endregion

// #region Handlers
export const handler = define.handlers({
	async GET(ctx) {
		const url = new URL(ctx.req.url);
		const code = url.searchParams.get('code');

		const cookieHeader = ctx.req.headers.get('Cookie') || '';
		const hasVerifyCookie = cookieHeader.includes('verify_email=');

		if (code) {
			const supabase = await supabaseClient(ctx.req);
			const { error } = await supabase.auth.exchangeCodeForSession(code);

			if (!error) {
				// If the verification happened within the 10-minute cookie window, route to Dashboard.
				// Otherwise, route to Login to enforce a fresh credential check.
				const response = new Response(null, {
					status: 302,
					headers: { Location: hasVerifyCookie ? '/dashboard' : '/login' },
				});

				if (!hasVerifyCookie) {
					// Time limit surpassed; revoke the session created by the PKCE exchange.
					await supabase.auth.signOut();
				} else {
					// Time limit met; clear the tracking cookie immediately.
					response.headers.append(
						'Set-Cookie',
						'verify_email=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax',
					);
				}

				return response;
			}
		}

		// Fallback for invalid codes or bad requests
		return new Response(null, {
			status: 302,
			headers: { Location: '/login?error=Invalid+or+expired+verification+link' },
		});
	},
});
// #endregion
