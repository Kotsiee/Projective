/**
 * @file _middleware.ts
 * @description Dashboard middleware interceptor. Guards the dashboard layout against unauthenticated access and routes pending verifications.
 */

// #region Imports
import { define } from '@utils';
import { getCookies } from '@std/http/cookie';
// #endregion

// #region Handlers
export const handler = define.middleware(async (ctx) => {
	if (!ctx.state.isAuthenticated) {
		const cookies = getCookies(ctx.req.headers);
		const hasVerifyCookie = !!cookies['verify_email'];

		return new Response(null, {
			status: 302,
			headers: {
				Location: hasVerifyCookie ? '/verify' : '/login',
			},
		});
	}

	return await ctx.next();
});
// #endregion
