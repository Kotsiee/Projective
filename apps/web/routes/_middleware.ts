// middleware.ts

/**
 * @file _middleware.ts
 * @description Global Fresh middleware interceptor. Acts as a thin controller delegating to AuthMiddlewareService.
 */

// #region Imports
import { define } from '@utils';
import { AuthMiddlewareService } from '@features/auth/services/AuthMiddlewareService.ts';
// #endregion

// #region Handlers
export const handler = define.middleware(async (ctx) => {
	const req = ctx.req;
	const url = new URL(req.url);

	// 1. Static Asset Bypass
	if (AuthMiddlewareService.shouldExclude(url.pathname)) {
		return await ctx.next();
	}

	// 2. Rate Limiting Guard
	const { allowed, ip } = AuthMiddlewareService.checkRateLimit(req);
	if (!allowed) {
		console.warn(`[RateLimit] Blocked ${ip} on ${url.pathname}`);
		return new Response('Too Many Requests', { status: 429 });
	}

	// 3. Process Authentication & Tokens
	const authState = await AuthMiddlewareService.processAuthState(req);

	// Expose current auth reality to the rest of the Fresh routing lifecycle
	ctx.state.isAuthenticated = authState.isAuthenticated;
	ctx.state.refreshedTokens = authState.refreshedTokens;
	ctx.state.clearAuth = authState.clearAuth;

	// 4. CSRF Validation
	if (!AuthMiddlewareService.validateCsrf(req, authState.isAuthenticated)) {
		return new Response(
			JSON.stringify({
				error: {
					code: 'csrf_failed',
					message: 'CSRF check failed',
				},
			}),
			{
				status: 403,
				headers: { 'content-type': 'application/json; charset=utf-8' },
			},
		);
	}

	// 5. Execute Downstream Routes and Islands
	const res = await ctx.next();

	// 6. Apply Secure Cookies to the outbound response
	AuthMiddlewareService.applyAuthCookies(res.headers, url, authState);

	return res;
});
// #endregion
