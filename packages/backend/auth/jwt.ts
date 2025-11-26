import { ENV } from "../config.ts";

// packages/server-utils/jwt.ts
let _jwtKey: CryptoKey | null = null;

export async function getJwtKey(): Promise<CryptoKey> {
	if (_jwtKey) return _jwtKey;

	// ENV.JWT_SECRET is a string. We have to turn it into bytes for importKey.
	const raw = new TextEncoder().encode(ENV.JWT_SECRET);

	_jwtKey = await crypto.subtle.importKey(
		"raw",
		raw,
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign", "verify"],
	);

	return _jwtKey;
}
