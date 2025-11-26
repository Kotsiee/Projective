// packages/server-utils/crypto.ts

// Generate URL-safe random string (base64-ish) for refresh tokens
export function randomTokenString(byteLength = 32): string {
	const raw = crypto.getRandomValues(new Uint8Array(byteLength));
	// convert Uint8Array -> binary string -> base64
	const bin = String.fromCharCode(...raw);
	return btoa(bin); // you can further make it URL-safe if you want
}

// TODO: replace with real Argon2id
export async function hashArgon2id(value: string): Promise<string> {
	// WARNING: placeholder.
	// You MUST replace this with a secure Argon2id hash implementation
	// before production. We're returning a SHA-256 for now just so dev works.
	const data = new TextEncoder().encode(value);
	const digest = await crypto.subtle.digest('SHA-256', data);
	const bytes = new Uint8Array(digest);
	return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}
