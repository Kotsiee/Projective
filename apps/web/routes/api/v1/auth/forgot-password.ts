/**
 * @file forgot-password.ts
 * @description Requests a password-recovery email. Always returns success to
 * avoid leaking whether an account exists.
 */

// #region Imports
import { define } from '@utils';
import { PasswordResetBackendService } from '@features/auth/services/PasswordResetBackendService.ts';
// #endregion

// #region Handlers
export const handler = define.handlers({
	async POST(ctx) {
		let email = '';
		try {
			const body = await ctx.req.json();
			email = body?.email ?? '';
		} catch {
			// Malformed body → treat as empty; still respond success.
		}

		await PasswordResetBackendService.requestReset(email);

		return new Response(JSON.stringify({ ok: true }), {
			status: 200,
			headers: { 'content-type': 'application/json; charset=utf-8' },
		});
	},
});
// #endregion
