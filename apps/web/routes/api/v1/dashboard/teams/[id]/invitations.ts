import { define } from '@utils';

export const handler = define.handlers({
	async GET(ctx) {
		return new Response(
			JSON.stringify({ error: 'Unimplemented list invitations sent' }),
			{
				status: 500,
			},
		);
	},
	async POST(ctx) {
		return new Response(
			JSON.stringify({ error: 'Unimplemented send email invite' }),
			{
				status: 500,
			},
		);
	},
});
