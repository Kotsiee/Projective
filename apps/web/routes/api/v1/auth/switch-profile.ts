import { define } from '@utils';
import { supabaseClient } from '@server/core/clients/supabase.ts';
import { switchActiveProfile } from '@server/auth/context.ts';

export const handler = define.handlers({
	async POST(ctx) {
		try {
			const body = await ctx.req.json();
			const { profileId, type } = body;

			// Basic Input Validation
			if (!profileId || !['freelancer', 'business'].includes(type)) {
				return new Response(
					JSON.stringify({
						error: {
							code: 'bad_request',
							message: 'Invalid profileId or type',
						},
					}),
					{ status: 400, headers: { 'Content-Type': 'application/json' } },
				);
			}

			// Execute Service
			const result = await switchActiveProfile(
				{ profileId, type },
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
			console.error('Switch Profile Error:', err);
			return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
				status: 500,
			});
		}
	},
});
