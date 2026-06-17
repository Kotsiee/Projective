import { define } from '@utils';

export const handler = define.middleware(async (ctx) => {
	const url = new URL(ctx.req.url);

	// if (!url.pathname.includes('/logout')) {
	// 	return new Response(null, {
	// 		status: 302,
	// 		headers: {
	// 			Location: '/dashboard',
	// 		},
	// 	});
	// }

	if (ctx.state.isAuthenticated) {
		if (url.pathname === '/join') {
			return await ctx.next();
		}

		return new Response(null, {
			status: 302,
			headers: {
				Location: '/join',
			},
		});
	}

	const res = await ctx.next();
	return res;
});
