/**
 * @file session.ts
 * @description Thin endpoint controller handling JSON body parsing, security mapping, and service invocation.
 */

// #region Imports
import { define } from '@utils';
import { SessionBackendService } from '@features/auth/services/SessionBackendService.ts';
// #endregion

// #region Handlers
export const handler = define.handlers({
	async POST(ctx) {
		console.log(
			'[API Route: v1/auth/session] Processing asynchronous session serialization request...',
		);

		try {
			const body = await ctx.req.json();
			const reqUrl = new URL(ctx.req.url);
			const responseHeaders = new Headers({
				'content-type': 'application/json; charset=utf-8',
			});

			const res = await SessionBackendService.establishSession(
				{
					accessToken: body?.accessToken || '',
					refreshToken: body?.refreshToken || '',
				},
				reqUrl,
				responseHeaders,
			);

			if (!res.ok) {
				return new Response(JSON.stringify({ error: res.error, message: res.error.message }), {
					status: res.error.status ?? 400,
					headers: { 'content-type': 'application/json; charset=utf-8' },
				});
			}

			return new Response(JSON.stringify({ ok: true, value: res.data }), {
				status: 200,
				headers: responseHeaders,
			});
		} catch (err) {
			console.error(
				'[API Route: v1/auth/session] Exception caught processing request body pipelines:',
				err,
			);
			return new Response(
				JSON.stringify({
					error: 'invalid_json',
					message: 'Malformed JSON payload sequence provided.',
				}),
				{
					status: 400,
					headers: { 'content-type': 'application/json; charset=utf-8' },
				},
			);
		}
	},
});
// #endregion
