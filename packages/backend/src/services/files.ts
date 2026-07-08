import { supabaseClient } from '../core/clients/supabase.ts';
import type { SupabaseClient } from 'supabaseClient';
import { StoragePaths } from '@projective/types';

export class FileService {
	static async initUpload(
		userId: string,
		filename: string,
		mimeType: string,
		sizeBytes: number,
		context: any,
		/**
		 * Optional BlurHash placeholder for image/video uploads, generated
		 * client-side (see apps/web/utils/processors/blurhash.ts). Persisted into
		 * the `metadata` jsonb as `metadata->>'blurhash'` — no dedicated column.
		 */
		blurhash?: string | null,
		/**
		 * Authenticated Supabase client. REQUIRED for the insert to satisfy the
		 * files.items RLS policy (`owner_user_id = auth.uid()`); the anon fallback
		 * cannot insert. Pass `supabaseClient(req)` from a route handler.
		 */
		client?: SupabaseClient,
	) {
		const supabase = client ?? await supabaseClient();

		const { bucket: targetBucket, path: targetPath } = StoragePaths.generate(filename, context);

		const sessionId = crypto.randomUUID();
		const quarantinePath = `${sessionId}/${filename}`;

		const { data: fileRecord, error: dbError } = await supabase
			.schema('files')
			.from('items')
			.insert({
				owner_user_id: userId,
				display_name: filename,
				original_name: filename,
				mime_type: mimeType,
				size_bytes: sizeBytes,

				bucket_id: 'quarantine',
				storage_path: quarantinePath,

				target_bucket: targetBucket,
				target_path: targetPath,
				status: 'pending_upload',
				metadata: blurhash ? { blurhash } : {},
			})
			.select()
			.single();

		if (dbError) throw dbError;

		const { data: signData, error: signError } = await supabase
			.storage
			.from('quarantine')
			.createSignedUploadUrl(quarantinePath);

		if (signError) throw signError;

		return {
			fileId: fileRecord.id,
			uploadUrl: signData.signedUrl,
			path: quarantinePath,
		};
	}

	static async finalizeUpload(fileId: string, client?: SupabaseClient) {
		const supabase = client ?? await supabaseClient();

		const { data: scanResult, error: scanError } = await supabase.functions.invoke('scan-file', {
			body: { fileId },
		});

		if (scanError) {
			console.error('Scan Function Failed:', scanError);
			throw new Error('File processing failed');
		}

		const { data: file, error: dbError } = await supabase
			.schema('files')
			.from('items')
			.select('target_bucket, target_path')
			.eq('id', fileId)
			.single();

		if (dbError || !file) {
			throw new Error('File record not found during finalization');
		}

		const { data: publicUrlData } = supabase
			.storage
			.from(file.target_bucket)
			.getPublicUrl(file.target_path);

		return {
			...scanResult,
			publicUrl: publicUrlData.publicUrl,
		};
	}
}
