import { define } from '@utils';

export const handler = define.middleware(async (ctx) => {
	const url = new URL(ctx.req.url);

	// 1. If user is fully onboarded, kick them out of auth pages (login/register) to dashboard
	// EXCEPT if they are explicitly trying to logout or switch profiles (future proofing)
	if (ctx.state.isOnboarded && !url.pathname.includes('/logout')) {
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/dashboard',
			},
		});
	}

	// 2. If user is authenticated BUT NOT onboarded
	if (ctx.state.isAuthenticated && !ctx.state.isOnboarded) {
		// If they are already ON the onboarding page, let them pass.
		// Otherwise, force them to /onboarding
		if (url.pathname === '/onboarding') {
			return await ctx.next();
		}

		return new Response(null, {
			status: 302,
			headers: {
				Location: '/onboarding',
			},
		});
	}

	const res = await ctx.next();
	return res;
});
