import '@styles/components/dashboard/messages/message-input.css';
import { useState } from 'preact/hooks';
import { IconFile, IconMicrophone, IconMoodSmileBeam, IconSend, IconX } from '@tabler/icons-preact';
import ChatMessageInputAttach from './StageChatMessageInputAttach.tsx';

interface ChatMessageInputProps {
	onSend?: (text: string, files: File[]) => void;
	disabled?: boolean;
}

export default function ChatMessageInput({ onSend, disabled }: ChatMessageInputProps) {
	const [text, setText] = useState('');
	const [files, setFiles] = useState<File[]>([]);

	const handleSend = () => {
		if (disabled) return;
		if (!text.trim() && files.length === 0) return;

		if (onSend) {
			onSend(text, files);
			// Reset state
			setText('');
			setFiles([]);
		}
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const addFiles = (newFiles: File[]) => {
		setFiles((prev) => [...prev, ...newFiles]);
	};

	const removeFile = (indexToRemove: number) => {
		setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
	};

	return (
		<div
			class='chat-message-input-wrapper'
			style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '0.5rem' }}
		>
			{/* Attachment Preview Area */}
			{files.length > 0 && (
				<div
					class='chat-message-attachments'
					style={{ display: 'flex', gap: '0.5rem', padding: '0 0.5rem', flexWrap: 'wrap' }}
				>
					{files.map((file, index) => (
						<div
							key={index}
							class='attachment-preview'
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '0.5rem',
								background: 'var(--bg-surface, #fff)',
								border: '1px solid var(--border-subtle, #e5e7eb)',
								borderRadius: '0.5rem',
								padding: '0.25rem 0.5rem',
								fontSize: '0.85rem',
							}}
						>
							<IconFile size={16} class='text-muted' />
							<span
								style={{
									maxWidth: '150px',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap',
								}}
							>
								{file.name}
							</span>
							<button
								type='button'
								onClick={() => removeFile(index)}
								style={{
									border: 'none',
									background: 'transparent',
									cursor: 'pointer',
									display: 'flex',
									padding: 0,
								}}
								title='Remove attachment'
							>
								<IconX size={14} />
							</button>
						</div>
					))}
				</div>
			)}

			<div class='chat-message-input'>
				<ChatMessageInputAttach
					onAttach={() => console.log('Open storage picker')}
					onFilesSelected={addFiles}
				/>

				<input
					type='text'
					class='chat-message-input__input'
					placeholder='Type a message...'
					value={text}
					onInput={(e) => setText(e.currentTarget.value)}
					onKeyDown={handleKeyDown}
					disabled={disabled}
				/>

				<button
					type='button'
					class='chat-btn chat-btn--desktop-only'
					title='Add emoji'
					onClick={() => console.log('TODO: Open emoji picker')}
				>
					<IconMoodSmileBeam />
				</button>

				{text.trim() || files.length > 0
					? (
						<button
							type='button'
							class='chat-btn chat-btn--primary'
							onClick={handleSend}
							title='Send message'
							disabled={disabled}
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
						>
							<IconMicrophone />
						</button>
					)}
			</div>
		</div>
	);
}
