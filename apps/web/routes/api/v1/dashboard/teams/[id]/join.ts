import { define } from '@utils';

export const handler = define.handlers({
	async POST(ctx) {
		return new Response(
			JSON.stringify({ error: 'Unimplemented accept invitation' }),
			{
				status: 500,
			},
		);
	},
});
