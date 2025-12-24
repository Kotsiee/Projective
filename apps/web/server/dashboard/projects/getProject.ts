import { fail, ok, Result } from '@server/core/http/result.ts';
import { normaliseSupabaseError, normaliseUnknownError } from '@server/core/errors/normalise.ts';
import { supabaseClient } from '@server/core/clients/supabase.ts';
import { Deps } from '../../_shared/types.ts';

export async function getProject(
	project_id: string,
	deps: Deps = {},
): Promise<Result<any>> {
	try {
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		const { data, error } = await supabase
			.schema('projects')
			.rpc('get_project_details', {
				p_project_id: project_id,
			})
			.single();

		if (error) {
			console.error('RPC Error:', error);
			const n = normaliseSupabaseError(error);
			return fail(n.code, n.message, n.status);
		}
		console.log(data);
		return ok(data);
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}
