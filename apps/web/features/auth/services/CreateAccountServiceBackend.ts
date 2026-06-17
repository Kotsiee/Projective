/**
 * @file CreateAccountServiceBackend.ts
 * @description Backend service layer for handling unified account creation and onboarding database interactions.
 */

// #region Imports
import {
	Config,
	Deps,
	fail,
	isLikelyEmail,
	normaliseSupabaseError,
	normaliseUnknownError,
	ok,
	RegisterOptions,
	Result,
	SignUpData,
	supabaseClient,
} from '@projective/backend';
import { CreateAccountRequest } from '../contracts/create-account.ts';
// #endregion

// #region Service Definition
export class CreateAccountBackendService {
	static async createAccount(
		data: CreateAccountRequest,
		deps: Deps = {},
		opts: RegisterOptions = {},
	): Promise<Result<SignUpData>> {
		const email = (data.email ?? '').trim().toLowerCase();
		const password = (data.password ?? '').trim();

		if (!email || !password) {
			return fail('bad_request', 'Email and password are required.', 400);
		}
		if (!isLikelyEmail(email)) {
			return fail('bad_request', 'Invalid email format.', 400);
		}
		if (password.length < 8) {
			return fail('bad_request', 'Password must be at least 8 characters.', 400);
		}
		if (!data.firstName || !data.username || !data.dob) {
			return fail('bad_request', 'First name, Date of Birth, and username are required.', 400);
		}

		try {
			const emailRedirectTo = `${Config.BASE_URL}/api/v1/auth/callback`;
			const getClient = deps.getClient ?? supabaseClient;
			const supabase = await getClient();

			// Database Sync: Supabase Trigger will automatically populate users_public and freelancer_profiles
			// using this metadata as soon as the Auth insert finalises in Gotrue.
			const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
				email: email,
				password: password,
				options: {
					data: {
						...opts.metadata,
						first_name: data.firstName,
						last_name: data.lastName,
						username: data.username,
						dob: data.dob,
						objective: data.objective,
						skills: data.skills || [],
						interests: data.interests || [],
					},
					emailRedirectTo,
					captchaToken: opts.captchaToken,
				},
			});

			if (signUpError) {
				console.error('[CreateAccountBackendService] ❌ Supabase Auth Error:', signUpError);
				const n = normaliseSupabaseError(signUpError);
				return fail(n.code, n.message, n.status);
			}

			return ok(signUpData);
		} catch (err) {
			console.error('[CreateAccountBackendService] 💥 Unexpected Error:', err);
			const n = normaliseUnknownError(err);
			return fail(n.code, n.message, 500);
		}
	}
}
// #endregion
