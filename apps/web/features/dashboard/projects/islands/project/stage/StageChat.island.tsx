import '../../../styles/components/project/stage/chat/messages.css';
import ChatMessage from '../../../components/project/stage/chat/StageChatMessage.tsx';
import { ChatMessageData, ChatNetworkSource } from './ChatNetworkSource.ts';
import { ChatList, getBurstPosition } from '@projective/data';
import { MediaViewerProvider } from '../../../contexts/MediaViewerContext.tsx';
import { useStageContext } from '../../../contexts/StageContext.tsx';
import { getCsrfToken } from '@projective/utils';
import { generateBlurhash } from '@/utils/processors/blurhash.ts';
import { useEffect, useMemo, useRef } from 'preact/hooks';
import { effect, untracked, useSignal } from '@preact/signals';
import { IconMessages } from '@tabler/icons-preact';
import { useNavigationContext } from '@features/navigation/contexts/NavigationContext.tsx';
import ChatMessageInput from '@features/dashboard/projects/components/project/stage/chat/StageChatMessageInput.tsx';
import { FileWithMeta } from '@projective/types';

export default function ProjectChatIsland() {
	const { stage, refresh } = useStageContext();
	const { setMiddleNav } = useNavigationContext();

	const optimisticMsgs = useSignal<ChatMessageData[]>([]);
	const attachments = useSignal<FileWithMeta[]>([]);
	const replyingTo = useSignal<ChatMessageData | null>(null);
	const pendingUploads = useRef(new Map<string, { message: string; files: FileWithMeta[] }>());

	const handleSend = async (message: string, files: FileWithMeta[], retryId?: string) => {
		const tempId = retryId || crypto.randomUUID();
		const targetChannel = stage?.value?.channel_id || 'new';

		// Optimistic UI
		if (!retryId) {
			const activeReply = replyingTo.value;
			const optimisticData: ChatMessageData = {
				id: tempId,
				tempId: tempId,
				text: message,
				sender: { id: 'self', name: 'Me' },
				timestamp: new Date().toISOString(),
				isSelf: true,
				status: 'sending',
				attachments: files.map((f) => ({
					id: f.id as string,
					name: f.file.name as string,
					type: f.type as string,
					size: f.file.size,
					url: '',
				})),
				replyTo: activeReply
					? {
						id: activeReply.id,
						senderName: activeReply.sender.name,
						snippet: (activeReply.text?.trim() ||
							activeReply.attachments?.[0]?.name || 'Attachment').slice(0, 80),
					}
					: undefined,
			};
			optimisticMsgs.value = [...optimisticMsgs.value, optimisticData];
			pendingUploads.current.set(tempId, { message, files });
			replyingTo.value = null;
		}

		try {
			const isNewChannel = targetChannel === 'new';

			const formData = new FormData();
			formData.append('message', message);
			formData.append('tempId', tempId);

			// First message in a stage: the channel is created lazily server-side
			// (sendMessage → get_or_create_project_channel), which needs the stage id.
			if (isNewChannel) {
				formData.append('targetStageId', stage?.value?.stage_id || '');
			}

			// BlurHash placeholders: reuse the hash the processor pipeline already
			// produced (image resizer), else generate one here. Best-effort — a null
			// hash just means that attachment renders without a placeholder.
			const blurhashes: Record<string, string> = {};
			await Promise.all(files.map(async (f) => {
				const hash = f.processingMeta?.blurhash ?? await generateBlurhash(f.file);
				if (hash) blurhashes[f.file.name] = hash;
			}));

			files.forEach((f) => {
				formData.append('files', f.file);
				// Flag this specific file as an audio message based on the meta injected in the input component
				if (f.meta?.isAudioMessage) {
					formData.append('voiceMessages', f.file.name);
				}
			});

			// One JSON field: { [file.name]: blurhash }, read back in the messages route.
			if (Object.keys(blurhashes).length > 0) {
				formData.append('blurhashes', JSON.stringify(blurhashes));
			}

			const csrfToken = await getCsrfToken();

			// Both the "new" and existing cases post to the channel messages route; the
			// channelid segment is literally `new` when no channel exists yet.
			const endpoint = `/api/v1/dashboard/comms/channels/${targetChannel}/messages?type=channel`;

			const res = await fetch(endpoint, {
				method: 'POST',
				headers: { 'X-CSRF': csrfToken || '' },
				body: formData,
			});

			if (!res.ok) throw new Error('Network response was not ok');

			const realMsg = await res.json();

			optimisticMsgs.value = optimisticMsgs.value.map((m) =>
				m.tempId === tempId
					? { ...m, id: realMsg.id, status: 'sent', timestamp: realMsg.timestamp }
					: m
			);
			pendingUploads.current.delete(tempId);

			// Reload the stage so it picks up the freshly-created channel_id and the
			// realtime data source re-subscribes to it.
			if (isNewChannel) refresh();
		} catch (err) {
			console.error('Failed to send message:', err);
			optimisticMsgs.value = optimisticMsgs.value.map((m) =>
				m.tempId === tempId ? { ...m, status: 'error' } : m
			);
		}
	};

	const onSend = (msg: string, files: FileWithMeta[]) => handleSend(msg, files);

	const onSendRef = useRef(onSend);
	onSendRef.current = onSend;

	const onRetry = (tempId: string) => {
		const data = pendingUploads.current.get(tempId);
		if (data) handleSend(data.message, data.files, tempId);
	};

	/** Drops an optimistic message from the local buffer (client-side delete). */
	const handleDeleteMessage = (msg: ChatMessageData) => {
		optimisticMsgs.value = optimisticMsgs.value.filter(
			(o) => o.id !== msg.id && o.tempId !== msg.tempId,
		);
		pendingUploads.current.delete(msg.tempId ?? msg.id);
	};

	useEffect(() => {
		const dispose = effect(() => {
			const hasAttachments = attachments.value.length > 0;
			const isReplying = replyingTo.value !== null;
			const baseHeight = hasAttachments ? 150 : 86;

			untracked(() => {
				setMiddleNav({
					footerHeight: `${baseHeight + (isReplying ? 44 : 0)}px`,
					footerContent: (
						<ChatMessageInput
							onSend={(text, files) => onSendRef.current(text, files)}
							files={attachments}
							replyingTo={replyingTo}
							onCancelReply={() => (replyingTo.value = null)}
						/>
					),
				});
			});
		});

		return () => {
			dispose();
			setMiddleNav({
				footerHeight: '0px',
				footerContent: null,
			});
		};
	}, []);

	const dataSource = useMemo(() => {
		if (!stage?.value || !stage.value.channel_id) return null;
		return new ChatNetworkSource(stage.value.channel_id);
	}, [stage?.value?.channel_id]);

	return (
		<MediaViewerProvider>
			<div class='project-chat-island messages-container'>
				<div class='project-chat-island__messages'>
					{dataSource
						? (
							<ChatList
								dataSource={dataSource}
								optimisticItems={optimisticMsgs.value}
								renderItem={(item, index, items) => {
									const { isFirstInBurst, isLastInBurst } = getBurstPosition(items, index);
									return (
										<ChatMessage
											message={item}
											isFirstInBurst={isFirstInBurst}
											isLastInBurst={isLastInBurst}
											onRetry={onRetry}
											onReply={(m) => (replyingTo.value = m)}
											onDelete={handleDeleteMessage}
										/>
									);
								}}
								estimateHeight={120}
								pageSize={20}
								scrollMode='window'
							/>
						)
						: (
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									justifyContent: 'center',
									height: '100%',
									color: 'var(--text-muted)',
									gap: '1rem',
								}}
							>
								<IconMessages size={48} opacity={0.5} />
								<p>Send a message to start the conversation.</p>
							</div>
						)}
				</div>
			</div>
		</MediaViewerProvider>
	);
}
