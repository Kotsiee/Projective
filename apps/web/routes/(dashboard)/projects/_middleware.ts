import { define } from '@utils';

export const handler = define.middleware(async (ctx) => {
	if (ctx.params.projectid) {
		ctx.state.slugs = {
			projectId: ctx.params.projectid,
		};
	}

	if (ctx.params.stageid) {
		ctx.state.slugs = {
			...ctx.state.slugs,
			stageId: ctx.params.stageid,
		};
	}

	const res = await ctx.next();
	return res;
});
