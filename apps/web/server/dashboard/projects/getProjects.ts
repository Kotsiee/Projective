import { fail, ok, Result } from '@server/core/http/result.ts';
import { normaliseSupabaseError, normaliseUnknownError } from '@server/core/errors/normalise.ts';
import { supabaseClient } from '@server/core/clients/supabase.ts';
import { Deps } from '../../_shared/types.ts';
import { ProjectsFilterParams } from '@contracts/dashboard/projects/Projects.ts';

export async function getDashboardProjects(
	params: ProjectsFilterParams,
	deps: Deps = {},
): Promise<Result<any>> {
	try {
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		const { data, error } = await supabase.schema('projects').rpc('get_dashboard_projects', {
			p_category: params.category ?? 'all',
			p_category_id: params.categoryId ?? null,
			p_search_query: params.search ?? '',
			p_sort_by: params.sortBy ?? 'last_updated',
			p_sort_dir: params.sortDir ?? 'desc',
			p_limit: params.limit ?? 20,
			p_offset: params.offset ?? 0,
		});

		if (error) {
			console.error('RPC Error:', error);
			const n = normaliseSupabaseError(error);
			return fail(n.code, n.message, n.status);
		}

		return ok(data);
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}
