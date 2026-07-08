/**
 * @file init.ts
 * @description Starts an avatar upload for the authenticated user. The
 * `profile_avatar` storage context (and its userId) is injected server-side from
 * the session so a client can never target another user's avatar path.
 */

import { define } from '@utils';
import { FileService, supabaseClient } from '@projective/backend';

export const handler = define.handlers({
	async POST(ctx) {
		try {
			const { filename, mimeType, sizeBytes, blurhash } = await ctx.req.json();

			const client = await supabaseClient(ctx.req);
			const user = (await client.auth.getUser()).data.user;
			if (!user) {
				return new Response('Unauthorized', { status: 401 });
			}

			const result = await FileService.initUpload(
				user.id,
				filename,
				mimeType,
				sizeBytes,
				{ type: 'profile_avatar', userId: user.id },
				blurhash ?? null,
				client,
			);

			return new Response(JSON.stringify(result), {
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err) {
			console.error('Avatar Init Error:', err);
			const message = err instanceof Error ? err.message : 'Avatar upload could not be started.';
			return new Response(JSON.stringify({ error: message }), { status: 400 });
		}
	},
});
