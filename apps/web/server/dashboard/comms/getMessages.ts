// deno-lint-ignore-file no-explicit-any
import { Deps } from '../../_shared/types.ts';
import {
	fail,
	normaliseSupabaseError,
	normaliseUnknownError,
	ok,
	Result,
	supabaseClient,
} from '@projective/backend';

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

		const fullTableName = `comms.${table}`;

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
			.select(`*`, { count: 'exact' })
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

		const messageIds = messages.map((m: any) => m.id);

		const { data: rawAttachments, error: attError } = await supabase
			.schema('comms')
			.from('message_file_details')
			.select('*')
			.in('message_id', messageIds)
			.eq('message_table', fullTableName);

		if (attError) {
			console.error('Attachment fetch error:', attError);
		}

		console.log('Raw attachments:', rawAttachments);
		const attachmentMap = new Map<string, any[]>();

		if (rawAttachments) {
			rawAttachments.forEach((row: any) => {
				const existing = attachmentMap.get(row.message_id) || [];

				const fileObj = {
					id: row.file_id,
					display_name: row.display_name,
					mime_type: row.mime_type,
					size_bytes: row.size_bytes,
				};

				existing.push(fileObj);
				attachmentMap.set(row.message_id, existing);
			});
		}

		const userIds = [
			...new Set(messages.map((m: any) => m.sender_user_id)),
		];

		const { data: profiles } = await supabase
			.schema('org')
			.from('users_public')
			.select('user_id, username, first_name, last_name, avatar_url')
			.in('user_id', userIds);

		const profileMap = new Map(
			profiles?.map((p: any) => [p.user_id, p]) || [],
		);
		const userId = (await supabase.auth.getUser()).data.user?.id;

		const items = messages.map((msg: any) => {
			const profile = profileMap.get(msg.sender_user_id) || {};
			const displayName = profile?.username
				? profile?.username
				: profile?.first_name
				? `${profile.first_name} ${profile.last_name || ''}`.trim()
				: 'Unknown User';

			const fileData = attachmentMap.get(msg.id) || [];

			const mappedAttachments = fileData.map((file: any) => ({
				id: file.id,
				name: file.display_name,
				type: file.mime_type,
				size: file.size_bytes,
				url: `/api/v1/files/${file.id}/access`,
			}));

			console.log(
				'Mapped attachments for message',
				msg.id,
				mappedAttachments,
			);

			return {
				id: msg.id,
				text: msg.body,
				timestamp: msg.created_at,
				isSelf: msg.sender_user_id === userId,
				sender: {
					id: msg.sender_user_id,
					name: displayName,
					avatarUrl: profile.avatar_url,
				},
				attachments: mappedAttachments,
			};
		}).reverse();
		console.log('Fetched messages:', items);
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
