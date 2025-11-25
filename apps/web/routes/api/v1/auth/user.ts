import { define } from '@utils';
import { supabaseClient } from '@server/core/clients/supabase.ts';

export const handler = define.handlers({
	async GET(ctx) {
		const sb = await supabaseClient(ctx.req);
		const { data, error } = await sb.auth.getUser();

		if (!error && data.user && data.user.user_metadata) {
			const user = data.user.user_metadata;
			const name = user.name.split(' ');
			const firstName = name[0];
			const lastName = name[name.length - 1];
			const username = user.user_name;

			return new Response(JSON.stringify({ firstName, lastName, username }), {
				status: 200,
			});
		}

		return new Response('', { status: 204 });
	},
});
