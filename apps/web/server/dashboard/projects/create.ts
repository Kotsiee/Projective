import { fail, ok, Result } from '@server/core/http/result.ts';
import { normaliseSupabaseError, normaliseUnknownError } from '@server/core/errors/normalise.ts';
import { supabaseClient } from '@server/core/clients/supabase.ts';
import { Deps } from '../../_shared/types.ts';
import { CreateProjectInput } from '@contracts/dashboard/projects/new/_validation.ts';

export async function createProject(
	data: CreateProjectInput,
	targetStatus: 'draft' | 'active',
	deps: Deps = {},
): Promise<Result<{ projectId: string }>> {
	try {
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		// 1. Auth Check
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		if (authError || !user) {
			return fail('unauthorized', 'You must be signed in to create a project.', 401);
		}

		// 2. Call RPC to insert all data (Project + Stages + Roles)
		// The RPC defaults status to 'draft'
		const { data: projectId, error: rpcError } = await supabase
			.schema('projects')
			.rpc('create_project', {
				payload: data,
			});

		if (rpcError) {
			const n = normaliseSupabaseError(rpcError);
			return fail(n.code, n.message, n.status);
		}

		if (!projectId) {
			return fail('server_error', 'Project creation failed to return an ID.', 500);
		}

		if (targetStatus === 'active') {
			const { error: updateError } = await supabase
				.schema('projects')
				.from('projects')
				.update({ status: 'active' })
				.eq('id', projectId);

			if (updateError) {
				const n = normaliseSupabaseError(updateError);
				return fail('partial_error', `Project saved but failed to publish: ${n.message}`, 500);
			}
		}

		return ok({ projectId });
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}
