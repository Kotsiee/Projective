import { Deps } from '../../_shared/types.ts';
import { supabaseClient } from '../../core/clients/supabase.ts';
import { normaliseUnknownError } from '../../core/errors/normalise.ts';
import { fail, ok, Result } from '../../core/http/result.ts';

interface SubscribeOptions {
	type?: 'dm' | 'channel';
	accessToken?: string;
	onMessage: (data: any) => void;
}

export async function subscribeMessages(
	channel_id: string,
	options: SubscribeOptions,
	deps: Deps = {},
): Promise<Result<{ unsubscribe: () => void }>> {
	try {
		const getClient = deps.getClient ?? supabaseClient;
		const supabase = await getClient();

		const { type = 'channel', accessToken, onMessage } = options;
		const dbTable = type === 'dm' ? 'dm_messages' : 'project_messages';
		const filterCol = type === 'dm' ? 'thread_id' : 'channel_id';
		const fullTableName = `comms.${dbTable}`;

		if (accessToken) {
			// console.log(`[Realtime] Setting auth for user...`);
			supabase.realtime.setAuth(accessToken);
		}

		const user_id = await (await supabase.auth.getUser()).data.user?.id;
		const channelName = `comms:${dbTable}:${channel_id}:${crypto.randomUUID()}`;
		console.log(`[Realtime] Setting up subscription for ${channelName}`);

		const channel = supabase
			.channel(channelName)
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'comms',
					table: dbTable,
					filter: `${filterCol}=eq.${channel_id}`,
				},
				async (payload: any) => {
					const newMsg = payload.new;
					if (!newMsg) return;

					try {
						// 1. Fetch Sender Profile
						const profilePromise = supabase
							.schema('org')
							.from('users_public')
							.select('user_id, display_name, avatar_url')
							.eq('user_id', newMsg.sender_user_id)
							.single();

						// 2. Fetch Attachments (if any)
						// We use the same view as getMessages to get file details
						const attachmentsPromise = newMsg.has_attachments
							? supabase
								.schema('comms')
								.from('message_file_details')
								.select('*')
								.eq('message_id', newMsg.id)
								.eq('message_table', fullTableName)
							: Promise.resolve({ data: [] });

						const [profileRes, attachmentsRes] = await Promise.all([
							profilePromise,
							attachmentsPromise,
						]);

						const profile = profileRes.data;
						const rawAttachments = attachmentsRes.data || [];

						// 3. Map Attachments to Frontend Format
						const mappedAttachments = rawAttachments.map(
							(file: any) => ({
								id: file.file_id,
								name: file.display_name,
								type: file.mime_type,
								size: file.size_bytes,
								url: `/api/v1/files/${file.file_id}/access`,
							}),
						);

						// 4. Construct Event Data
						const eventData = {
							id: newMsg.id,
							text: newMsg.body,
							timestamp: newMsg.created_at,
							isSelf: user_id === newMsg.sender_user_id,
							sender: {
								id: newMsg.sender_user_id,
								name: profile?.display_name || 'Unknown',
								avatarUrl: profile?.avatar_url,
							},
							attachments: mappedAttachments,
						};

						console.log(
							'[Realtime] New message hydrated:',
							eventData,
						);

						onMessage(eventData);
					} catch (err) {
						console.error(
							'[Realtime] Error hydrating message:',
							err,
						);
					}
				},
			)
			.subscribe((status, err) => {
				console.log(
					`[Realtime] Status for ${channel_id}:`,
					status,
					err || '',
				);
				if (status === 'CHANNEL_ERROR') {
					console.error(
						'[Realtime] Access denied. Check RLS policies.',
					);
				}
			});

		return ok({
			unsubscribe: async () => {
				console.log(`[Realtime] Unsubscribing from ${channel_id}`);
				await supabase.removeChannel(channel);
			},
		});
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}
