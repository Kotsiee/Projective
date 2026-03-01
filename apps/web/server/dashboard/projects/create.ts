import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.90.1';
import { fail, ok, Result } from '@server/core/http/result.ts';
import { normaliseSupabaseError, normaliseUnknownError } from '@server/core/errors/normalise.ts';
import { supabaseClient } from '@server/core/clients/supabase.ts';
import { Deps } from '../../_shared/types.ts';
import { CreateProjectInput } from '@contracts/dashboard/projects/new/_validation.ts';
import { Config } from '@projective/backend';
import { StoragePaths } from '@server/services/storagePaths.ts';

interface FileOptions {
	thumbnail?: File;
	attachments?: File[];
}

export async function createProject(
	data: CreateProjectInput,
	targetStatus: 'draft' | 'active',
	files: FileOptions = {},
	deps: Deps = {},
): Promise<Result<{ projectId: string }>> {
	try {
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		const { data: { user }, error: authError } = await supabase.auth.getUser();
		if (authError || !user) {
			return fail('unauthorized', 'You must be signed in to create a project.', 401);
		}

		const projectId = crypto.randomUUID();

		const serviceRoleKey = Config.SUPABASE_SERVICE_ROLE_KEY;
		const supabaseUrl = Config.SUPABASE_URL;
		let adminClient: any = null;

		if (files.thumbnail || (files.attachments && files.attachments.length > 0)) {
			if (!serviceRoleKey || !supabaseUrl) {
				console.error('Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL');
				return fail('server_error', 'Upload configuration missing', 500);
			}
			adminClient = createClient(supabaseUrl, serviceRoleKey, {
				auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
			});
		}

		const processFile = async (
			file: File,
			contextType: 'project_thumbnail' | 'project_global_attachment',
			attachmentId?: string,
		): Promise<{ url?: string; id: string }> => {
			const fileId = attachmentId || crypto.randomUUID();
			const quarantinePath = `${crypto.randomUUID()}/${file.name}`;

			const { bucket: targetBucket, path: targetPath } = StoragePaths.generate(
				file.name,
				{ type: contextType, projectId, attachmentId: fileId },
			);

			const { error: dbError } = await supabase.schema('files').from('items').insert({
				id: fileId,
				owner_user_id: user.id,
				display_name: file.name,
				original_name: file.name,
				mime_type: file.type,
				size_bytes: file.size,
				bucket_id: 'quarantine',
				storage_path: quarantinePath,
				target_bucket: targetBucket,
				target_path: targetPath,
				status: 'pending_upload',
			});
			if (dbError) throw dbError;

			const { error: uploadError } = await supabase.storage
				.from('quarantine')
				.upload(quarantinePath, file, { contentType: file.type, upsert: false });
			if (uploadError) throw uploadError;

			const { error: scanError } = await adminClient.functions.invoke('scan-file', {
				body: { fileId },
			});
			if (scanError) throw scanError;

			let url;
			if (targetBucket === 'public_assets') {
				const { data: publicUrlData } = supabase
					.storage
					.from(targetBucket)
					.getPublicUrl(targetPath);
				url = publicUrlData.publicUrl;
			}

			return { url, id: fileId };
		};

		let thumbnail_url = undefined;
		const attachment_ids: string[] = [];

		if (files.thumbnail) {
			try {
				const res = await processFile(files.thumbnail, 'project_thumbnail');
				thumbnail_url = res.url;
			} catch (e) {
				console.error('Thumbnail upload failed:', e);
				return fail('server_error', 'Failed to upload thumbnail', 500);
			}
		}

		if (files.attachments && files.attachments.length > 0) {
			try {
				const uploads = await Promise.all(
					files.attachments.map((f) => processFile(f, 'project_global_attachment')),
				);
				attachment_ids.push(...uploads.map((u) => u.id));
			} catch (e) {
				console.error('Attachment upload failed:', e);
				return fail('server_error', 'Failed to upload attachments', 500);
			}
		}

		const existingAttachments = data.global_attachments || [];
		const finalAttachments = [...existingAttachments, ...attachment_ids];

		const { data: _rpcResultId, error: rpcError } = await supabase
			.schema('projects')
			.rpc('create_project', {
				payload: {
					...data,
					id: projectId,
					thumbnail_url,
					global_attachments: finalAttachments,
				},
			});

		if (rpcError) {
			const n = normaliseSupabaseError(rpcError);
			return fail(n.code, n.message, n.status);
		}

		if (targetStatus === 'active') {
			const { error: updateError } = await supabase
				.schema('projects')
				.from('projects')
				.update({ status: 'active' })
				.eq('id', projectId);

			if (updateError) {
				const n = normaliseSupabaseError(updateError);
				return fail('partial_error', `Project saved but failed to publish: ${n.message}`, 500);
			}
		}

		return ok({ projectId });
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}
