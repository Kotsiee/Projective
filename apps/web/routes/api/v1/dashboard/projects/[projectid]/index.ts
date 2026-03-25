import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import { ProjectsBackendService } from '@features/dashboard/projects/services/ProjectsServiceBackend.ts';

export const handler = define.handlers({
	async GET(ctx) {
		const project_id = ctx.params.projectid;

		if (!project_id) {
			return new Response(JSON.stringify({ error: 'Project ID is required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		try {
			const getClient = () =>
				Promise.resolve((ctx.state as any).supabaseClient ?? supabaseClient(ctx.req));

			const res = await ProjectsBackendService.getProject(project_id, {
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
			return new Response(JSON.stringify({ error: 'Failed to fetch project' }), {
				status: 500,
			});
		}
	},
});
