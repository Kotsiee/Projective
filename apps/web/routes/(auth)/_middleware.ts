import { define } from '@utils';

export const handler = define.middleware(async (ctx) => {
	const url = new URL(ctx.req.url);

	if (ctx.state.isOnboarded && !url.pathname.includes('/logout')) {
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/dashboard',
			},
		});
	}

	if (ctx.state.isAuthenticated && !ctx.state.isOnboarded) {
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
