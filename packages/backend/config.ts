import { loadSync } from '@std/dotenv';

loadSync({ export: true });

const mode = Deno.env.get('MODE') ??
	Deno.env.get('NODE_ENV') ??
	Deno.env.get('VITE_MODE') ??
	'development';

loadSync({ envPath: `.env.${mode}`, export: true });

function requireEnv(name: string): string {
	const value = Deno.env.get(name);
	if (!value) {
		console.error(`Missing required env var: ${name}`);
		if (Deno.env.get('DENO_DEPLOYMENT_ID')) return '';
		throw new Error(`Missing env: ${name}`);
	}
	return value;
}

export const Config = {
	SUPABASE_URL: requireEnv('SUPABASE_URL'),
	SUPABASE_ANON_KEY: requireEnv('SUPABASE_ANON_KEY'),
	SUPABASE_SERVICE_ROLE_KEY: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
	JWT_SECRET: requireEnv('JWT_SECRET'),
	APP_ENV: Deno.env.get('APP_ENV') ?? 'development',
	BASE_URL: Deno.env.get('URL'),
};
