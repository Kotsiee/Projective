/**
 * @file resend.ts
 * @description API Route Controller for resending verification emails.
 */

// #region Imports
import { define } from '@utils';
import { ResendBackendService } from '@features/auth/services/ResendBackendService.ts';
// #endregion

// #region Handlers
export const handler = define.handlers({
	async POST(ctx) {
		const { email } = await ctx.req.json();
		const res = await ResendBackendService.resendVerificationEmail(
			(email ?? '').trim().toLowerCase(),
		);

		if (!res.ok) {
			return new Response(JSON.stringify({ error: res.error }), {
				status: res.error.status ?? 400,
				headers: { 'content-type': 'application/json; charset=utf-8' },
			});
		}

		return new Response(JSON.stringify({ ok: true }), {
			status: 200,
			headers: { 'content-type': 'application/json; charset=utf-8' },
		});
	},
});
// #endregion
