import { createClient, type SupabaseClient, type SupabaseClientOptions } from 'supabaseClient';
import { Config, getAuthCookies } from '@projective/backend';

let anonClient: SupabaseClient | null = null;

function getEnv() {
	const SUPABASE_URL = Config.SUPABASE_URL;
	const ANON_KEY = Config.SUPABASE_ANON_KEY;
	if (!SUPABASE_URL || !ANON_KEY) {
		throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
	}
	return { SUPABASE_URL, ANON_KEY };
}

/**
 * Returns a Supabase client.
 *
 * @param req - The incoming request (for auth headers)
 * @param options - Configuration options (e.g. { realtime: true })
 */
// deno-lint-ignore require-await
export async function supabaseClient(
	req?: Request,
): Promise<SupabaseClient> {
	const { SUPABASE_URL, ANON_KEY } = getEnv();

	const baseOptions: SupabaseClientOptions<'public'> = {
		auth: {
			persistSession: false,
			detectSessionInUrl: false,
			autoRefreshToken: false,
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

/**
 * Returns a fresh (never cached) anonymous client.
 *
 * Use this for flows that mutate the client's in-memory session — e.g.
 * `verifyOtp`, which authenticates the client on success. A dedicated instance
 * keeps that session off the shared cached {@link supabaseClient} anon client.
 */
export function freshAnonClient(): SupabaseClient {
	const { SUPABASE_URL, ANON_KEY } = getEnv();
	return createClient(SUPABASE_URL, ANON_KEY, {
		auth: {
			persistSession: false,
			detectSessionInUrl: false,
			autoRefreshToken: false,
		},
	});
}
