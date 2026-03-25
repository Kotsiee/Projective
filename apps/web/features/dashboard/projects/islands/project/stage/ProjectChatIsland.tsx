import '../../../styles/components/project/stage/chat/messages.css';
import ChatMessageInput from '../../../components/project/stage/chat/StageChatMessageInput.tsx';
import ChatMessage from '../../../components/project/stage/chat/StageChatMessage.tsx';
import { ChatMessageData, ChatNetworkSource } from './ChatNetworkSource.ts';
import { ChatList } from '@projective/data';
import { useStageContext } from '../../../contexts/StageContext.tsx';
import { getCsrfToken } from '@projective/utils';
import { useMemo, useRef } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { IconMessages } from '@tabler/icons-preact';

export default function ProjectChatIsland() {
	const { footer, stage, refresh } = useStageContext();

	const optimisticMsgs = useSignal<ChatMessageData[]>([]);
	const pendingUploads = useRef(new Map<string, { message: string; files: File[] }>());

	const dataSource = useMemo(() => {
		if (!stage?.value || !stage.value.channel_id) return null;
		return new ChatNetworkSource(stage.value.channel_id);
	}, [stage.value?.channel_id]);

	if (!stage?.value) return <div>Loading...</div>;

	const handleSend = async (message: string, files: File[], retryTempId?: string) => {
		const tempId = retryTempId || crypto.randomUUID();

		if (!retryTempId) {
			pendingUploads.current.set(tempId, { message, files });

			const newOpt: ChatMessageData = {
				id: tempId,
				tempId: tempId,
				text: message,
				timestamp: new Date().toISOString(),
				isSelf: true,
				sender: { id: 'me', name: 'Me' },
				attachments: files.map((f) => ({
					id: crypto.randomUUID(),
					name: f.name,
					type: f.type,
					size: f.size,
					url: URL.createObjectURL(f),
				})),
				status: 'sending',
			};
			optimisticMsgs.value = [...optimisticMsgs.value, newOpt];
		} else {
			optimisticMsgs.value = optimisticMsgs.value.map((m) =>
				m.tempId === tempId ? { ...m, status: 'sending' } : m
			);
		}

		try {
			const csrf = getCsrfToken();
			if (!csrf) throw new Error('Missing CSRF token');

			const formData = new FormData();
			if (message.trim()) formData.append('message', message);
			files.forEach((file) => formData.append('files', file));

			const targetChannel = stage.value?.channel_id || 'new';
			if (targetChannel === 'new') {
				formData.append('targetStageId', stage.value!.stage_id);
			}

			const res = await fetch(
				`/api/v1/dashboard/comms/channels/${targetChannel}/messages?type=channel`,
				{ method: 'POST', headers: { 'X-CSRF': csrf }, body: formData },
			);

			if (!res.ok) throw new Error('Failed to send');
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

	const onSend = (msg: string, files: File[]) => handleSend(msg, files);

	const onRetry = (tempId: string) => {
		const data = pendingUploads.current.get(tempId);
		if (data) handleSend(data.message, data.files, tempId);
	};

	footer.value = (
		<div class='project-chat-island__input messages__input'>
			<ChatMessageInput onSend={onSend} />
		</div>
	);

	return (
		<div
			class='project-chat-island messages-container'
			style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
		>
			<div
				class='project-chat-island__messages'
				style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
			>
				{dataSource
					? (
						<ChatList
							dataSource={dataSource}
							optimisticItems={optimisticMsgs.value}
							renderItem={(item) => <ChatMessage message={item} onRetry={onRetry} />}
							estimateHeight={120}
							pageSize={20}
							scrollMode='container'
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
							<IconMessages size={48} opacity={0.2} />
							<span>No messages yet. Send a message to start the conversation!</span>
						</div>
					)}
			</div>
		</div>
	);
}
