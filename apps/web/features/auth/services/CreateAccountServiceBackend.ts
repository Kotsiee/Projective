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
	safeReturnTo,
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
			// Redirect for the confirmation email. Gotrue exposes this to the template
			// as {{ .RedirectTo }}; confirmation.html appends &token_hash=…&type=email
			// to it. We carry the captured return target here as ?next=… so the link
			// works cross-browser; the same-browser flow additionally recovers it from
			// the pjv_return_to cookie in confirm.ts. safeReturnTo blocks open redirects.
			const returnTo = safeReturnTo(data.redirectTo);
			const emailRedirectTo = `${Config.BASE_URL}/api/v1/auth/confirm?next=${
				encodeURIComponent(returnTo)
			}`;
			const getClient = deps.getClient ?? supabaseClient;
			const supabase = await getClient();

			// Database Sync: the on_auth_user_created trigger (handle_new_user) consumes this
			// metadata as soon as the Auth insert finalises in Gotrue. In one transaction it
			// populates users_public + freelancer_profiles, initialises security.session_context
			// with the active profile (US-001 AC4), and writes the 'user.onboarded' entry to
			// security.audit_logs (US-001 AC6). audit_logs is definer-only, so those writes must
			// stay in the trigger — not here.
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
