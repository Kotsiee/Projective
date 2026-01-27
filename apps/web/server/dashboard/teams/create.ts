import { fail, ok, Result } from '@server/core/http/result.ts';
import { normaliseSupabaseError, normaliseUnknownError } from '@server/core/errors/normalise.ts';
import { supabaseClient } from '@server/core/clients/supabase.ts';
import { Deps } from '../../_shared/types.ts';
import { CreateTeamInput } from '@contracts/dashboard/teams/new/_validation.ts';

export async function createTeam(
	data: CreateTeamInput,
	deps: Deps = {},
): Promise<Result<{ teamId: string; teamSlug: string }>> {
	try {
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		const { data: { user }, error: authError } = await supabase.auth.getUser();
		if (authError || !user) {
			return fail('unauthorized', 'You must be signed in to create a team.', 401);
		}

		const { data: result, error: rpcError } = await supabase
			.schema('org')
			.rpc('create_team', {
				payload: {
					...data,
					owner_id: user.id,
				},
			});

		if (rpcError) {
			const n = normaliseSupabaseError(rpcError);

			if (rpcError.code === '23505' && rpcError.message.includes('slug')) {
				return fail('conflict', 'This team handle is already taken.', 409);
			}
			return fail(n.code, n.message, n.status);
		}

		if (!result || !result.team_id) {
			return fail('server_error', 'Team creation failed to return an ID.', 500);
		}

		return ok({
			teamId: result.team_id,
			teamSlug: result.team_slug,
		});
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}
