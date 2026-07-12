/**
 * @file BecomePartnerServiceBackend.ts
 * @description Backend service behind the "Become a Partner" conversion CTAs. It links a freelancer
 * profile record to the authenticated client/operator via the `org.enable_freelancer_profile`
 * RPC (mig 0313), which — in one SECURITY DEFINER transaction — creates the freelancer profile row,
 * flips `org.users_public.is_freelancer`, activates the freelancer persona in
 * `security.session_context`, and writes the `freelancer.unlocked` audit entry. Idempotent: calling
 * it again for an existing partner is a no-op that simply re-activates the persona.
 */

// #region Imports
import {
	Deps,
	fail,
	normaliseSupabaseError,
	normaliseUnknownError,
	ok,
	Result,
	supabaseClient,
} from '@projective/backend';
// #endregion

export interface EnableFreelancerResult {
	freelancerProfileId: string;
	/** True when this call actually created the profile (false when it already existed). */
	created: boolean;
}

// #region Service Definition
export class BecomePartnerServiceBackend {
	/**
	 * Unlock (or re-activate) the authenticated user's freelancer profile.
	 * @param skills Optional starter skills carried from the CTA.
	 * @param deps   Injected authed-client getter (the RPC keys off `auth.uid()`).
	 */
	static async enableFreelancer(
		skills: string[] = [],
		deps: Deps = {},
	): Promise<Result<EnableFreelancerResult>> {
		try {
			const getClient = deps.getClient ?? supabaseClient;
			const supabase = await getClient();

			const { data: { user }, error: authError } = await supabase.auth.getUser();
			if (authError || !user) {
				return fail('unauthorized', 'You must be signed in to become a partner.', 401);
			}

			const { data, error } = await supabase
				.schema('org')
				.rpc('enable_freelancer_profile', { p_payload: { skills } });

			if (error) {
				const n = normaliseSupabaseError(error);
				return fail(n.code, n.message, n.status);
			}

			// The RPC returns jsonb { freelancer_profile_id, created, is_freelancer }.
			const row = (data ?? {}) as { freelancer_profile_id?: string; created?: boolean };
			return ok({
				freelancerProfileId: row.freelancer_profile_id ?? user.id,
				created: !!row.created,
			});
		} catch (err) {
			const n = normaliseUnknownError(err);
			return fail(n.code, n.message, 500);
		}
	}
}
// #endregion
