import ChatMessageInput from '@components/dashboard/projects/project/stage/StageChatMessageInput.tsx';
import ChatMessage from '@components/dashboard/projects/project/stage/StageChatMessage.tsx';
import { ChatNetworkSource } from './ChatNetworkSource.ts';
import '@styles/components/dashboard/messages/messages.css';
import { ChatList } from '@projective/data';
import { useStageContext } from '@contexts/StageContext.tsx';
import { getCsrfToken } from '@projective/shared';
import { useMemo, useState } from 'preact/hooks';

export default function ProjectChatIsland() {
	const { stage } = useStageContext();
	const [isSending, setIsSending] = useState(false);

	const dataSource = useMemo(() => {
		if (!stage?.value || !stage.value.channel_id) return null;
		return new ChatNetworkSource(stage.value.channel_id);
	}, [stage.value?.channel_id]);

	if (!stage?.value || !stage.value.channel_id || !dataSource) return <div>Loading...</div>;

	const onSend = async (message: string, files: File[]) => {
		if (isSending) return;
		setIsSending(true);

		try {
			const csrf = getCsrfToken();
			if (!csrf) return;

			// Create FormData to send text + binary files in one request
			const formData = new FormData();

			if (message.trim()) {
				formData.append('message', message);
			}

			files.forEach((file) => {
				formData.append('files', file);
			});

			// Note: We don't set 'Content-Type': 'multipart/form-data' explicitly here.
			// The browser sets it automatically with the correct boundary when passing FormData.
			const res = await fetch(
				`/api/v1/dashboard/comms/channels/${stage.value?.channel_id}/messages?type=channel`,
				{
					method: 'POST',
					headers: {
						'X-CSRF': csrf,
					},
					body: formData,
				},
			);

			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				console.error('Failed to send message:', err);
				alert('Failed to send message. Please try again.');
			}

			// Input clears itself via callback in StageChatMessageInput
		} catch (err) {
			console.error('Failed to send message:', err);
			alert('Network error. Please try again.');
		} finally {
			setIsSending(false);
		}
	};

	return (
		<div class='project-chat-island messages-container'>
			<div class='project-chat-island__messages'>
				<ChatList
					dataSource={dataSource}
					renderItem={(item) => <ChatMessage message={item} />}
					estimateHeight={120}
					pageSize={20}
				/>
			</div>

			<div class='project-chat-island__input messages__input'>
				<ChatMessageInput onSend={onSend} disabled={isSending} />
			</div>
		</div>
	);
}
