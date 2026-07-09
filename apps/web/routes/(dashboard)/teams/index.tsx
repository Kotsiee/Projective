import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import { AuthBackendService } from '@features/shared/services/profile/AuthServiceBackend.ts';
import { getDashboardTeams } from '@features/dashboard/teams/services/getTeams.ts';
import { DashboardTeam } from '@features/dashboard/teams/contracts/Teams.ts';
import TeamsWorkspace from '@features/dashboard/teams/islands/TeamsWorkspace.island.tsx';

/**
 * Teams space — an ultra-premium 70/30 operational workspace. The roster + overview are
 * hydrated by the `TeamsWorkspace` island; data is resolved server-side here so the layout
 * paints instantly. Any load failure (e.g. no live DB) degrades to an empty roster.
 */
export default define.page(async function TeamsPage(ctx) {
	// deno-lint-ignore no-explicit-any
	const state = ctx.state as any;
	const getClient = () => Promise.resolve(state.supabaseClient ?? supabaseClient(ctx.req));

	let teams: DashboardTeam[] = [];
	let activeTeamId: string | null = null;

	try {
		const [me, list] = await Promise.all([
			AuthBackendService.getMe({ getClient }),
			getDashboardTeams(
				{ search: '', role: 'all', sortBy: 'last_updated', sortDir: 'desc', limit: 50, offset: 0 },
				{ getClient },
			),
		]);
		if (me.ok && me.data) activeTeamId = me.data.activeTeamId ?? null;
		if (list.ok && list.data?.items) teams = list.data.items;
	} catch (err) {
		console.error('[teams] load failed:', err);
	}

	return <TeamsWorkspace initialTeams={teams} activeTeamId={activeTeamId} />;
});
