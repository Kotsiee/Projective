import {
	Deps,
	fail,
	normaliseSupabaseError,
	normaliseUnknownError,
	ok,
	Result,
	supabaseClient,
} from '@projective/backend';
import { Config } from '@projective/backend';
import { createClient } from 'supabaseClient';
import { StoragePaths } from '@projective/types';
import { CreateBusinessInput } from '../contracts/new/_validation.ts';

interface FileOptions {
	logo?: File;
	banner?: File;
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

		const businessId = crypto.randomUUID();

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

			if (scanError) {
				console.error(`Scan failed for ${type}:`, scanError);
				throw scanError;
			}

			const { data: publicUrlData } = supabase
				.storage
				.from(targetBucket)
				.getPublicUrl(targetPath);

			return publicUrlData.publicUrl;
		};

		let logoUrl = data.logo_url;
		let bannerUrl = data.banner_url;

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

		const { data: result, error: rpcError } = await supabase
			.schema('org')
			.rpc('create_business', {
				payload: {
					...data,
					id: businessId,
					logo_url: logoUrl,
					banner_url: bannerUrl,
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
