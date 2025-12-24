import { define } from '@utils';
import { supabaseClient } from '@server/core/clients/supabase.ts';
import { getStage } from '@server/dashboard/projects/getStage.ts';

export const handler = define.handlers({
	async GET(ctx) {
		const project_id = ctx.params.projectid;
		const stage_id = ctx.params.stageid;

		if (!project_id || !stage_id) {
			return new Response(JSON.stringify({ error: 'Project ID and Stage ID are required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		try {
			const getClient = () =>
				Promise.resolve((ctx.state as any).supabaseClient ?? supabaseClient(ctx.req));

			const res = await getStage(project_id, stage_id, {
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
			return new Response(JSON.stringify({ error: 'Failed to fetch stage' }), {
				status: 500,
			});
		}
	},
});
