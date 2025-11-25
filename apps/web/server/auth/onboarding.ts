// server/auth/onboarding.ts
import { OnboardingRequest } from '@contracts/auth/onboading.ts';
import { Deps, SignInData } from './_shared/types.ts';
import { fail, ok, Result } from '../core/http/result.ts';
import { normaliseSupabaseError, normaliseUnknownError } from '../core/errors/normalise.ts';
import { supabaseClient } from '../core/clients/supabase.ts';

export async function onboarding(
	{
		firstName,
		lastName,
		username,
		type,
	}: OnboardingRequest,
	deps: Deps = {},
): Promise<Result<any>> {
	if (!firstName || !username) {
		return fail('bad_request', 'First name and username are required.', 400);
	}

	try {
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		// Make sure we actually have an authenticated user
		const { data, error: authError } = await supabase.auth.getUser();
		if (authError || !data.user) {
			return fail('unauthorized', 'You must be signed in to onboard.', 401);
		}

		const userId = data.user.id;

		// Insert public profile
		const { error: userError } = await supabase
			.schema('org')
			.from('users_public')
			.insert({
				user_id: userId,
				first_name: firstName,
				last_name: lastName,
				username,
			});

		if (userError) {
			const n = normaliseSupabaseError(userError);
			return fail(n.code, n.message, n.status);
		}

		// Optionally create freelancer profile
		if (type === 'freelancer') {
			const { error: freelancerError } = await supabase
				.schema('org')
				.from('freelancer_profiles')
				.insert({
					user_id: userId, // <- use the same authenticated user
				});

			if (freelancerError) {
				const n = normaliseSupabaseError(freelancerError);
				return fail(n.code, n.message, n.status);
			}
		}

		return ok<any>({}); // TODO: return whatever you actually need
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}

export async function isOnboarded(req: Request) {
	const supabase = await supabaseClient(req);
	const { data, error } = await supabase.auth.getUser();

	if (error || !data.user.id) {
		return false;
	}

	const { data: userData } = await supabase.schema('org').from('users_public').select('user_id').eq(
		'user_id',
		data.user.id,
	);

	if (userData) {
		return true;
	}

	return false;
}
