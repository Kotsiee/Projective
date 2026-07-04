import { define } from '@utils';
import { clearAuthCookies, getAuthCookies, supabaseClient } from '@projective/backend';

/**
 * POST /api/v1/auth/logout
 *
 * Thin route: best-effort clears the server-side `security.session_context` trail
 * (active profile/team) while the access token is still valid, then unconditionally
 * invalidates the auth + CSRF cookies. The client ({@link UserContext} `logout`)
 * handles the redirect to `/login`.
 */
export const handler = define.handlers({
	async POST(ctx) {
		const reqUrl = new URL(ctx.req.url);
		const headers = new Headers({ 'content-type': 'application/json; charset=utf-8' });

		// #region 1. Best-effort session-context teardown (never blocks logout)
		try {
			const { accessToken } = getAuthCookies(ctx.req);
			if (accessToken) {
				const supabase = await supabaseClient(ctx.req);
				const { data: { user } } = await supabase.auth.getUser();
				if (user) {
					await supabase
						.schema('security')
						.from('session_context')
						.update({
							active_profile_id: null,
							active_profile_type: null,
							active_team_id: null,
							updated_at: new Date().toISOString(),
						})
						.eq('user_id', user.id);
				}
			}
		} catch (err) {
			console.error('Logout context clear failed (non-fatal):', err);
		}
		// #endregion

		// #region 2. Invalidate client cookies (always)
		clearAuthCookies(headers, reqUrl);
		// #endregion

		return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
	},
});
