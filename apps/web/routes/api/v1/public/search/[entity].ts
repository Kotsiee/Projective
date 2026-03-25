import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import { SearchBackendService } from '@features/public/explore/services/SearchServiceBackend.ts';

export const handler = define.handlers({
	async GET(ctx) {
		const url = new URL(ctx.req.url);
		const entity = ctx.params.entity?.toLowerCase() || '';

		const params = {
			query: url.searchParams.get('query') || '',
			countOnly: url.searchParams.get('countOnly') === 'true',
			limit: parseInt(url.searchParams.get('limit') || '20', 10),
			offset: parseInt(url.searchParams.get('offset') || '0', 10),
		};

		try {
			const getClient = () =>
				// deno-lint-ignore no-explicit-any
				Promise.resolve((ctx.state as any).supabaseClient ?? supabaseClient(ctx.req));

			const res = await SearchBackendService.searchAndHydrate(entity, params, { getClient });

			if (!res.ok) {
				return new Response(JSON.stringify({ error: res.error }), {
					status: res.error.status ?? 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			return new Response(JSON.stringify(res.data), {
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (_) {
			return new Response(JSON.stringify({ error: 'Failed to execute search' }), { status: 500 });
		}
	},
});
