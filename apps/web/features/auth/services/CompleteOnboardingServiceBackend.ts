/**
 * @file CompleteOnboardingServiceBackend.ts
 * @description Backend service for finishing onboarding as an ALREADY-authenticated
 * user (a first-time OAuth sign-up that landed on /join). It calls the
 * public.complete_onboarding RPC, which provisions the profile, initialises
 * security.session_context (US-001 AC4) and writes the onboarding audit entry
 * (US-001 AC6) in one SECURITY DEFINER transaction.
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
import { CompleteOnboardingRequest } from '../contracts/complete-onboarding.ts';
// #endregion

// #region Service Definition
export class CompleteOnboardingBackendService {
	static async completeOnboarding(
		data: CompleteOnboardingRequest,
		deps: Deps = {},
	): Promise<Result<{ ok: true }>> {
		if (!data.username || !data.dob) {
			return fail('bad_request', 'Username and date of birth are required.', 400);
		}

		try {
			const getClient = deps.getClient ?? supabaseClient;
			const supabase = await getClient();

			const { data: { user }, error: authError } = await supabase.auth.getUser();
			if (authError || !user) {
				return fail('unauthorized', 'You must be signed in to complete onboarding.', 401);
			}

			// The RPC keys off auth.uid(); the JSON payload mirrors the trigger's
			// raw_user_meta_data contract so both paths share provision_user_profile.
			const { error } = await supabase.rpc('complete_onboarding', {
				p_payload: {
					first_name: data.firstName ?? null,
					last_name: data.lastName ?? null,
					username: data.username,
					dob: data.dob,
					objective: data.objective ?? null,
					skills: data.skills ?? [],
					interests: data.interests ?? [],
					avatar_file_id: data.avatarFileId ?? null,
				},
			});

			if (error) {
				const n = normaliseSupabaseError(error);
				return fail(n.code, n.message, n.status);
			}

			return ok({ ok: true });
		} catch (err) {
			const n = normaliseUnknownError(err);
			return fail(n.code, n.message, 500);
		}
	}
}
// #endregion
