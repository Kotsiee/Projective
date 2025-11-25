import { Deps, SignInData } from '../../auth/_shared/types.ts';
import { supabaseClient } from '../../core/clients/supabase.ts';
import { normaliseSupabaseError, normaliseUnknownError } from '../../core/errors/normalise.ts';
import { fail, ok, Result } from '../../core/http/result.ts';
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
