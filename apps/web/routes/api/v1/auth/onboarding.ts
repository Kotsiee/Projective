import { define } from '@utils';
import { onboarding } from '@server/auth/onboarding.ts';
import { getAuthCookies } from '@server/auth/cookies.ts';
import { supabaseClient } from '@server/core/clients/supabase.ts';

export const handler = define.handlers({
	async POST(ctx) {
		const body = await ctx.req.json();
		const res = await onboarding(body, {
			getClient: () => supabaseClient(ctx.req),
		});

		if (!res.ok) {
			return new Response(JSON.stringify({ error: res.error }), {
				status: res.error.status ?? 400,
				headers: { 'content-type': 'application/json; charset=utf-8' },
			});
		}

		return new Response(JSON.stringify({ ok: true, redirectTo: '/dashboard' }), {
			status: 200,
		});
	},
});
