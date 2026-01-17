import { define } from "@utils";
import { supabaseClient } from "@server/core/clients/supabase.ts";
import { getAuthCookies } from "@projective/backend";

export const handler = define.handlers({
	async GET(ctx) {
		console.log(ctx);
		const { accessToken } = getAuthCookies(ctx.req);
		if (!accessToken) {
			return new Response(
				JSON.stringify({ error: { code: "unauthorized" } }),
				{
					status: 401,
					headers: {
						"content-type": "application/json; charset=utf-8",
						"cache-control": "no-store",
					},
				},
			);
		}

		const sb = await supabaseClient(ctx.req);
		const { data: userRes, error: userErr } = await sb.auth.getUser();

		if (userErr || !userRes?.user) {
			console.log("Auth Me Error:", userErr);
			return new Response(
				JSON.stringify({ error: { code: "unauthorized" } }),
				{
					status: 401,
					headers: {
						"content-type": "application/json; charset=utf-8",
						"cache-control": "no-store",
					},
				},
			);
		}

		const { data: publicProfile } = await sb
			.schema("org")
			.from("users_public")
			.select("user_id, first_name, last_name, username, avatar_url")
			.eq("user_id", userRes.user.id)
			.single();

		const { data: sessionContext } = await sb
			.schema("security")
			.from("session_context")
			.select("active_profile_type, active_profile_id, active_team_id")
			.eq("user_id", userRes.user.id)
			.single();

		const payload = {
			id: userRes.user.id,

			displayName: publicProfile
				? `${publicProfile.first_name || ""} ${
					publicProfile.last_name || ""
				}`.trim() ||
					publicProfile.username
				: null,
			username: publicProfile?.username ?? null,
			avatarUrl: publicProfile?.avatar_url ?? null,

			activeProfileType: (sessionContext?.active_profile_type as
				| "freelancer"
				| "business"
				| null) ?? null,
			activeProfileId:
				(sessionContext?.active_profile_id as string | null) ?? null,
			activeTeamId: (sessionContext?.active_team_id as string | null) ??
				null,
		};

		return new Response(JSON.stringify({ user: payload }), {
			status: 200,
			headers: {
				"content-type": "application/json; charset=utf-8",
				"cache-control": "no-store",
			},
		});
	},
});
