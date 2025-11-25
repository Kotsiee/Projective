import type { AuthResponse, AuthTokenResponsePassword, SupabaseClient } from 'supabaseClient';

export type SignUpData = AuthResponse['data'];

export type SignInData = AuthTokenResponsePassword['data'];

export type Deps = {
	getClient?: () => Promise<SupabaseClient>;
};

export type RegisterOptions = {
	emailRedirectTo?: string;
	captchaToken?: string;
	metadata?: Record<string, unknown>;
};
