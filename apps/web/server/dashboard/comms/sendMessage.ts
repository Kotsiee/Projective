// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.90.1';
import { Deps } from '../../_shared/types.ts';
import { supabaseClient } from '../../core/clients/supabase.ts';
import { normaliseSupabaseError, normaliseUnknownError } from '../../core/errors/normalise.ts';
import { fail, ok, Result } from '../../core/http/result.ts';
import { ModerationService } from '../../services/moderation.ts';
import { StoragePaths } from '../../services/storagePaths.ts';
import { Config } from '@projective/backend';

interface SendMessageOptions {
	type?: 'dm' | 'channel';
	message?: string;
	attachments?: string[];
	files?: File[];
	targetUserId?: string;
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
		} = options;

		if (message) {
			const check = ModerationService.scan(message);
			if (check.flagged) {
				return fail('400', `Message rejected: ${check.reason}`, 400);
			}
		}

		let finalChannelId = channel_id;

		if (type === 'dm' && (channel_id === 'new' || !channel_id)) {
			if (!targetUserId) {
				return fail('400', 'Target user required for new DM', 400);
			}
			const { data: threadId, error: rpcError } = await supabase.rpc(
				'get_or_create_dm_thread',
				{
					target_user_id: targetUserId,
				},
			);
			if (rpcError) {
				const n = normaliseSupabaseError(rpcError);
				return fail(n.code, n.message, n.status);
			}
			finalChannelId = threadId;
		}

		const table = type === 'dm' ? 'dm_messages' : 'project_messages';
		const channelCol = type === 'dm' ? 'thread_id' : 'channel_id';

		if (files.length > 0) {
			const serviceRoleKey = Config.SUPABASE_SERVICE_ROLE_KEY;
			const supabaseUrl = Config.SUPABASE_URL;

			if (!serviceRoleKey || !supabaseUrl) {
				console.error(
					'Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL',
				);
				return fail(
					'500',
					'Server configuration error: Uploads disabled',
					500,
				);
			}

			const adminClient = createClient(
				Config.SUPABASE_URL,
				Config.SUPABASE_SERVICE_ROLE_KEY,
				{
					auth: {
						persistSession: false,
						autoRefreshToken: false,
						detectSessionInUrl: false,
					},
				},
			);

			let projectId = '';
			if (type === 'channel') {
				const { data } = await supabase.schema('comms').from(
					'project_channels',
				).select(
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
					: {
						type: 'personal_library',
						userId: user.id,
						folder: 'dms',
					};

				const { bucket: targetBucket, path: targetPath } = StoragePaths
					.generate(
						file.name,
						context,
					);

				const { error: dbError } = await supabase.schema('files').from(
					'items',
				).insert({
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

				const { error: uploadError } = await supabase.storage.from(
					'quarantine',
				).upload(
					quarantinePath,
					file,
					{ contentType: file.type, upsert: false },
				);
				if (uploadError) throw uploadError;

				await supabase.schema('files').from('items').select('id').eq(
					'id',
					fileId,
				).single();

				const { error: scanError } = await adminClient.functions.invoke(
					'scan-file',
					{
						body: { fileId },
					},
				);

				if (scanError) {
					console.error('Scan invocation failed:', scanError);
					throw scanError;
				}

				return fileId;
			});

			try {
				const newIds = await Promise.all(uploadPromises);
				attachments.push(...newIds);
			} catch (err: any) {
				console.error('Server-side upload failed:', err);
				return fail(
					'500',
					`Failed to process attachments: ${err.message}`,
					500,
				);
			}
		}

		const { data: msg, error: msgError } = await supabase
			.schema('comms')
			.from(table)
			.insert({
				[channelCol]: finalChannelId,
				sender_user_id: user.id,
				body: message || '',
				has_attachments: attachments.length > 0,
			})
			.select()
			.single();

		if (msgError) {
			const n = normaliseSupabaseError(msgError);
			return fail(n.code, n.message, n.status);
		}

		if (attachments.length > 0) {
			const links = attachments.map((id) => ({
				message_table: `comms.${table}`,
				message_id: msg.id,
				attachment_id: id,
			}));

			const { error: linkError } = await supabase
				.schema('comms')
				.from('message_attachments')
				.insert(links);

			if (linkError) {
				console.error('Failed to link attachments:', linkError);

				const n = normaliseSupabaseError(linkError);
				return fail(
					n.code,
					'Message created but attachments failed: ' + n.message,
					n.status,
				);
			}
		}

		return ok({
			id: msg.id,
			channelId: finalChannelId,
			timestamp: msg.created_at,
		});
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}
