import {
	Deps,
	fail,
	isLikelyEmail,
	normaliseSupabaseError,
	normaliseUnknownError,
	ok,
	Result,
	SignInData,
	supabaseClient,
} from '@projective/backend';
import { LoginWithEmailRequest } from '../../contracts/login.ts';

export async function loginWithEmail(
	{ email, password }: LoginWithEmailRequest,
	deps: Deps = {},
): Promise<Result<SignInData>> {
	const e = (email ?? '').trim().toLowerCase();
	const p = (password ?? '').trim();

	if (!e || !p) {
		return fail('bad_request', 'Email and password are required.', 400);
	}
	if (!isLikelyEmail(e)) {
		return fail('bad_request', 'Invalid email format.', 400);
	}

	try {
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		const { data, error } = await supabase.auth.signInWithPassword({
			email: e,
			password: p,
		});

		if (error) {
			const n = normaliseSupabaseError(error);
			return fail(n.code, n.message, n.status);
		}

		return ok(data);
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}
