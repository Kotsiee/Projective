import { createClient, type SupabaseClient, type SupabaseClientOptions } from 'supabaseClient';

import { getAuthCookies } from '../../auth/cookies.ts';

let anonClient: SupabaseClient /*<Database>*/ | null = null;

function getEnv() {
	const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
	const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
	if (!SUPABASE_URL || !ANON_KEY) throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
	return { SUPABASE_URL, ANON_KEY };
}

/**
 * Returns a Supabase client:
 * - If `req` contains an access token cookie, a **new per-request client** with `Authorization: Bearer <token>`.
 * - Otherwise, a **shared anon client** (cached).
 *
 * No session persistence; SSR-safe.
 */
export async function supabaseClient(req?: Request): Promise<SupabaseClient> {
	const { SUPABASE_URL, ANON_KEY } = getEnv();

	const baseOptions: SupabaseClientOptions<'public'> = {
		auth: {
			persistSession: false,
			detectSessionInUrl: false,
		},
	};

	if (req) {
		const { accessToken } = getAuthCookies(req);
		if (accessToken) {
			return createClient(SUPABASE_URL, ANON_KEY, {
				...baseOptions,
				global: {
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			});
		}
	}

	if (!anonClient) {
		anonClient = createClient(SUPABASE_URL, ANON_KEY, baseOptions);
	}
	return anonClient;
}
