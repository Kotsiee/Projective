import { define } from '@utils';

export const handler = define.handlers({
	async GET(ctx) {
		return new Response(
			JSON.stringify({ error: 'Unimplemented get member' }),
			{
				status: 500,
			},
		);
	},
	async PATCH(ctx) {
		return new Response(
			JSON.stringify({ error: 'Unimplemented update member / change role' }),
			{
				status: 500,
			},
		);
	},
	async DELETE(ctx) {
		return new Response(
			JSON.stringify({ error: 'Unimplemented delete member' }),
			{
				status: 500,
			},
		);
	},
});
