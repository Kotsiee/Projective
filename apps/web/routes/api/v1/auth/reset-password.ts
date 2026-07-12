/**
 * @file reset-password.ts
 * @description Updates the current user's password. Authorised by the recovery
 * session established via /api/v1/auth/confirm (CSRF-guarded by middleware).
 */

// #region Imports
import { define } from '@utils';
import { PasswordResetBackendService } from '@features/auth/services/PasswordResetBackendService.ts';
// #endregion

// #region Handlers
export const handler = define.handlers({
	async POST(ctx) {
		let password = '';
		try {
			const body = await ctx.req.json();
			password = body?.password ?? '';
		} catch {
			return new Response(
				JSON.stringify({ error: { code: 'bad_request', message: 'Invalid request body.' } }),
				{ status: 400, headers: { 'content-type': 'application/json; charset=utf-8' } },
			);
		}

		const res = await PasswordResetBackendService.updatePassword(password, ctx.req);

		if (!res.ok) {
			return new Response(JSON.stringify({ error: res.error, message: res.error.message }), {
				status: res.error.status ?? 400,
				headers: { 'content-type': 'application/json; charset=utf-8' },
			});
		}

		return new Response(JSON.stringify({ ok: true, redirectTo: '/home' }), {
			status: 200,
			headers: { 'content-type': 'application/json; charset=utf-8' },
		});
	},
});
// #endregion
