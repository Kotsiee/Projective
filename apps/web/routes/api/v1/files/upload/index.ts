import { define } from '@utils';
import { FileService } from '@server/services/files.ts';
import { supabaseClient } from '@server/core/clients/supabase.ts';

export const handler = define.handlers({
	async POST(ctx) {
		try {
			const body = await ctx.req.json();
			const { filename, mimeType, sizeBytes, context } = body;

			const client = await supabaseClient(ctx.req);
			const user = (await client.auth.getUser()).data.user;

			if (!user) {
				return new Response('Unauthorized', { status: 401 });
			}

			// Call the service to generate signed URL
			const result = await FileService.initUpload(
				user.id,
				filename,
				mimeType,
				sizeBytes,
				context,
			);

			return new Response(JSON.stringify(result), {
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err: any) {
			console.error('File Init Error:', err);
			return new Response(JSON.stringify({ error: err.message }), { status: 400 });
		}
	},
});
