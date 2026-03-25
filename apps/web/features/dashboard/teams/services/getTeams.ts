import {
	Deps,
	fail,
	normaliseSupabaseError,
	normaliseUnknownError,
	ok,
	Result,
	supabaseClient,
} from '@projective/backend';
import { DashboardTeam, TeamsFilterParams } from '../contracts/Teams.ts';

interface ExtendedTeamsParams extends TeamsFilterParams {
	countOnly?: boolean;
}

export async function getDashboardTeams(
	params: ExtendedTeamsParams,
	deps: Deps = {},
): Promise<Result<{ items: DashboardTeam[]; meta?: { totalCount: number } }>> {
	try {
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		const limit = params.countOnly ? 1 : (params.limit ?? 20);

		const { data, error } = await supabase.schema('org').rpc('get_dashboard_teams', {
			p_search_query: params.search ?? '',
			p_role_filter: params.role ?? 'all',
			p_sort_by: params.sortBy ?? 'last_updated',
			p_sort_dir: params.sortDir ?? 'desc',
			p_limit: limit,
			p_offset: params.offset ?? 0,
		});

		if (error) {
			console.error('RPC Error:', error);
			const n = normaliseSupabaseError(error);
			return fail(n.code, n.message, n.status);
		}

		const items = data as DashboardTeam[];
		const totalCount = items.length > 0 ? Number(items[0].total_count) : 0;

		if (params.countOnly) {
			return ok({
				items: [],
				meta: { totalCount },
			});
		}

		return ok({ items });
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}
