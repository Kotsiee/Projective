import { define } from '@utils';
import { setCookie } from '@std/http/cookie';
import { setAuthCookies } from '@projective/backend';
import { loginWithEmail } from '@features/auth/services/email/login.ts';

export const handler = define.handlers({
	async POST(ctx) {
		const body = await ctx.req.json();
		const res = await loginWithEmail(body);

		const reqUrl = new URL(ctx.req.url);
		const verifyUrl = new URL('/verify', reqUrl).href;

		const headers = new Headers({ 'content-type': 'application/json; charset=utf-8' });

		if (!res.ok) {
			const status = res.error.status ?? (res.error.code === 'bad_request' ? 400 : 401);
			return new Response(JSON.stringify({ error: res.error }), { status, headers });
		}

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
			return new Response(JSON.stringify({ ok: true, redirectTo: verifyUrl }), {
				status: 200,
				headers,
			});
		}

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
