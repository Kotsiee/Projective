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

	if (
		EXCLUDED_PATHS.some((p) => path.startsWith(p)) ||
		path.match(/\.(css|js|png|jpg|jpeg|svg|ico|woff2?)$/)
	) {
		return await ctx.next();
	}

	const ip = (req.headers.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0];
	const { allowed } = rateLimitByIP(ip);

	if (!allowed) {
		console.warn(`[RateLimit] Blocked ${ip} on ${path}`);
		return new Response('Too Many Requests', { status: 429 });
	}

	const { accessToken, refreshToken } = getAuthCookies(req);
	const now = Math.floor(Date.now() / 1000);
	const skew = 60;

	ctx.state.isAuthenticated = !!accessToken;
	ctx.state.refreshedTokens = null;
	ctx.state.clearAuth = false;

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
			ctx.state.isAuthenticated = true;
		} else {
			ctx.state.clearAuth = true;
			ctx.state.isAuthenticated = false;
		}
	}

	const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method.toUpperCase());
	const hasBearer = !!req.headers.get('authorization')?.startsWith('Bearer ');

	if (isStateChanging && !hasBearer && ctx.state.isAuthenticated) {
		if (!verifyCsrf(req)) {
			return new Response(
				JSON.stringify({ error: { code: 'csrf_failed', message: 'CSRF check failed' } }),
				{ status: 403, headers: { 'content-type': 'application/json; charset=utf-8' } },
			);
		}
	}

	ctx.state.isOnboarded = false;
	if (ctx.state.isAuthenticated) {
		ctx.state.isOnboarded = await isOnboarded(ctx.req);
	}

	if (path.startsWith('/verify')) {
		const res = await ctx.next();

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

	const res = await ctx.next();

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
