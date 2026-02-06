import { define } from '@utils';

export const handler = define.handlers({
	async GET(ctx) {
		return new Response(
			JSON.stringify({ error: 'Unimplemented list team members' }),
			{
				status: 500,
			},
		);
	},
});
