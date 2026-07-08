/**
 * @file update.ts
 * @description Backend service for Business Profile Management (US-008 AC2): read the admin profile
 * for the settings form, and update the legal/display name + billing email + administrative logo.
 * The logo travels through the same quarantine→scan pipeline as business creation (`create.ts`) and
 * is persisted as `logo_file_id`, never a URL. Mutations go through the `org.update_business` RPC
 * (migration 0309), which enforces owner/admin authorisation and writes the audit trail.
 */

import {
	Config,
	type Deps,
	fail,
	normaliseSupabaseError,
	normaliseUnknownError,
	ok,
	type Result,
	supabaseClient,
} from '@projective/backend';
import { createClient, type SupabaseClient } from 'supabaseClient';
import { StoragePaths } from '@projective/types';
import type { BusinessAdminProfile } from '../contracts/settings/Settings.ts';
import type { UpdateBusinessSettingsInput } from '../contracts/settings/_validation.ts';

async function resolveFileUrl(
	sb: SupabaseClient,
	fileId: string | null | undefined,
): Promise<string | null> {
	if (!fileId) return null;
	const { data: file } = await sb
		.schema('files')
		.from('items')
		.select('bucket_id, storage_path, status')
		.eq('id', fileId)
		.maybeSingle();
	if (!file || file.status !== 'clean' || !file.bucket_id || !file.storage_path) return null;
	const { data } = sb.storage.from(file.bucket_id).getPublicUrl(file.storage_path);
	return data?.publicUrl ?? null;
}

/** Read the current business admin profile for the settings-form prefill. */
export async function getBusinessAdminProfile(
	businessId: string,
	deps: Deps = {},
): Promise<Result<BusinessAdminProfile>> {
	try {
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		const { data, error } = await supabase
			.schema('org')
			.rpc('get_business_admin_profile', { p_business_id: businessId });

		if (error) {
			const n = normaliseSupabaseError(error);
			return fail(n.code, n.message, n.status);
		}
		if (!data) return fail('not_found', 'Business not found', 404);

		const logoUrl = await resolveFileUrl(supabase, data.logo_file_id);
		return ok({ ...data, logoUrl } as BusinessAdminProfile);
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}

/**
 * Update the business admin profile. When `logo` is supplied it is pushed through the quarantine
 * scan pipeline and the resulting `files.items` id is persisted as `logo_file_id`.
 */
export async function updateBusiness(
	businessId: string,
	input: UpdateBusinessSettingsInput,
	files: { logo?: File; logoBlurhash?: string } = {},
	deps: Deps = {},
): Promise<Result<{ id: string }>> {
	try {
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		const { data: { user }, error: authError } = await supabase.auth.getUser();
		if (authError || !user) {
			return fail('unauthorized', 'You must be signed in to update this business.', 401);
		}

		let logoFileId: string | undefined;

		if (files.logo) {
			const serviceRoleKey = Config.SUPABASE_SERVICE_ROLE_KEY;
			const supabaseUrl = Config.SUPABASE_URL;
			if (!serviceRoleKey || !supabaseUrl) {
				return fail('server_error', 'Upload configuration missing', 500);
			}
			const adminClient = createClient(supabaseUrl, serviceRoleKey, {
				auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
			});

			try {
				const file = files.logo;
				const fileId = crypto.randomUUID();
				const quarantinePath = `${crypto.randomUUID()}/${file.name}`;
				const { bucket: targetBucket, path: targetPath } = StoragePaths.generate(
					file.name,
					{ type: 'business_logo', businessId },
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
					metadata: files.logoBlurhash ? { blurhash: files.logoBlurhash } : {},
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

				logoFileId = fileId;
			} catch (e) {
				console.error('Logo upload failed:', e);
				return fail('server_error', 'Failed to upload logo', 500);
			}
		}

		const payload: Record<string, unknown> = { ...input };
		if (logoFileId) payload.logo_file_id = logoFileId;

		const { data, error: rpcError } = await supabase
			.schema('org')
			.rpc('update_business', { p_business_id: businessId, payload });

		if (rpcError) {
			const n = normaliseSupabaseError(rpcError);
			return fail(n.code, n.message, n.status);
		}

		return ok({ id: (data?.id as string) ?? businessId });
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}
