import { define } from '@utils';

/**
 * Auth-group guard. Keeps already-authenticated users out of the credential pages
 * (login / forgot-password / reset) by sending them to the dashboard, while still
 * allowing the pages an authenticated user legitimately needs:
 *   - /join   → SSO users who still have to finish onboarding
 *   - /verify → users confirming their email address
 *
 * The dashboard's own middleware handles the verify-pending vs. onboarded routing
 * from there, so this only needs the coarse allow-list.
 *   - /reset → the recovery session is what authorises the password update, so an
 *     "authenticated" user must still be able to reach it.
 */
const ALLOWED_WHEN_AUTHED = ['/join', '/verify', '/reset'];

export const handler = define.middleware(async (ctx) => {
	const url = new URL(ctx.req.url);

	if (
		ctx.state.isAuthenticated &&
		!ALLOWED_WHEN_AUTHED.some((p) => url.pathname.startsWith(p))
	) {
		return new Response(null, {
			status: 302,
			headers: { Location: '/dashboard' },
		});
	}

	return await ctx.next();
});
