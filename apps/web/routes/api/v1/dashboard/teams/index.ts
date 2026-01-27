// deno-lint-ignore-file no-explicit-any
import { define } from '@utils';
import { supabaseClient } from '@server/core/clients/supabase.ts';
import { CreateTeamSchema } from '@contracts/dashboard/teams/new/_validation.ts';
import { createTeam } from '@server/dashboard/teams/create.ts';
import { getDashboardTeams } from '@server/dashboard/teams/getTeams.ts';

export const handler = define.handlers({
	async GET(ctx) {
		const url = new URL(ctx.req.url);

		const params = {
			search: url.searchParams.get('search') || '',
			role: (url.searchParams.get('role') as any) || 'all',
			sortBy: (url.searchParams.get('sortBy') as any) || 'last_updated',
			sortDir: (url.searchParams.get('sortDir') as any) || 'desc',
			limit: parseInt(url.searchParams.get('limit') || '20'),
			offset: parseInt(url.searchParams.get('offset') || '0'),
			countOnly: url.searchParams.get('countOnly') === 'true',
		};

		try {
			const getClient = () =>
				Promise.resolve((ctx.state as any).supabaseClient ?? supabaseClient(ctx.req));

			const res = await getDashboardTeams(params, {
				getClient,
			});

			if (!res.ok) {
				return new Response(JSON.stringify({ error: res.error }), {
					status: res.error.status ?? 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			console.log(params);
			console.log('API GET /dashboard/teams - Retrieved teams:', res.data);
			return new Response(JSON.stringify(res.data), {
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err) {
			console.error('API Error:', err);
			return new Response(JSON.stringify({ error: 'Failed to fetch teams' }), {
				status: 500,
			});
		}
	},
	async POST(ctx) {
		try {
			const body = await ctx.req.json();

			const validation = CreateTeamSchema.safeParse(body);

			if (!validation.success) {
				return new Response(
					JSON.stringify({
						error: {
							code: 'validation_error',
							message: 'Invalid team data',
							details: validation.error.flatten(),
						},
					}),
					{ status: 400, headers: { 'Content-Type': 'application/json' } },
				);
			}

			const getClient = () =>
				Promise.resolve((ctx.state as any).supabaseClient ?? supabaseClient(ctx.req));

			const res = await createTeam(validation.data, {
				getClient,
			});

			if (!res.ok) {
				return new Response(JSON.stringify({ error: res.error }), {
					status: res.error.status ?? 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			return new Response(
				JSON.stringify({
					ok: true,
					teamId: res.data.teamId,
					redirectTo: `/teams/${res.data.teamSlug}`,
				}),
				{
					status: 201,
					headers: { 'Content-Type': 'application/json' },
				},
			);
		} catch (error) {
			console.error('Team creation error:', error);
			return new Response(JSON.stringify({ error: 'Bad Request' }), { status: 400 });
		}
	},
});
