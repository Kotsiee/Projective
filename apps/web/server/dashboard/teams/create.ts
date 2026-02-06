// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.90.1';
import { fail, ok, Result } from '@server/core/http/result.ts';
import { normaliseSupabaseError, normaliseUnknownError } from '@server/core/errors/normalise.ts';
import { supabaseClient } from '@server/core/clients/supabase.ts';
import { Deps } from '../../_shared/types.ts';
import { CreateTeamInput } from '@contracts/dashboard/teams/new/_validation.ts';
import { Config } from '@projective/backend';
import { StoragePaths } from '@server/services/storagePaths.ts';

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

		// 1. Generate Team ID upfront
		const teamId = crypto.randomUUID();

		// 2. Setup Admin Client for File Scanning (Requires Service Role)
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

		// 3. Helper: Server-side Upload -> Quarantine -> Scan -> Public URL
		const processFile = async (
			file: File,
			type: 'team_avatar' | 'team_banner',
		): Promise<string> => {
			const fileId = crypto.randomUUID();
			const quarantinePath = `${crypto.randomUUID()}/${file.name}`;

			// Determine target path using shared logic
			const { bucket: targetBucket, path: targetPath } = StoragePaths.generate(
				file.name,
				{ type, teamId },
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

			// C. Trigger Scan (Moves to Public Assets)
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

		let avatarUrl = data.avatar_url;
		let bannerUrl = data.banner_url;

		// 4. Process Files (Parallel if needed, sequential for safety here)
		if (files.avatar) {
			try {
				avatarUrl = await processFile(files.avatar, 'team_avatar');
			} catch (e) {
				console.error('Avatar upload failed:', e);
				// Decide: Fail whole request or continue without avatar?
				// Failing is safer for data consistency.
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

		// 5. Call RPC to Create Team
		const { data: result, error: rpcError } = await supabase
			.schema('org')
			.rpc('create_team', {
				payload: {
					...data,
					id: teamId, // Use the ID we generated
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
