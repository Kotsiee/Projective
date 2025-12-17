import { define } from '@utils';
import { supabaseClient } from '@server/core/clients/supabase.ts';
import { CreateProjectSchema } from '@contracts/dashboard/projects/new/_validation.ts';
import { createProject } from '@server/dashboard/projects/create.ts';

export const handler = define.handlers({
	async POST(ctx) {
		try {
			const body = await ctx.req.json();

			// 1. Validate Payload
			const validation = CreateProjectSchema.safeParse(body);

			if (!validation.success) {
				return new Response(
					JSON.stringify({
						error: {
							code: 'validation_error',
							message: 'Invalid project data',
							details: validation.error.flatten(),
						},
					}),
					{ status: 400, headers: { 'Content-Type': 'application/json' } },
				);
			}

			const getClient = () =>
				Promise.resolve((ctx.state as any).supabaseClient ?? supabaseClient(ctx.req));

			const res = await createProject(validation.data, 'active', {
				getClient,
			});

			// 3. Response
			if (!res.ok) {
				return new Response(JSON.stringify({ error: res.error }), {
					status: res.error.status ?? 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			return new Response(
				JSON.stringify({
					ok: true,
					projectId: res.data.projectId,
					redirectTo: `/projects/${res.data.projectId}`,
				}),
				{
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				},
			);
		} catch (_) {
			return new Response(JSON.stringify({ error: 'Bad Request' }), { status: 400 });
		}
	},
});
