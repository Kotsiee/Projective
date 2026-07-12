/**
 * @file create-account.ts
 * @description API Route Controller for unified account creation and onboarding.
 */

// #region Imports
import { define } from '@utils';
import { setCookie } from '@std/http/cookie';
import { safeReturnTo } from '@projective/backend';
import { CreateAccountBackendService } from '@features/auth/services/CreateAccountServiceBackend.ts';
// #endregion

// #region Handlers
export const handler = define.handlers({
	async POST(ctx) {
		const body = await ctx.req.json();

		const res = await CreateAccountBackendService.createAccount(body);
		const reqUrl = new URL(ctx.req.url);
		const verifyUrl = new URL('/verify', reqUrl).href;

		if (!res.ok) {
			console.error('[API Route: create-account] ❌ Service returned a failure state.');
			const status = res.error.status ?? (res.error.code === 'bad_request' ? 400 : 500);
			return new Response(JSON.stringify({ error: res.error, message: res.error.message }), {
				status,
				headers: { 'content-type': 'application/json; charset=utf-8' },
			});
		}

		const email = res.data?.user?.email ?? (typeof body?.email === 'string' ? body.email : '');

		const headers = new Headers({
			location: verifyUrl,
		});

		// Persist the captured return target so the /verify poll endpoint and (in the
		// same-browser flow) confirm.ts can send the user back where they started.
		const returnTo = safeReturnTo(typeof body?.redirectTo === 'string' ? body.redirectTo : null);
		if (returnTo !== '/home') {
			setCookie(headers, {
				name: 'pjv_return_to',
				value: encodeURIComponent(returnTo),
				httpOnly: true,
				sameSite: 'Lax',
				secure: reqUrl.protocol === 'https:',
				path: '/',
				maxAge: 10 * 60, // 10 minutes — matches verify_email
			});
		}

		if (email) {
			setCookie(headers, {
				name: 'verify_email',
				value: encodeURIComponent(email),
				httpOnly: true,
				sameSite: 'Lax',
				secure: reqUrl.protocol === 'https:',
				path: '/', // Ensure path is root so /verify can read it
				maxAge: 10 * 60, // 10 minutes
			});

			return new Response(JSON.stringify({ ok: true, redirectTo: verifyUrl }), {
				status: 200,
				headers,
			});
		}

		return new Response(null, { status: 303, headers });
	},
});
// #endregion
