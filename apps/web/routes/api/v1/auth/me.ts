import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import { getAuthCookies } from '@projective/backend';
import { AuthBackendService } from '@features/shared/services/profile/AuthServiceBackend.ts';

export const handler = define.handlers({
	async GET(ctx) {
		const { accessToken } = getAuthCookies(ctx.req);

		if (!accessToken) {
			return new Response(
				JSON.stringify({ error: { code: 'unauthorized' } }),
				{
					status: 401,
					headers: {
						'content-type': 'application/json; charset=utf-8',
						'cache-control': 'no-store',
					},
				},
			);
		}

		// Delegate business logic and DB fetching to the Service layer
		const result = await AuthBackendService.getMe({
			getClient: async () => await supabaseClient(ctx.req),
		});

		if (!result.ok) {
			return new Response(
				JSON.stringify({ error: { code: result.error?.code || 'unauthorized' } }),
				{
					status: result.error?.status || 401,
					headers: {
						'content-type': 'application/json; charset=utf-8',
						'cache-control': 'no-store',
					},
				},
			);
		}

		// Return successful response
		return new Response(JSON.stringify({ user: result.data }), {
			status: 200,
			headers: {
				'content-type': 'application/json; charset=utf-8',
				'cache-control': 'no-store',
			},
		});
	},
});
