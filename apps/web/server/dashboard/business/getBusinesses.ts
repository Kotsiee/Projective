import { fail, ok, Result } from '@server/core/http/result.ts';
import { normaliseSupabaseError, normaliseUnknownError } from '@server/core/errors/normalise.ts';
import { supabaseClient } from '@server/core/clients/supabase.ts';
import { Deps } from '../../_shared/types.ts';
import { BusinessFilterParams, DashboardBusiness } from '@contracts/dashboard/business/Business.ts';

interface ExtendedBusinessParams extends BusinessFilterParams {
	countOnly?: boolean;
}

export async function getDashboardBusinesses(
	params: ExtendedBusinessParams,
	deps: Deps = {},
): Promise<Result<{ items: DashboardBusiness[]; meta?: { totalCount: number } }>> {
	try {
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		const limit = params.countOnly ? 1 : (params.limit ?? 20);

		// 1. Call RPC (Optimized Read Model)
		const { data, error } = await supabase.schema('org').rpc('get_dashboard_businesses', {
			p_search_query: params.search ?? '',
			p_sort_by: params.sortBy ?? 'created_at',
			p_sort_dir: params.sortDir ?? 'desc',
			p_limit: limit,
			p_offset: params.offset ?? 0,
		});

		if (error) {
			console.error('RPC Error:', error);
			const n = normaliseSupabaseError(error);
			return fail(n.code, n.message, n.status);
		}

		// 2. Transform Data
		const items = data as DashboardBusiness[];
		const totalCount = items.length > 0 ? Number(items[0].total_count ?? 0) : 0;

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
