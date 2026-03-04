import { supabaseClient } from '@projective/backend';
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

		// 1. Trigger Edge Function to Scan & Move File
		const { data: scanResult, error: scanError } = await supabase.functions.invoke('scan-file', {
			body: { fileId },
		});

		if (scanError) {
			console.error('Scan Function Failed:', scanError);
			throw new Error('File processing failed');
		}

		// 2. Fetch the file record to get the definitive target path
		const { data: file, error: dbError } = await supabase
			.schema('files')
			.from('items')
			.select('target_bucket, target_path')
			.eq('id', fileId)
			.single();

		if (dbError || !file) {
			throw new Error('File record not found during finalization');
		}

		// 3. Generate Authoritative Public URL
		// This uses the server's Supabase config, ensuring the domain is correct.
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
