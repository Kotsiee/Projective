import { define } from '@utils';
import { setAuthCookies } from '@projective/backend';

export const handler = define.handlers({
	async POST(ctx) {
		const reqUrl = new URL(ctx.req.url);
		const { access_token, refresh_token } = await ctx.req.json();
		if (!access_token || !refresh_token) {
			return new Response(
				JSON.stringify({ error: { code: 'bad_request', message: 'Missing tokens' } }),
				{
					status: 400,
					headers: { 'content-type': 'application/json; charset=utf-8' },
				},
			);
		}

		const headers = new Headers({ 'content-type': 'application/json; charset=utf-8' });
		setAuthCookies(headers, {
			accessToken: access_token,
			refreshToken: refresh_token,
			requestUrl: reqUrl,
		});
		return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
	},
});
