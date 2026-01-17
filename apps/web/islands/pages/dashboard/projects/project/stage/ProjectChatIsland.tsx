import ChatMessageInput from '@components/dashboard/projects/project/stage/StageChatMessageInput.tsx';
import ChatMessage from '@components/dashboard/projects/project/stage/StageChatMessage.tsx';
import { ChatNetworkSource } from './ChatNetworkSource.ts';

import '@styles/components/dashboard/messages/messages.css';
import { ChatList } from '@projective/data';
import { useStageContext } from '@contexts/StageContext.tsx';
import { getCsrfToken } from '@projective/shared';

export default function ProjectChatIsland() {
	const { stage } = useStageContext();

	if (stage === null || stage.value === null) {
		return <div>Loading...</div>;
	}

	const dataSource = new ChatNetworkSource(stage!.value!.channel_id);

	const onSend = (message: string) => {
		try {
			const csrf = getCsrfToken();

			if (!csrf) {
				return;
			}

			fetch(`/api/v1/dashboard/comms/channels/${stage.value?.channel_id}/messages?type=channel`, {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					'X-CSRF': csrf,
				},
				body: JSON.stringify({ message }),
			});
		} catch (err) {
			console.error('Failed to send message:', err);
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
				<ChatMessageInput onSend={onSend} />
			</div>
		</div>
	);
}
