import { supabaseClient } from '../core/clients/supabase.ts';
import { getAuthCookies } from './cookies.ts';

type RefreshResult = { access: string; refresh: string } | null;

export async function refreshWithToken(refreshToken: string): Promise<RefreshResult> {
	const sb = await supabaseClient();
	const { data, error } = await sb.auth.refreshSession({ refresh_token: refreshToken });

	if (error || !data?.session?.access_token || !data?.session?.refresh_token) {
		return null;
	}
	return {
		access: data.session.access_token,
		refresh: data.session.refresh_token,
	};
}

export async function maybeRefreshFromRequest(req: Request): Promise<RefreshResult> {
	const { refreshToken } = getAuthCookies(req);
	if (!refreshToken) return null;
	return await refreshWithToken(refreshToken);
}
