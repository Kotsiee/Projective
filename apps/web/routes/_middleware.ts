import { define } from '@utils';
import { maybeRefreshFromRequest } from '@server/auth/refresh.ts';
import { isOnboarded } from '@server/auth/onboarding.ts';
import {
	clearAuthCookies,
	getAuthCookies,
	rateLimitByIP,
	setAuthCookies,
	verifyCsrf,
} from '@projective/backend';

function jwtExp(token: string): number | null {
	try {
		const payload = token.split('.')[1];
		if (!payload) return null;
		const json = JSON.parse(
			new TextDecoder().decode(
				Uint8Array.from(
					atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
					(c) => c.charCodeAt(0),
				),
			),
		);
		return typeof json.exp === 'number' ? json.exp : null;
	} catch {
		return null;
	}
}

// Assets to exclude from rate limiting and auth checks
const EXCLUDED_PATHS = [
	'/_fresh',
	'/static',
	'/favicon.ico',
	'/logo.svg',
	'/styles.css',
	'/components',
];

export const handler = define.middleware(async (ctx) => {
	const req = ctx.req;
	const url = new URL(req.url);
	const path = url.pathname;

	// 1. Skip expensive logic for static assets
	if (
		EXCLUDED_PATHS.some((p) => path.startsWith(p)) ||
		path.match(/\.(css|js|png|jpg|jpeg|svg|ico|woff2?)$/)
	) {
		return await ctx.next();
	}

	// 2. Rate Limiting
	const ip = (req.headers.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0];
	const { allowed } = rateLimitByIP(ip);

	if (!allowed) {
		console.warn(`[RateLimit] Blocked ${ip} on ${path}`);
		return new Response('Too Many Requests', { status: 429 });
	}

	// 3. Auth & Refresh Logic
	const { accessToken, refreshToken } = getAuthCookies(req);
	const now = Math.floor(Date.now() / 1000);
	const skew = 60;

	ctx.state.isAuthenticated = !!accessToken;
	ctx.state.refreshedTokens = null;
	ctx.state.clearAuth = false;

	// Decide if we should refresh
	let shouldRefresh = false;
	if (refreshToken) {
		if (!accessToken) shouldRefresh = true;
		else {
			const exp = jwtExp(accessToken);
			if (!exp || exp <= now + skew) shouldRefresh = true;
		}
	}

	if (shouldRefresh) {
		const refreshed = await maybeRefreshFromRequest(req);
		if (refreshed) {
			ctx.state.refreshedTokens = refreshed;
			ctx.state.isAuthenticated = true; // We are now technically authenticated
		} else {
			ctx.state.clearAuth = true;
			ctx.state.isAuthenticated = false;
		}
	}

	// 4. CSRF Check (State changing methods)
	const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method.toUpperCase());
	const hasBearer = !!req.headers.get('authorization')?.startsWith('Bearer ');

	// Skip CSRF for specific endpoints if needed (like webhooks), handled separately usually
	if (isStateChanging && !hasBearer && ctx.state.isAuthenticated) {
		if (!verifyCsrf(req)) {
			return new Response(
				JSON.stringify({ error: { code: 'csrf_failed', message: 'CSRF check failed' } }),
				{ status: 403, headers: { 'content-type': 'application/json; charset=utf-8' } },
			);
		}
	}

	// 5. Populate Onboarding State (Only if authenticated)
	// We do this here so it's available for specific route middlewares
	ctx.state.isOnboarded = false;
	if (ctx.state.isAuthenticated) {
		// Note: Optimally, this should be in the JWT claims to avoid a DB hit on every request.
		// For MVP, we check DB.
		ctx.state.isOnboarded = await isOnboarded(ctx.req);
	}

	// 6. Handle /verify Logic (Pass-through)
	if (path.startsWith('/verify')) {
		const res = await ctx.next();
		// Apply cookie updates to response
		if (ctx.state.refreshedTokens) {
			const { access, refresh } = ctx.state.refreshedTokens;
			setAuthCookies(res.headers, {
				accessToken: access,
				refreshToken: refresh,
				requestUrl: url,
			});
		}
		if (ctx.state.clearAuth) clearAuthCookies(res.headers, url);
		return res;
	}

	// 7. Proceed
	const res = await ctx.next();

	// 8. Apply Cookie Updates (Refresh or Clear)
	if (ctx.state.refreshedTokens) {
		const { access, refresh } = ctx.state.refreshedTokens;
		setAuthCookies(res.headers, {
			accessToken: access,
			refreshToken: refresh,
			requestUrl: url,
		});
	}
	if (ctx.state.clearAuth) clearAuthCookies(res.headers, url);

	return res;
});
