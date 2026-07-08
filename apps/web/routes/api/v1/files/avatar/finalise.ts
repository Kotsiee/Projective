/**
 * @file finalise.ts
 * @description Finalises an avatar upload for the authenticated user: scans the
 * quarantined file, promotes it to the public_assets bucket, and returns its
 * public URL. Runs as the session user so files.items RLS (read + update) passes.
 */

import { define } from '@utils';
import { FileService, supabaseClient } from '@projective/backend';

export const handler = define.handlers({
	async POST(ctx) {
		try {
			const { fileId } = await ctx.req.json();

			const client = await supabaseClient(ctx.req);
			const user = (await client.auth.getUser()).data.user;
			if (!user) {
				return new Response('Unauthorized', { status: 401 });
			}

			const result = await FileService.finalizeUpload(fileId, client);

			return new Response(JSON.stringify(result), {
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err) {
			console.error('Avatar Finalize Error:', err);
			const message = err instanceof Error ? err.message : 'Avatar could not be processed.';
			return new Response(JSON.stringify({ error: message }), { status: 400 });
		}
	},
});
