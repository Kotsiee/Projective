import { Deps, SignInData } from '../../auth/_shared/types.ts';
import {
	fail,
	normaliseSupabaseError,
	normaliseUnknownError,
	ok,
	Result,
	supabaseClient,
} from '@projective/backend';
import { isLikelyEmail } from '../../core/validation/email.ts';

export async function loginWithEmail(email: string, deps: Deps = {}): Promise<any> {
	const e = (email ?? '').trim().toLowerCase();

	try {
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		const { data, error } = await supabase.auth.get({ email: e, password: p });

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
