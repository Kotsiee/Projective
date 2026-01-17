// deno-lint-ignore-file no-explicit-any
import { Deps } from '../../_shared/types.ts';
import { supabaseClient } from '../../core/clients/supabase.ts';
import { normaliseSupabaseError, normaliseUnknownError } from '../../core/errors/normalise.ts';
import { fail, ok, Result } from '../../core/http/result.ts';

interface GetMessagesOptions {
	type?: 'dm' | 'channel';
	start?: number;
	limit?: number;
	countOnly?: boolean;
}

export async function getMessages(
	channel_id: string,
	options: GetMessagesOptions = {},
	deps: Deps = {},
): Promise<Result<any>> {
	try {
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		const { type = 'channel' } = options;
		const table = type === 'dm' ? 'dm_messages' : 'project_messages';
		const channelCol = type === 'dm' ? 'thread_id' : 'channel_id';

		console.log('params:', channel_id);

		if (options.countOnly) {
			const { count, error } = await supabase
				.schema('comms')
				.from(table)
				.select('*', { count: 'exact', head: true })
				.eq(channelCol, channel_id);

			if (error) {
				const n = normaliseSupabaseError(error);
				return fail(n.code, n.message, n.status);
			}
			return ok({ meta: { totalCount: count || 0 } });
		}

		const start = options.start ?? 0;
		const limit = options.limit ?? 20;
		const end = start + limit - 1;

		const { data: messages, count, error } = await supabase
			.schema('comms')
			.from(table)
			.select(
				`*`,
				{ count: 'exact' },
			)
			.eq(channelCol, channel_id)
			.order('created_at', { ascending: false })
			.range(start, end);

		if (error) {
			const n = normaliseSupabaseError(error);
			return fail(n.code, n.message, n.status);
		}

		if (!messages || messages.length === 0) {
			return ok({ items: [], meta: { totalCount: count ?? 0 } });
		}

		const userIds = [...new Set(messages.map((m: any) => m.sender_user_id))];

		const { data: profiles } = await supabase
			.schema('org')
			.from('users_public')
			.select('user_id, display_name, avatar_url')
			.in('user_id', userIds);

		const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);
		const userId = (await supabase.auth.getUser()).data.user?.id;

		const items = messages.map((msg: any) => {
			const profile = profileMap.get(msg.sender_user_id) || {};

			const mappedAttachments = msg.attachments?.map((att: any) => ({
				id: att.file?.id,
				name: att.file?.display_name,
				type: att.file?.mime_type,
				size: att.file?.size_bytes,
				url: `/api/v1/files/${att.file?.id}/access`,
			})) || [];

			return {
				id: msg.id,
				text: msg.body,
				timestamp: msg.created_at,
				isSelf: msg.sender_user_id === userId,
				sender: {
					id: msg.sender_user_id,
					name: profile.display_name || 'Unknown User',
					avatarUrl: profile.avatar_url,
				},
				attachments: mappedAttachments,
			};
		}).reverse();

		return ok({
			items,
			meta: {
				totalCount: count ?? 0,
			},
		});
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}
