import { define } from '@utils';
import { FileService } from '@projective/backend';

export const handler = define.handlers({
	async POST(ctx) {
		try {
			const { fileId } = await ctx.req.json();

			const result = await FileService.finalizeUpload(fileId);

			return new Response(JSON.stringify(result), {
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (err: any) {
			console.error('File Finalize Error:', err);
			return new Response(JSON.stringify({ error: err.message }), { status: 400 });
		}
	},
});
