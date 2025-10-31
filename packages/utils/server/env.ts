function requireEnv(name: string): string {
	const value = Deno.env.get(name);
	if (!value) {
		throw new Error(`Missing required env var: ${name}`);
	}
	return value;
}

export const ENV = {
	SUPABASE_URL: requireEnv('SUPABASE_URL'),
	SUPABASE_SERVICE_ROLE_KEY: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
	JWT_SECRET: requireEnv('JWT_SECRET'),
};
