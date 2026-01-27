import { create, getNumericDate } from 'https://deno.land/x/djwt@v2.9.1/mod.ts';

// This is the secret from your .env.development
const jwtSecret = '6b2c7660-1f84-4079-bd47-87b5c366bb037c92d1de-3030-4836-9d07-34da3538f9ce';

const key = await crypto.subtle.importKey(
	'raw',
	new TextEncoder().encode(jwtSecret),
	{ name: 'HMAC', hash: 'SHA-256' },
	false,
	['sign', 'verify'],
);

const payload = {
	role: 'service_role',
	iss: 'supabase',
	iat: getNumericDate(0),
	exp: getNumericDate(60 * 60 * 24 * 365 * 10), // Valid for 10 years
};

const token = await create({ alg: 'HS256', typ: 'JWT' }, payload, key);

console.log('\nCopy this key into your .env file:\n');
console.log(token);
console.log('\n');
