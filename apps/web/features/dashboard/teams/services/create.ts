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
import { StoragePaths } from '@projective/types';
import { createClient } from 'supabaseClient';
import { CreateTeamInput } from '../contracts/new/_validation.ts';

interface FileOptions {
	avatar?: File;
	banner?: File;
}

export async function createTeam(
	data: CreateTeamInput,
	files: FileOptions = {},
	deps: Deps = {},
): Promise<Result<{ teamId: string; teamSlug: string }>> {
	try {
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		const { data: { user }, error: authError } = await supabase.auth.getUser();
		if (authError || !user) {
			return fail('unauthorized', 'You must be signed in to create a team.', 401);
		}

		const teamId = crypto.randomUUID();

		const serviceRoleKey = Config.SUPABASE_SERVICE_ROLE_KEY;
		const supabaseUrl = Config.SUPABASE_URL;
		let adminClient: any = null;

		if (files.avatar || files.banner) {
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
			type: 'team_avatar' | 'team_banner',
		): Promise<string> => {
			const fileId = crypto.randomUUID();
			const quarantinePath = `${crypto.randomUUID()}/${file.name}`;

			const { bucket: targetBucket, path: targetPath } = StoragePaths.generate(
				file.name,
				{ type, teamId },
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

		let avatarUrl = data.avatar_url;
		let bannerUrl = data.banner_url;

		if (files.avatar) {
			try {
				avatarUrl = await processFile(files.avatar, 'team_avatar');
			} catch (e) {
				console.error('Avatar upload failed:', e);

				return fail('server_error', 'Failed to upload avatar', 500);
			}
		}

		if (files.banner) {
			try {
				bannerUrl = await processFile(files.banner, 'team_banner');
			} catch (e) {
				console.error('Banner upload failed:', e);
				return fail('server_error', 'Failed to upload banner', 500);
			}
		}

		const { data: result, error: rpcError } = await supabase
			.schema('org')
			.rpc('create_team', {
				payload: {
					...data,
					id: teamId,
					owner_id: user.id,
					avatar_url: avatarUrl,
					banner_url: bannerUrl,
				},
			});

		if (rpcError) {
			const n = normaliseSupabaseError(rpcError);
			if (rpcError.code === '23505' && rpcError.message.includes('slug')) {
				return fail('conflict', 'This team handle is already taken.', 409);
			}
			return fail(n.code, n.message, n.status);
		}

		if (!result || !result.team_id) {
			return fail('server_error', 'Team creation failed to return an ID.', 500);
		}

		return ok({
			teamId: result.team_id,
			teamSlug: result.team_slug,
		});
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}
