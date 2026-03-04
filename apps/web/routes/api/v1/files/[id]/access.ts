import { define } from '@utils';
import { supabaseClient } from '@projective/backend';
import { createClient } from 'supabaseClient';
import { Config } from '@projective/backend';

export const handler = define.handlers({
	async GET(ctx) {
		const { id } = ctx.params;
		const url = new URL(ctx.req.url);
		const forceDownload = url.searchParams.get('download') === 'true';

		const supabase = await supabaseClient(ctx.req);

		const { data: file, error } = await supabase
			.schema('files')
			.from('items')
			.select('bucket_id, storage_path, status, display_name')
			.eq('id', id)
			.single();

		if (error || !file) {
			return new Response('File not found or access denied', {
				status: 404,
			});
		}

		if (file.status === 'infected') {
			return new Response('File is infected and cannot be downloaded.', {
				status: 403,
			});
		}

		if (file.status !== 'clean') {
			return new Response(
				'File is currently being scanned. Please try again later.',
				{ status: 423 },
			);
		}

		const adminSupabase = createClient(
			Config.SUPABASE_URL,
			Config.SUPABASE_SERVICE_ROLE_KEY,
			{ auth: { persistSession: false } },
		);

		console.log('DEBUG AUTH:', {
			urlExists: Config.SUPABASE_URL,
			keyLength: Config.SUPABASE_SERVICE_ROLE_KEY?.length,
			keyStart: Config.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 5),
		});

		const { data: signed, error: signError } = await adminSupabase
			.storage
			.from(file.bucket_id)
			.createSignedUrl(file.storage_path, 60, {
				download: forceDownload ? file.display_name : false,
			});

		if (signError || !signed) {
			console.error('Failed to sign URL:', signError);
			return new Response('Unable to generate access link', {
				status: 500,
			});
		}

		return Response.redirect(signed.signedUrl);
	},
});
