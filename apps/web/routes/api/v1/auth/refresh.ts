// apps/web/routes/api/v1/auth/refresh.ts
import { define } from '@utils';
import { maybeRefreshFromRequest } from '@server/auth/refresh.ts';
import { clearAuthCookies, setAuthCookies } from '@projective/backend';

export const handler = define.handlers({
	async POST(ctx) {
		const url = new URL(ctx.req.url);
		const refreshed = await maybeRefreshFromRequest(ctx.req);

		if (!refreshed) {
			const headers = new Headers({ 'content-type': 'application/json; charset=utf-8' });
			clearAuthCookies(headers, url);
			return new Response(JSON.stringify({ ok: false, error: { code: 'refresh_failed' } }), {
				status: 401,
				headers,
			});
		}

		const headers = new Headers({ 'content-type': 'application/json; charset=utf-8' });
		setAuthCookies(headers, {
			accessToken: refreshed.access,
			refreshToken: refreshed.refresh,
			requestUrl: url,
		});

		return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
	},
});
