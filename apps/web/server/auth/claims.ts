export type JwtClaims = {
	sub: string;
	exp?: number;
	active_profile_type?: 'freelancer' | 'business';
	active_profile_id?: string;
	active_team_id?: string | null;
} | null;

export function parseJwt(token?: string): JwtClaims {
	if (!token) return null;
	try {
		const [, b64] = token.split('.');
		if (!b64) return null;
		const json = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
		return JSON.parse(json);
	} catch {
		return null;
	}
}

export function isExpired(exp?: number, skewSec = 30) {
	if (!exp) return true;
	return exp <= Math.floor(Date.now() / 1000) + skewSec;
}
