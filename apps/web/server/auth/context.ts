import { SwitchProfileRequest, SwitchTeamRequest } from '@contracts/auth/context.ts';
import { fail, ok, Result } from '@server/core/http/result.ts';
import { normaliseSupabaseError, normaliseUnknownError } from '@server/core/errors/normalise.ts';
import { supabaseClient } from '@server/core/clients/supabase.ts';
import { Deps } from '../_shared/types.ts';

/**
 * Switches the current user's active context to a specific TEAM.
 * STRICT: Clears active_profile_id and active_profile_type.
 */
export async function switchActiveTeam(
	{ teamId }: SwitchTeamRequest,
	deps: Deps = {},
): Promise<Result<{ activeTeamId: string }>> {
	if (!teamId) {
		return fail('bad_request', 'Team ID is required.', 400);
	}

	try {
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		const { data: { user }, error: authError } = await supabase.auth.getUser();

		if (authError || !user) {
			return fail('unauthorized', 'You must be signed in to switch teams.', 401);
		}

		// 1. Verify Membership (Security Guard)
		const { data: membership, error: memberError } = await supabase
			.schema('org')
			.from('team_memberships')
			.select('id, role')
			.eq('team_id', teamId)
			.eq('user_id', user.id)
			.eq('status', 'active')
			.single();

		if (memberError || !membership) {
			return fail('forbidden', 'You are not an active member of this team.', 403);
		}

		// 2. Update Session Context (Mutually Exclusive)
		const { error: updateError } = await supabase
			.schema('security')
			.from('session_context')
			.upsert(
				{
					user_id: user.id,
					active_team_id: teamId, // SET Team
					active_profile_id: null, // CLEAR Profile
					active_profile_type: null, // CLEAR Type
					updated_at: new Date().toISOString(),
				},
				{ onConflict: 'user_id' },
			);

		if (updateError) {
			const n = normaliseSupabaseError(updateError);
			return fail(n.code, n.message, n.status);
		}

		return ok({ activeTeamId: teamId });
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}

/**
 * Switches the current user's active context to a specific PROFILE (Freelancer or Business).
 * STRICT: Clears active_team_id.
 */
export async function switchActiveProfile(
	{ profileId, type }: SwitchProfileRequest,
	deps: Deps = {},
): Promise<Result<{ activeProfileId: string; type: string }>> {
	if (!profileId || !type) {
		return fail('bad_request', 'Profile ID and Type are required.', 400);
	}

	try {
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		const { data: { user }, error: authError } = await supabase.auth.getUser();

		if (authError || !user) {
			return fail('unauthorized', 'You must be signed in to switch profiles.', 401);
		}

		// 1. Verify Ownership (Security Guard)
		const table = type === 'freelancer' ? 'freelancer_profiles' : 'business_profiles';
		// Business = owner_user_id, Freelancer = user_id
		const ownerCol = type === 'freelancer' ? 'user_id' : 'owner_user_id';

		const { data: profile, error: profileError } = await supabase
			.schema('org')
			.from(table)
			.select('id')
			.eq('id', profileId)
			.eq(ownerCol, user.id)
			.single();

		if (profileError || !profile) {
			return fail('forbidden', 'You do not own this profile.', 403);
		}

		// 2. Update Session Context (Mutually Exclusive)
		const { error: updateError } = await supabase
			.schema('security')
			.from('session_context')
			.upsert(
				{
					user_id: user.id,
					active_profile_id: profileId, // SET Profile
					active_profile_type: type, // SET Type
					active_team_id: null, // CLEAR Team
					updated_at: new Date().toISOString(),
				},
				{ onConflict: 'user_id' },
			);

		if (updateError) {
			const n = normaliseSupabaseError(updateError);
			return fail(n.code, n.message, n.status);
		}

		return ok({ activeProfileId: profileId, type });
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}
