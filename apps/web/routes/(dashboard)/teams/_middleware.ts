import { define } from '@utils';

export const handler = define.middleware(async (ctx) => {
	if (ctx.params.teamid) {
		ctx.state.slugs = {
			teamId: ctx.params.teamid,
		};
	}

	const res = await ctx.next();
	return res;
});
