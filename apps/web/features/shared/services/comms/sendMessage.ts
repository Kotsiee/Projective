import {
	Deps,
	fail,
	ModerationService,
	normaliseSupabaseError,
	normaliseUnknownError,
	ok,
	Result,
	supabaseClient,
} from '@projective/backend';
import { Config } from '@projective/backend';
import { createClient } from 'supabaseClient';
import { StoragePaths } from 'packages/types/src/files/storagePaths.ts';

interface SendMessageOptions {
	type?: 'dm' | 'channel';
	message?: string;
	attachments?: string[];
	files?: File[];
	targetUserId?: string;
	targetStageId?: string;
}

export async function sendMessage(
	channel_id: string,
	options: SendMessageOptions = {},
	deps: Deps = {},
): Promise<Result<any>> {
	try {
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();
		const user = (await supabase.auth.getUser()).data.user;

		if (!user) return fail('401', 'Unauthorized', 401);

		const {
			type = 'channel',
			message,
			attachments = [],
			files = [],
			targetUserId,
			targetStageId,
		} = options;

		if (message) {
			const check = ModerationService.scan(message);
			if (check.flagged) {
				return fail('400', `Message rejected: ${check.reason}`, 400);
			}
		}

		let finalChannelId = channel_id;

		// --- 1. HANDLE LAZY CHANNEL/DM CREATION ---
		if (type === 'dm' && (channel_id === 'new' || !channel_id)) {
			if (!targetUserId) return fail('400', 'Target user required for new DM', 400);

			const { data: threadId, error: rpcError } = await supabase
				.schema('comms')
				.rpc('get_or_create_dm_thread', { target_user_id: targetUserId });

			if (rpcError) {
				return fail(normaliseSupabaseError(rpcError).code, 'Failed to create DM thread', 400);
			}
			finalChannelId = threadId;
		} else if (type === 'channel' && (channel_id === 'new' || !channel_id)) {
			if (!targetStageId) return fail('400', 'Target stage required for new channel', 400);

			// Get parent project ID for the channel
			const { data: stageInfo, error: stageErr } = await supabase
				.schema('projects')
				.from('project_stages')
				.select('project_id, name')
				.eq('id', targetStageId)
				.single();

			if (stageErr || !stageInfo) return fail('400', 'Invalid stage', 400);

			const { data: newChannelId, error: rpcError } = await supabase
				.schema('comms')
				.rpc('get_or_create_project_channel', {
					p_project_id: stageInfo.project_id,
					p_stage_id: targetStageId,
					p_name: stageInfo.name,
				});

			if (rpcError) {
				return fail(normaliseSupabaseError(rpcError).code, 'Failed to create channel', 400);
			}
			finalChannelId = newChannelId;
		}

		// --- 2. PREPARE UPLOADS & INSERT ---
		const table = type === 'dm' ? 'dm_messages' : 'project_messages';
		const channelCol = type === 'dm' ? 'thread_id' : 'channel_id';

		if (files.length > 0) {
			const serviceRoleKey = Config.SUPABASE_SERVICE_ROLE_KEY;
			const supabaseUrl = Config.SUPABASE_URL;

			if (!serviceRoleKey || !supabaseUrl) {
				return fail('500', 'Server configuration error: Uploads disabled', 500);
			}

			const adminClient = createClient(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_ROLE_KEY, {
				auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
			});

			let projectId = '';
			if (type === 'channel') {
				const { data } = await supabase.schema('comms').from('project_channels').select(
					'project_id',
				).eq('id', finalChannelId).single();
				if (data) projectId = data.project_id;
			}

			const uploadPromises = files.map(async (file) => {
				const fileId = crypto.randomUUID();
				const quarantinePath = `${crypto.randomUUID()}/${file.name}`;
				const context: any = type === 'channel'
					? {
						type: 'project_attachment',
						projectId,
						channelId: finalChannelId,
						attachmentId: fileId,
					}
					: { type: 'personal_library', userId: user.id, folder: 'dms' };

				const { bucket: targetBucket, path: targetPath } = StoragePaths.generate(
					file.name,
					context,
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

				const { error: uploadError } = await supabase.storage.from('quarantine').upload(
					quarantinePath,
					file,
					{ contentType: file.type, upsert: false },
				);
				if (uploadError) throw uploadError;

				const { error: scanError } = await adminClient.functions.invoke('scan-file', {
					body: { fileId },
				});
				if (scanError) throw scanError;

				return fileId;
			});

			try {
				const newIds = await Promise.all(uploadPromises);
				attachments.push(...newIds);
			} catch (err: any) {
				return fail('500', `Failed to process attachments: ${err.message}`, 500);
			}
		}

		const { data: msg, error: msgError } = await supabase.schema('comms').from(table).insert({
			[channelCol]: finalChannelId,
			sender_user_id: user.id,
			body: message || '',
			has_attachments: attachments.length > 0,
		}).select().single();

		if (msgError) return fail(normaliseSupabaseError(msgError).code, msgError.message, 400);

		if (attachments.length > 0) {
			const links = attachments.map((id) => ({
				message_table: `comms.${table}`,
				message_id: msg.id,
				attachment_id: id,
			}));

			const { error: linkError } = await supabase.schema('comms').from('message_attachments')
				.insert(links);
			if (linkError) return fail('500', 'Message created but attachments failed', 500);
		}

		return ok({ id: msg.id, channelId: finalChannelId, timestamp: msg.created_at });
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}
