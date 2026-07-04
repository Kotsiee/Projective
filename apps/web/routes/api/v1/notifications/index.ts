import { define } from '@utils';
import { getAuthCookies, supabaseClient } from '@projective/backend';
import { NotificationsBackendService } from '@features/navigation/services/NotificationsBackendService.ts';

const JSON_HEADERS = {
	'content-type': 'application/json; charset=utf-8',
	'cache-control': 'no-store',
};

/**
 * GET /api/v1/notifications
 *
 * Thin route: auth-guards on the access-token cookie then delegates to
 * {@link NotificationsBackendService.listRecent}. Returns `{ notifications: [...] }`.
 */
export const handler = define.handlers({
	async GET(ctx) {
		const { accessToken } = getAuthCookies(ctx.req);
		if (!accessToken) {
			return new Response(
				JSON.stringify({ error: { code: 'unauthorized' } }),
				{ status: 401, headers: JSON_HEADERS },
			);
		}

		const result = await NotificationsBackendService.listRecent({
			getClient: () => supabaseClient(ctx.req),
		});

		if (!result.ok) {
			return new Response(
				JSON.stringify({ error: result.error }),
				{ status: result.error.status ?? 500, headers: JSON_HEADERS },
			);
		}

		return new Response(
			JSON.stringify({ notifications: result.data }),
			{ status: 200, headers: JSON_HEADERS },
		);
	},
});
