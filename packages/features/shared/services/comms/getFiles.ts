// deno-lint-ignore-file no-explicit-any
import {
	Deps,
	fail,
	normaliseSupabaseError,
	normaliseUnknownError,
	ok,
	Result,
	supabaseClient,
} from '@projective/backend';

/* #region Interfaces */
export interface GetFilesOptions {
	type?: 'dm' | 'channel';
	start?: number;
	limit?: number;
	countOnly?: boolean;
	category?: string;
	search?: string;
}
/* #endregion */

/* #region Service Logic */
/**
 * @function getFiles
 * @description Retrieves files attached to messages within a specific channel. Maps relations to return flat UI-ready objects.
 * * @param {string} channel_id - The ID of the channel or DM thread.
 * @param {GetFilesOptions} options - Pagination and filtering configuration.
 * @param {Deps} deps - Dependency injection for the Supabase client.
 * @returns {Promise<Result<any>>}
 */
export async function getFiles(
	channel_id: string,
	options: GetFilesOptions = {},
	deps: Deps = {},
): Promise<Result<any>> {
	try {
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		const { type = 'channel', start = 0, limit = 30 } = options;
		const table = type === 'dm' ? 'dm_messages' : 'project_messages';
		const channelCol = type === 'dm' ? 'thread_id' : 'channel_id';
		const fullTableName = `comms.${table}`;

		// 1. Base Message Query (We paginate through messages to find recent media)
		const end = start + limit - 1;

		const { data: messages, count, error: msgError } = await supabase
			.schema('comms')
			.from(table)
			.select('*', { count: 'exact' })
			.eq(channelCol, channel_id)
			.order('created_at', { ascending: false })
			.range(start, end);

		if (msgError) {
			const n = normaliseSupabaseError(msgError);
			return fail(n.code, n.message, n.status);
		}

		if (!messages || messages.length === 0) {
			return ok({ items: [], meta: { totalCount: count ?? 0 } });
		}

		const messageIds = messages.map((m: any) => m.id);

		// 2. Fetch Attachments with Filters applied at the DB level
		let fileQuery = supabase
			.schema('comms')
			.from('message_file_details')
			.select('*')
			.in('message_id', messageIds)
			.eq('message_table', fullTableName);

		if (options.search) {
			fileQuery = fileQuery.ilike('display_name', `%${options.search}%`);
		}

		if (options.category && options.category !== 'all') {
			if (options.category === 'image') {
				fileQuery = fileQuery.ilike('mime_type', 'image/%');
			} else if (options.category === 'video') {
				fileQuery = fileQuery.ilike('mime_type', 'video/%');
			} else if (options.category === 'document') {
				fileQuery = fileQuery
					.not('mime_type', 'ilike', 'image/%')
					.not('mime_type', 'ilike', 'video/%');
			}
		}

		const { data: rawAttachments, error: attError } = await fileQuery;

		if (attError) {
			console.error('Attachment fetch error:', attError);
			const n = normaliseSupabaseError(attError);
			return fail(n.code, n.message, n.status);
		}

		if (!rawAttachments || rawAttachments.length === 0) {
			return ok({ items: [], meta: { totalCount: count ?? 0 } });
		}

		// 3. Fetch Sender Profiles for Context
		const userIds = [...new Set(messages.map((m: any) => m.sender_user_id))];

		const { data: profiles } = await supabase
			.schema('org')
			.from('users_public')
			.select('user_id, username, first_name, last_name, avatar_url')
			.in('user_id', userIds);

		const profileMap = new Map(profiles?.map((p: any) => [p.user_id, p]) || []);
		const authUser = await supabase.auth.getUser();
		const currentUserId = authUser.data.user?.id;

		// 4. Map and Flatten Results into `StageFileItem` shape expected by UI
		const fileItems: any[] = [];

		rawAttachments.forEach((file: any) => {
			const msg = messages.find((m: any) => m.id === file.message_id);
			if (!msg) return;

			const profile = profileMap.get(msg.sender_user_id) || {};
			const displayName = profile?.username
				? profile?.username
				: profile?.first_name
				? `${profile.first_name} ${profile.last_name || ''}`.trim()
				: 'Unknown User';

			fileItems.push({
				id: file.file_id, // Primary key for the file item
				attachment: {
					id: file.file_id,
					name: file.display_name,
					type: file.mime_type,
					size: file.size_bytes,
					url: `/api/v1/files/${file.file_id}/access`,
				},
				message: {
					id: msg.id,
					text: msg.body,
					timestamp: msg.created_at,
					isSelf: msg.sender_user_id === currentUserId,
					sender: {
						id: msg.sender_user_id,
						name: displayName,
						avatarUrl: profile.avatar_url,
					},
				},
			});
		});

		// Ensure timeline order matches message order
		fileItems.sort((a, b) =>
			new Date(b.message.timestamp).getTime() - new Date(a.message.timestamp).getTime()
		);

		return ok({
			items: fileItems,
			meta: {
				totalCount: count ?? 0,
			},
		});
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}
/* #endregion */
