import { supabaseClient } from '@server/core/clients/supabase.ts';
import { StoragePaths } from './storagePaths.ts';

export class FileService {
	static async initUpload(
		userId: string,
		filename: string,
		mimeType: string,
		sizeBytes: number,
		context: any,
	) {
		const supabase = await supabaseClient();

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

	static async finalizeUpload(fileId: string) {
		const supabase = await supabaseClient();

		const { data, error } = await supabase.functions.invoke('scan-file', {
			body: { fileId },
		});

		if (error) {
			console.error('Scan Function Failed:', error);
			throw new Error('File processing failed');
		}

		return data;
	}

	private static async mockVirusScan(bucket: string, path: string): Promise<boolean> {
		// In real life, send to ClamAV or external service
		// await new Promise(r => setTimeout(r, 500));
		return true;
	}
}
