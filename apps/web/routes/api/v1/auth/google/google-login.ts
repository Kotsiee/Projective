import { define } from '@utils';
import { getProviderRedirectUrl } from '@server/auth/oauth.ts';

export const handler = define.handlers({
	async GET(ctx) {
		try {
			const url = new URL(ctx.req.url);

			const next = url.searchParams.get('next') || '/';

			const redirect = await getProviderRedirectUrl('google', 'login', url, next);

			return new Response(null, {
				status: 303,
				headers: { Location: redirect },
			});
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'OAuth init failed';

			return new Response(
				JSON.stringify({ error: { code: 'oauth_init_failed', message: msg } }),
				{
					status: 500,
					headers: { 'content-type': 'application/json; charset=utf-8' },
				},
			);
		}
	},
});
