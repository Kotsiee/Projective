import { define } from '@utils';

export const handler = define.middleware(async (ctx) => {
	if (!ctx.state.isAuthenticated) {
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/login',
			},
		});
	}

	if (!ctx.state.isOnboarded) {
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
