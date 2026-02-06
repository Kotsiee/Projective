import { define } from '@utils';

export const handler = define.handlers({
	async GET(ctx) {
		return new Response(
			JSON.stringify({ error: 'Unimplemented get team' }),
			{
				status: 500,
			},
		);
	},
	async PATCH(ctx) {
		return new Response(
			JSON.stringify({ error: 'Unimplemented update team' }),
			{
				status: 500,
			},
		);
	},
	async DELETE(ctx) {
		return new Response(
			JSON.stringify({ error: 'Unimplemented delete team' }),
			{
				status: 500,
			},
		);
	},
});
