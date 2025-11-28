import { define } from '@utils';
import { supabaseClient } from '@server/core/clients/supabase.ts';

export const handler = define.handlers({
	async GET(ctx) {
		const sb = await supabaseClient(ctx.req);
		const { data, error } = await sb.auth.getUser();

		if (error) {
			console.error('[API] /auth/user - getUser error:', error.message);
		} else if (!data.user) {
			console.warn('[API] /auth/user - No user found in session');
		}

		if (!error && data.user && data.user.user_metadata) {
			const user = data.user.user_metadata;

			// Handle cases where name might be missing
			const fullName = user.name || '';
			const nameParts = fullName.split(' ');
			const firstName = nameParts[0] || '';
			const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
			const username = user.user_name || '';

			return new Response(JSON.stringify({ firstName, lastName, username }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// 204 Must have a null body
		return new Response(null, { status: 204 });
	},
});
