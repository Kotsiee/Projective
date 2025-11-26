import { create } from 'djwt';
import { hashArgon2id, randomTokenString } from '../crypto.ts';
import { getJwtKey } from './jwt.ts'; // <-- new

const ACCESS_TTL_SECONDS = 15 * 60; // 15 minutes
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30; // ~30 days

export type SessionClaims = {
	userId: string;
	activeProfileType: 'freelancer' | 'business' | null;
	activeProfileId: string | null;
	activeTeamId: string | null;
};

export async function mintAccessToken(claims: SessionClaims) {
	const exp = Math.floor(Date.now() / 1000) + ACCESS_TTL_SECONDS;

	const payload = {
		sub: claims.userId,
		active_profile_type: claims.activeProfileType,
		active_profile_id: claims.activeProfileId,
		active_team_id: claims.activeTeamId,
		exp,
	};

	const key = await getJwtKey();

	const token = await create(
		{ alg: 'HS256', typ: 'JWT' },
		payload,
		key,
	);

	return { token, exp };
}

/**
 * Creates a new refresh token (opaque random string),
 * hashes it, and returns both the plaintext token (for cookie)
 * and the hash (for DB storage).
 */
export async function mintRefreshToken() {
	const plaintext = randomTokenString(32);
	const hash = await hashArgon2id(plaintext);
	const exp = Math.floor(Date.now() / 1000) + REFRESH_TTL_SECONDS;
	return { plaintext, hash, exp };
}

export function buildAccessCookie(accessToken: string, maxAgeSeconds = ACCESS_TTL_SECONDS) {
	return [
		'access_token=',
		accessToken,
		'; HttpOnly',
		'; Secure',
		'; SameSite=Lax',
		`; Max-Age=${maxAgeSeconds}`,
		'; Path=/',
	].join('');
}

export function buildRefreshCookie(refreshToken: string) {
	return [
		'refresh_token=',
		refreshToken,
		'; HttpOnly',
		'; Secure',
		'; SameSite=Lax',
		'; Path=/api/v1/auth',
	].join('');
}
