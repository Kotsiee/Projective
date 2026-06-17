import '../../../styles/components/project/stage/chat/messages.css';
import ChatMessage from '../../../components/project/stage/chat/StageChatMessage.tsx';
import { ChatMessageData, ChatNetworkSource } from './ChatNetworkSource.ts';
import { ChatList } from '@projective/data';
import { useStageContext } from '../../../contexts/StageContext.tsx';
import { getCsrfToken } from '@projective/utils';
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
	const pendingUploads = useRef(new Map<string, { message: string; files: FileWithMeta[] }>());

	const handleSend = async (message: string, files: FileWithMeta[], retryId?: string) => {
		const tempId = retryId || crypto.randomUUID();
		const targetChannel = stage?.value?.channel_id || 'new';

		// Optimistic UI
		if (!retryId) {
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
			};
			optimisticMsgs.value = [...optimisticMsgs.value, optimisticData];
			pendingUploads.current.set(tempId, { message, files });
		}

		try {
			const formData = new FormData();
			formData.append('message', message);
			formData.append('tempId', tempId);

			files.forEach((f) => {
				formData.append('files', f.file);
				// Flag this specific file as an audio message based on the meta injected in the input component
				if (f.meta?.isAudioMessage) {
					formData.append('voiceMessages', f.file.name);
				}
			});

			const csrfToken = await getCsrfToken();

			const endpoint = targetChannel === 'new'
				? `/api/v1/dashboard/projects/${stage?.value?.project_id}/stages/${stage?.value?.stage_id}/chat/init`
				: `/api/v1/dashboard/comms/channels/${targetChannel}/messages?type=channel`;

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

			if (targetChannel === 'new') refresh();
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

	useEffect(() => {
		const dispose = effect(() => {
			const hasAttachments = attachments.value.length > 0;

			untracked(() => {
				setMiddleNav({
					footerHeight: hasAttachments ? '150px' : '86px',
					footerContent: (
						<ChatMessageInput
							onSend={(text, files) => onSendRef.current(text, files)}
							files={attachments}
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
		<div class='project-chat-island messages-container'>
			<div class='project-chat-island__messages'>
				{dataSource
					? (
						<ChatList
							dataSource={dataSource}
							optimisticItems={optimisticMsgs.value}
							renderItem={(item) => <ChatMessage message={item} onRetry={onRetry} />}
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
	);
}
