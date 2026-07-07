import { define } from '@utils';
import { getProviderRedirect } from '@features/auth/services/oauth.ts';
import { setPkceCookie } from '@projective/backend';

export const handler = define.handlers({
	async GET(ctx) {
		try {
			const url = new URL(ctx.req.url);
			const next = url.searchParams.get('next') || '/';

			const { url: redirect, verifier } = await getProviderRedirect(
				'github',
				'register',
				url,
				next,
			);

			const headers = new Headers({ Location: redirect });
			setPkceCookie(headers, verifier, url);

			return new Response(null, { status: 303, headers });
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
