// deno-lint-ignore-file no-explicit-any
import { Deps } from '../../_shared/types.ts';
import { supabaseClient } from '../../core/clients/supabase.ts';
import { normaliseSupabaseError, normaliseUnknownError } from '../../core/errors/normalise.ts';
import { fail, ok, Result } from '../../core/http/result.ts';
import { ModerationService } from '../../services/moderation.ts';

interface SendMessageOptions {
	type?: 'dm' | 'channel';
	message?: string;
	attachments?: string[];
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

		const { type = 'channel', message, attachments, targetUserId } = options;

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

			const { data: threadId, error: rpcError } = await supabase
				.rpc('get_or_create_dm_thread', { target_user_id: targetUserId });

			if (rpcError) {
				const n = normaliseSupabaseError(rpcError);
				return fail(n.code, n.message, n.status);
			}
			finalChannelId = threadId;
		}

		const table = type === 'dm' ? 'dm_messages' : 'project_messages';
		const channelCol = type === 'dm' ? 'thread_id' : 'channel_id';

		const { data: msg, error: msgError } = await supabase
			.schema('comms')
			.from(table)
			.insert({
				[channelCol]: finalChannelId,
				sender_user_id: user.id,
				body: message || '',
			})
			.select()
			.single();

		if (msgError) {
			const n = normaliseSupabaseError(msgError);
			return fail(n.code, n.message, n.status);
		}

		if (attachments && attachments.length > 0) {
			const links = attachments.map((fileId) => ({
				message_table: `comms.${table}`,
				message_id: msg.id,
				attachment_id: fileId,
			}));

			const { error: attachError } = await supabase
				.schema('comms')
				.from('message_attachments')
				.insert(links);

			if (attachError) {
				console.error('Failed to link attachments:', attachError);
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
