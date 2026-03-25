import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import { getDashboardTeams } from '@features/dashboard/teams/services/getTeams.ts';
import { CreateTeamSchema } from '@features/dashboard/teams/contracts/new/_validation.ts';
import { createTeam } from '@features/dashboard/teams/services/create.ts';

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
			const contentType = ctx.req.headers.get('content-type') || '';
			let body: any = {};
			let avatarFile: File | undefined;
			let bannerFile: File | undefined;

			if (contentType.includes('multipart/form-data')) {
				const formData = await ctx.req.formData();
				const payloadStr = formData.get('payload')?.toString();
				if (!payloadStr) {
					return new Response(
						JSON.stringify({ error: 'Missing payload data' }),
						{ status: 400, headers: { 'Content-Type': 'application/json' } },
					);
				}

				try {
					body = JSON.parse(payloadStr);
				} catch {
					return new Response(
						JSON.stringify({ error: 'Invalid JSON in payload' }),
						{ status: 400, headers: { 'Content-Type': 'application/json' } },
					);
				}

				const avatar = formData.get('avatar');
				if (avatar instanceof File) avatarFile = avatar;

				const banner = formData.get('banner');
				if (banner instanceof File) bannerFile = banner;
			} else {
				body = await ctx.req.json();
			}

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

			const res = await createTeam(
				validation.data,
				{
					avatar: avatarFile,
					banner: bannerFile,
				},
				{ getClient },
			);

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
