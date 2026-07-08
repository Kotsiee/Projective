/**
 * @file /api/v1/admin/search/analytics
 * @description Admin analytics on the discovery engine: query execution timings (avg / p95 / max),
 * matching density, query volume by entity type, top queries, live weight distribution, and index
 * density. Backed by search.fn_search_analytics (admin-guarded via search.is_admin()).
 *
 * Query param: ?window_hours=N (default 168 = 7 days).
 */

import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import { SearchEngineServiceBackend } from '@features/public/explore/services/SearchEngineServiceBackend.ts';

export const handler = define.handlers({
	async GET(ctx) {
		if (!ctx.state.isAuthenticated) {
			return new Response(
				JSON.stringify({ error: { code: 'unauthorized', message: 'Sign in required' } }),
				{ status: 401, headers: { 'Content-Type': 'application/json' } },
			);
		}

		const url = new URL(ctx.req.url);
		const windowHours = Math.min(
			Math.max(parseInt(url.searchParams.get('window_hours') || '168', 10), 1),
			8760,
		);

		const getClient = () =>
			// deno-lint-ignore no-explicit-any
			Promise.resolve((ctx.state as any).supabaseClient ?? supabaseClient(ctx.req));

		const res = await SearchEngineServiceBackend.getAnalytics(windowHours, { getClient });
		if (!res.ok) {
			return new Response(JSON.stringify({ error: res.error }), {
				status: res.error.status,
				headers: { 'Content-Type': 'application/json' },
			});
		}
		return new Response(JSON.stringify(res.data), {
			status: 200,
			headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
		});
	},
});
