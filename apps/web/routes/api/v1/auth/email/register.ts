import { define } from '@utils';
import { registerWithEmail } from '@server/auth/email/register.ts';
import { setCookie } from '@std/http/cookie';

export const handler = define.handlers({
	async POST(ctx) {
		const body = await ctx.req.json();
		const res = await registerWithEmail(body, {}, {});
		const reqUrl = new URL(ctx.req.url);
		const verifyUrl = new URL('/verify', reqUrl).href;

		if (!res.ok) {
			const status = res.error.status ?? (res.error.code === 'bad_request' ? 400 : 500);
			return new Response(JSON.stringify({ error: res.error }), {
				status,
				headers: { 'content-type': 'application/json; charset=utf-8' },
			});
		}

		const email = res.data.user?.email ?? (typeof body?.email === 'string' ? body.email : '');

		const headers = new Headers({
			location: verifyUrl,
		});
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

			return new Response(JSON.stringify({ ok: true, redirectTo: verifyUrl }), {
				status: 200,
				headers,
			});
		}

		return new Response(null, { status: 303, headers });
	},
});
