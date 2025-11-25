import { RegisterWithEmailRequest } from '@contracts/auth/register.ts';
import { supabaseClient } from '../../core/clients/supabase.ts';
import { fail, ok, Result } from '../../core/http/result.ts';
import { isLikelyEmail } from '../../core/validation/email.ts';
import { Deps, RegisterOptions, SignUpData } from '../_shared/types.ts';
import { normaliseSupabaseError, normaliseUnknownError } from '../../core/errors/normalise.ts';

export async function registerWithEmail(
	{ email, password }: RegisterWithEmailRequest,
	deps: Deps = {},
	opts: RegisterOptions = {},
): Promise<Result<SignUpData>> {
	const e = (email ?? '').trim().toLowerCase();
	const p = (password ?? '').trim();

	if (!e || !p) return fail('bad_request', 'Email and password are required.', 400);
	if (!isLikelyEmail(e)) return fail('bad_request', 'Invalid email format.', 400);
	if (p.length < 8) return fail('bad_request', 'Password must be at least 8 characters.', 400);

	try {
		const emailRedirectTo = `${Deno.env.get('URL')}/verify`;
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		const { data, error } = await supabase.auth.signUp({
			email: e,
			password: p,
			options: {
				data: opts.metadata,
				emailRedirectTo,
				captchaToken: opts.captchaToken,
			},
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
