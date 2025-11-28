import { define } from '@utils';
import { loginWithEmail } from '@server/auth/email/login.ts';
import { setCookie } from '@std/http/cookie';
import { setAuthCookies } from '@projective/backend';

export const handler = define.handlers({
	async POST(ctx) {
		const body = await ctx.req.json();
		const res = await loginWithEmail(body);

		const reqUrl = new URL(ctx.req.url);
		const verifyUrl = new URL('/verify', reqUrl).href;

		// IMPORTANT: keep a single Headers instance and append cookies to it.
		const headers = new Headers({ 'content-type': 'application/json; charset=utf-8' });

		if (!res.ok) {
			const status = res.error.status ?? (res.error.code === 'bad_request' ? 400 : 401);
			return new Response(JSON.stringify({ error: res.error }), { status, headers });
		}

		// If the user isn’t verified, set a short-lived helper cookie and tell the client to go to /verify.
		const user = res.data.user;
		const unverified = user && !(user.email_confirmed_at ?? user.confirmed_at);

		if (unverified) {
			const email = user.email ?? (typeof body?.email === 'string' ? body.email : '');
			if (email) {
				setCookie(headers, {
					name: 'verify_email',
					value: encodeURIComponent(email),
					httpOnly: true,
					sameSite: 'Lax',
					secure: reqUrl.protocol === 'https:',
					path: '/verify',
					maxAge: 10 * 60,
				});
			}
			// Don’t replace headers—reuse the same instance so previously appended Set-Cookie aren’t lost.
			return new Response(JSON.stringify({ ok: true, redirectTo: verifyUrl }), {
				status: 200,
				headers,
			});
		}

		// If we have a session, persist tokens via cookies (append both, plus CSRF).
		if (res.data.session) {
			const { access_token, refresh_token } = res.data.session;
			if (!access_token || !refresh_token) {
				return new Response(
					JSON.stringify({ error: { code: 'bad_request', message: 'Missing tokens' } }),
					{
						status: 400,
						headers,
					},
				);
			}
			// Derive secure + naming from the request URL/host inside the helper.
			setAuthCookies(headers, {
				accessToken: access_token,
				refreshToken: refresh_token,
				requestUrl: reqUrl,
			});
		}

		return new Response(JSON.stringify({ ok: true, redirectTo: '/' }), {
			status: 200,
			headers,
		});
	},
});
