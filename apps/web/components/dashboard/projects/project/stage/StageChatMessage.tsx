import { ChatMessageData } from '@islands/pages/dashboard/projects/project/stage/ChatNetworkSource.ts';

interface ChatMessageProps {
	message: ChatMessageData;
}

export default function ChatMessage({ message }: ChatMessageProps) {
	const isSelf = message.isSelf;

	return (
		<div
			style={{
				display: 'flex',
				justifyContent: isSelf ? 'flex-end' : 'flex-start',
				padding: '8px 16px',
				width: '100%',
				boxSizing: 'border-box',
			}}
		>
			<div
				style={{
					maxWidth: '70%',
					backgroundColor: isSelf ? 'var(--primary-500, #3b82f6)' : 'var(--gray-200, #e5e7eb)',
					color: isSelf ? 'white' : 'var(--text-primary, #111827)',
					borderRadius: '12px',
					borderBottomRightRadius: isSelf ? '2px' : '12px',
					borderBottomLeftRadius: isSelf ? '12px' : '2px',
					padding: '10px 14px',
					boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
				}}
			>
				<div style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
					{message.text}
				</div>
				<div
					style={{
						fontSize: '0.7rem',
						marginTop: '4px',
						opacity: 0.8,
						textAlign: 'right',
					}}
				>
					{new Date(message.timestamp).toLocaleTimeString([], {
						hour: '2-digit',
						minute: '2-digit',
					})}
				</div>
			</div>
		</div>
	);
}
