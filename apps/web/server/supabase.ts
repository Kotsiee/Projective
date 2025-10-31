import { createClient } from 'supabaseClient';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

export const supabaseAdmin = createClient(
	SUPABASE_URL,
	SERVICE_KEY,
	{
		auth: {
			persistSession: false,
		},
	},
);
