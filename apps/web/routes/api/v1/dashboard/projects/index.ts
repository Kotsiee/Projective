import { define } from '@utils';
import { supabaseClient } from '@server/core/clients/supabase.ts';
import { getDashboardProjects } from '@server/dashboard/projects/getProjects.ts';

export const handler = define.handlers({
	async GET(ctx) {
		const url = new URL(ctx.req.url);

		const params = {
			category: url.searchParams.get('category') || 'all',
			categoryId: url.searchParams.get('categoryId') || undefined,
			search: url.searchParams.get('search') || '',
			sortBy: url.searchParams.get('sortBy') || 'last_updated',
			sortDir: url.searchParams.get('sortDir') || 'desc',
			limit: parseInt(url.searchParams.get('limit') || '20'),
			offset: parseInt(url.searchParams.get('offset') || '0'),
		};

		try {
			const getClient = () =>
				Promise.resolve((ctx.state as any).supabaseClient ?? supabaseClient(ctx.req));

			const res = await getDashboardProjects(params, {
				getClient,
			});

			if (!res.ok) {
				return new Response(JSON.stringify({ error: res.error }), {
					status: res.error.status ?? 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			return new Response(JSON.stringify(res.data), {
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err) {
			console.error('API Error:', err);
			return new Response(JSON.stringify({ error: 'Failed to fetch projects' }), {
				status: 500,
			});
		}
	},
});
