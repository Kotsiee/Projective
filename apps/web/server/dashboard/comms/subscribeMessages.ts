import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.90.1';
import { Deps } from '../../_shared/types.ts';
import { Config } from '@projective/backend';

import {
	fail,
	normaliseSupabaseError,
	normaliseUnknownError,
	ok,
	Result,
	supabaseClient,
} from '@projective/backend';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
		const userClient = await getClient();

		const { type = 'channel', onMessage } = options;
		const dbTable = type === 'dm' ? 'dm_messages' : 'project_messages';
		const filterCol = type === 'dm' ? 'thread_id' : 'channel_id';
		const fullTableName = `comms.${dbTable}`;

		// 1. Manually Verify User Access (since we'll use Service Role for Realtime)
		const user_id = (await userClient.auth.getUser()).data.user?.id;
		if (!user_id) return fail('401', 'Unauthorized', 401);

		if (type === 'channel') {
			const { data: hasAccess } = await userClient
				.schema('comms')
				.from('project_channels')
				.select('id')
				.eq('id', channel_id)
				.single();
			if (!hasAccess) return fail('403', 'Access denied to channel', 403);
		} else {
			const { data: hasAccess } = await userClient
				.schema('comms')
				.from('dm_participants')
				.select('id')
				.eq('thread_id', channel_id)
				.eq('user_id', user_id)
				.single();
			if (!hasAccess) return fail('403', 'Access denied to DM', 403);
		}

		// 2. Setup Service Role Client for Realtime WAL Bypass
		const adminClient = createClient(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_ROLE_KEY, {
			auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
		});

		const channelName = `comms:${dbTable}:${channel_id}:${crypto.randomUUID()}`;
		console.log(`[Realtime] Setting up Service Role subscription for ${channelName}`);

		const channel = adminClient
			.channel(channelName)
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'comms',
					table: dbTable,
					filter: `${filterCol}=eq.${channel_id}`,
				},
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				async (payload: any) => {
					const eventType = payload.eventType;

					if (eventType === 'DELETE') {
						console.log(`[Realtime] Message deleted:`, payload.old.id);
						onMessage({ type: 'DELETE', data: { id: payload.old.id } });
						return;
					}

					const newMsg = payload.new;
					if (!newMsg) return;

					try {
						const profilePromise = adminClient
							.schema('org')
							.from('users_public')
							.select('user_id, username, first_name, last_name, avatar_url')
							.eq('user_id', newMsg.sender_user_id)
							.single();

						const attachmentsPromise = newMsg.has_attachments
							? adminClient
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
						const displayName = profile?.username
							? profile?.username
							: profile?.first_name
							? `${profile.first_name} ${profile.last_name || ''}`.trim()
							: 'Unknown User';
						const rawAttachments = attachmentsRes.data || [];

						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						const mappedAttachments = rawAttachments.map(
							(file: any) => ({
								id: file.file_id,
								name: file.display_name,
								type: file.mime_type,
								size: file.size_bytes,
								url: `/api/v1/files/${file.file_id}/access`,
							}),
						);

						const eventData = {
							id: newMsg.id,
							text: newMsg.body,
							timestamp: newMsg.created_at,
							isSelf: user_id === newMsg.sender_user_id,
							sender: {
								id: newMsg.sender_user_id,
								name: displayName,
								avatarUrl: profile?.avatar_url,
							},
							attachments: mappedAttachments,
						};

						console.log(`[Realtime] ${eventType} Hydrated:`, eventData.id);
						onMessage({ type: eventType, data: eventData });
					} catch (err) {
						console.error('[Realtime] Error hydrating message:', err);
					}
				},
			)
			.subscribe((status: any, err: any) => {
				console.log(`[Realtime] Status for ${channel_id}:`, status, err || '');
			});

		return ok({
			unsubscribe: async () => {
				console.log(`[Realtime] Unsubscribing from ${channel_id}`);
				await adminClient.removeChannel(channel);
			},
		});
	} catch (err) {
		const n = normaliseUnknownError(err);
		return fail(n.code, n.message, 500);
	}
}
