import '@styles/components/dashboard/messages/message-input.css';
import { useState } from 'preact/hooks';
import { IconMicrophone, IconMoodSmileBeam, IconPlus, IconSend } from '@tabler/icons-preact';

interface ChatMessageInputProps {
	onSend?: (text: string) => void;
}

export default function ChatMessageInput({ onSend }: ChatMessageInputProps) {
	const [text, setText] = useState('');

	const handleSend = () => {
		if (!text.trim()) return;
		if (onSend) {
			onSend(text);
			setText('');
		}
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<div class='chat-message-input'>
			<button
				type='button'
				class='chat-btn'
				title='Add attachment'
				onClick={() => console.log('TODO: Open attachment popup')}
			>
				<IconPlus />
			</button>

			<input
				type='text'
				class='chat-message-input__input'
				placeholder='Type a message...'
				value={text}
				onInput={(e) => setText(e.currentTarget.value)}
				onKeyDown={handleKeyDown}
			/>

			<button
				type='button'
				class='chat-btn chat-btn--desktop-only'
				title='Add emoji'
				onClick={() => console.log('TODO: Open emoji picker')}
			>
				<IconMoodSmileBeam />
			</button>

			{text.trim()
				? (
					<button
						type='button'
						class='chat-btn chat-btn--primary'
						onClick={handleSend}
						title='Send message'
					>
						<IconSend />
					</button>
				)
				: (
					<button
						type='button'
						class='chat-btn chat-btn--voice'
						title='Hold to record'
						onMouseDown={() => console.log('Start recording')}
						onMouseUp={() => console.log('Stop recording')}
						onTouchStart={() => console.log('Start recording')}
						onTouchEnd={() => console.log('Stop recording')}
					>
						<IconMicrophone />
					</button>
				)}
		</div>
	);
}
