import { loadSync } from '@std/dotenv';

loadSync({ export: true });

const mode = Deno.env.get('MODE') ??
	Deno.env.get('NODE_ENV') ??
	Deno.env.get('VITE_MODE') ??
	'development';

loadSync({ envPath: `.env.${mode}`, export: true });
