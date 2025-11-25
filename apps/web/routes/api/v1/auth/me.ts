// apps/web/routes/api/v1/auth/me.ts
import { define } from '@utils';
import { supabaseClient } from '@server/core/clients/supabase.ts';
import { getAuthCookies } from '@server/auth/cookies.ts';

export const handler = define.handlers({
	async GET(ctx) {
		const { accessToken } = getAuthCookies(ctx.req);
		if (!accessToken) {
			return new Response(JSON.stringify({ error: { code: 'unauthorized' } }), {
				status: 401,
				headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
			});
		}

		const sb = await supabaseClient(ctx.req);
		const { data: userRes, error: userErr } = await sb.auth.getUser();
		if (userErr || !userRes?.user) {
			return new Response(JSON.stringify({ error: { code: 'unauthorized' } }), {
				status: 401,
				headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
			});
		}

		// Fetch public profile under RLS
		const { data: row } = await sb
			.from('org.users_public')
			.select(
				'user_id, display_name, avatar_url, active_profile_type, active_profile_id, active_team_id',
			)
			.eq('user_id', userRes.user.id)
			.single();

		const payload = row
			? {
				id: row.user_id as string,
				displayName: (row.display_name as string) ?? null,
				avatarUrl: (row.avatar_url as string) ?? null,
				activeProfileType: (row.active_profile_type as 'freelancer' | 'business' | null) ?? null,
				activeProfileId: (row.active_profile_id as string | null) ?? null,
				activeTeamId: (row.active_team_id as string | null) ?? null,
			}
			: {
				id: userRes.user.id,
				displayName: null,
				avatarUrl: null,
				activeProfileType: null,
				activeProfileId: null,
				activeTeamId: null,
			};

		return new Response(JSON.stringify({ user: payload }), {
			status: 200,
			headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
		});
	},
});
