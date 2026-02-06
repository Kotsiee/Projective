// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.90.1';
import { fail, ok, Result } from '@server/core/http/result.ts';
import { normaliseSupabaseError, normaliseUnknownError } from '@server/core/errors/normalise.ts';
import { supabaseClient } from '@server/core/clients/supabase.ts';
import { Deps } from '../../_shared/types.ts';
import { CreateBusinessInput } from '@contracts/dashboard/business/new/_validation.ts';
import { Config } from '@projective/backend';
import { StoragePaths } from '@server/services/storagePaths.ts';

interface FileOptions {
	logo?: File;
	banner?: File; // NEW
}

export async function createBusiness(
	data: CreateBusinessInput,
	files: FileOptions = {},
	deps: Deps = {},
): Promise<Result<{ businessId: string; slug: string }>> {
	try {
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		const { data: { user }, error: authError } = await supabase.auth.getUser();
		if (authError || !user) {
			return fail('unauthorized', 'You must be signed in to establish a business.', 401);
		}

		// 1. Generate ID upfront
		const businessId = crypto.randomUUID();

		// 2. Setup Admin Client for Scanning
		const serviceRoleKey = Config.SUPABASE_SERVICE_ROLE_KEY;
		const supabaseUrl = Config.SUPABASE_URL;
		let adminClient: any = null;

		if (files.logo || files.banner) {
			if (!serviceRoleKey || !supabaseUrl) {
				console.error('Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL');
				return fail('server_error', 'Upload configuration missing', 500);
			}
			adminClient = createClient(supabaseUrl, serviceRoleKey, {
				auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
			});
		}

		// 3. Helper: Upload -> Scan -> Public URL
		const processFile = async (
			file: File,
			type: 'business_logo' | 'business_banner',
		): Promise<string> => {
			const fileId = crypto.randomUUID();
			const quarantinePath = `${crypto.randomUUID()}/${file.name}`;

			const { bucket: targetBucket, path: targetPath } = StoragePaths.generate(
				file.name,
				{ type, businessId },
			);

			// A. Insert File Record
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

			// B. Upload to Quarantine
			const { error: uploadError } = await supabase.storage
				.from('quarantine')
				.upload(quarantinePath, file, { contentType: file.type, upsert: false });

			if (uploadError) throw uploadError;

			// C. Trigger Scan
			const { error: scanError } = await adminClient.functions.invoke('scan-file', {
				body: { fileId },
			});

			if (scanError) {
				console.error(`Scan failed for ${type}:`, scanError);
				throw scanError;
			}

			// D. Construct Public URL
			const { data: publicUrlData } = supabase
				.storage
				.from(targetBucket)
				.getPublicUrl(targetPath);

			return publicUrlData.publicUrl;
		};

		let logoUrl = data.logo_url;
		let bannerUrl = data.banner_url; // NEW

		// 4. Process Files
		if (files.logo) {
			try {
				logoUrl = await processFile(files.logo, 'business_logo');
			} catch (e) {
				console.error('Logo upload failed:', e);
				return fail('server_error', 'Failed to upload logo', 500);
			}
		}

		if (files.banner) {
			try {
				bannerUrl = await processFile(files.banner, 'business_banner');
			} catch (e) {
				console.error('Banner upload failed:', e);
				return fail('server_error', 'Failed to upload banner', 500);
			}
		}

		// 5. Call RPC
		const { data: result, error: rpcError } = await supabase
			.schema('org')
			.rpc('create_business', {
				payload: {
					...data,
					id: businessId,
					logo_url: logoUrl,
					banner_url: bannerUrl, // NEW
				},
			});

		if (rpcError) {
			const n = normaliseSupabaseError(rpcError);
			if (rpcError.code === '23505' && rpcError.message.includes('slug')) {
				return fail('conflict', 'This business handle is already taken.', 409);
			}
			return fail(n.code, n.message, n.status);
		}

		if (!result || !result.business_id) {
			return fail('server_error', 'Business creation failed to return an ID.', 500);
		}

		return ok({
			businessId: result.business_id,
			slug: result.slug,
		});
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}
