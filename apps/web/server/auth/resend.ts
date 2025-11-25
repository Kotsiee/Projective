import { supabaseClient } from '../core/clients/supabase.ts';
import { normaliseSupabaseError, normaliseUnknownError } from '../core/errors/normalise.ts';
import { fail, ok, Result } from '../core/http/result.ts';

export async function resendVerificationEmail(email: string): Promise<Result<{ sent: true }>> {
	if (!email) return fail('bad_request', 'Email is required.', 400);
	try {
		const emailRedirectTo = `${Deno.env.get('URL')}/verify`;
		const supabase = await supabaseClient();
		const { error } = await supabase.auth.resend({
			type: 'signup',
			email,
			options: {
				emailRedirectTo,
			},
		});
		if (error) {
			const n = normaliseSupabaseError(error);
			return fail(n.code, n.message, n.status);
		}
		return ok({ sent: true });
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}
