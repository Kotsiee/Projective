// apps/web/routes/_middleware.ts
import { define } from '@utils';
import {
	clearAuthCookies,
	getAuthCookies,
	setAuthCookies,
	verifyCsrf,
} from '@server/auth/cookies.ts';
import { maybeRefreshFromRequest } from '@server/auth/refresh.ts';
import { isOnboarded } from '@server/auth/onboarding.ts';

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

const middleware1 = define.middleware(async (ctx) => {
	const req = ctx.req;
	const url = new URL(req.url);
	const path = url.pathname;

	const { accessToken, refreshToken } = getAuthCookies(req);
	const now = Math.floor(Date.now() / 1000);
	const skew = 60;

	ctx.state.isAuthenticated = !!accessToken;

	if (!ctx.state.isAuthenticated) {
		ctx.state.isOnboarded = false;
	}

	// Decide if we should refresh
	let shouldRefresh = false;
	if (refreshToken) {
		if (!accessToken) shouldRefresh = true;
		else {
			const exp = jwtExp(accessToken);
			if (!exp || exp <= now + skew) shouldRefresh = true;
		}
	}

	// Use ctx.state fields (OK), do NOT reassign ctx.state
	ctx.state.refreshedTokens = null;
	ctx.state.clearAuth = false;

	if (shouldRefresh) {
		const refreshed = await maybeRefreshFromRequest(req);
		if (refreshed) {
			ctx.state.refreshedTokens = refreshed;
		} else {
			ctx.state.clearAuth = true;
		}
	}

	// CSRF for cookie-auth state-changing requests (skip if Authorization: Bearer present)
	const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method.toUpperCase());
	const hasBearer = !!req.headers.get('authorization')?.startsWith('Bearer ');
	if (isStateChanging && !hasBearer && (accessToken || ctx.state.refreshedTokens)) {
		if (!verifyCsrf(req)) {
			return new Response(
				JSON.stringify({ error: { code: 'csrf_failed', message: 'CSRF check failed' } }),
				{ status: 403, headers: { 'content-type': 'application/json; charset=utf-8' } },
			);
		}
	}

	// Always allow /verify
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

const middleware2 = define.middleware(async (ctx) => {
	if (ctx.state.isAuthenticated && !ctx.state.isOnboarded) {
		ctx.state.isOnboarded = await isOnboarded(ctx.req);
	}

	return await ctx.next();
});

export default [middleware1, middleware2];
