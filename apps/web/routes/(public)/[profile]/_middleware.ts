import { define } from '@utils';

export const handler = define.middleware(async (ctx) => {
	const url = new URL(ctx.req.url);
	const profileParam = ctx.params.profile;

	if (profileParam && profileParam.startsWith('@')) {
		const cleanProfile = profileParam.slice(1);

		const newPathname = url.pathname.replace(`/${profileParam}`, `/${cleanProfile}`);

		return new Response(null, {
			status: 301,
			headers: {
				Location: `${newPathname}${url.search}`,
			},
		});
	}

	if (!ctx.state.slugs) {
		ctx.state.slugs = {};
	}

	ctx.state.slugs.profile = profileParam;

	const res = await ctx.next();
	return res;
});
