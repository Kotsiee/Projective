import { define } from '@utils';
import { setCookie } from '@std/http/cookie';

export const handler = define.handlers({
	async GET(ctx) {
		const headers = new Headers({ 'content-type': 'application/json; charset=utf-8' });
		setCookie(headers, {
			name: 'verify_email',
			value: 'email@email.com',
			path: '/verify',
			maxAge: 10000,
			httpOnly: true,
			sameSite: 'Lax',
			secure: true,
		});

		return new Response(null, {
			headers,
		});
	},
});
