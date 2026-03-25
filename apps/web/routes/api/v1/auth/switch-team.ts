import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import { switchActiveTeam } from '@features/auth/services/context.ts';

export const handler = define.handlers({
	async POST(ctx) {
		try {
			const body = await ctx.req.json();
			const { teamId } = body;

			if (!teamId || typeof teamId !== 'string') {
				return new Response(
					JSON.stringify({
						error: { code: 'bad_request', message: 'Missing teamId' },
					}),
					{ status: 400, headers: { 'Content-Type': 'application/json' } },
				);
			}

			const result = await switchActiveTeam(
				{ teamId },
				{ getClient: () => supabaseClient(ctx.req) },
			);

			if (!result.ok) {
				return new Response(JSON.stringify({ error: result.error }), {
					status: result.error.status ?? 500,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			return new Response(JSON.stringify({ ok: true, data: result.data }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err) {
			console.error('Switch Team Error:', err);
			return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
				status: 500,
			});
		}
	},
});
