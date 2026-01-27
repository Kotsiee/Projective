import '@styles/components/dashboard/messages/message-input-attach.css';
import { IconPlus } from '@tabler/icons-preact';
import { useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';

interface ChatMessageInputAttachProps {
	onAttach?: () => void;
	onFilesSelected?: (files: File[]) => void;
}

export default function ChatMessageInputAttach(
	{ onAttach, onFilesSelected }: ChatMessageInputAttachProps,
) {
	const openAttachmentPopup = useSignal(false);
	const rootRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const root = rootRef.current;
			if (!root) return;
			if (root.contains(event.target as Node)) return;
			openAttachmentPopup.value = false;
		};

		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, []);

	const handleAttach = () => {
		if (onAttach) {
			onAttach();
		}
		openAttachmentPopup.value = false;
	};

	const handleDirectUpload = (e: any) => {
		const input = e.currentTarget;
		if (input.files && input.files.length > 0) {
			const selectedFiles = Array.from(input.files) as File[];
			if (onFilesSelected) {
				onFilesSelected(selectedFiles);
			}
			// Reset input so same file can be selected again if needed
			input.value = '';
			openAttachmentPopup.value = false;
		}
	};

	return (
		<div ref={rootRef} class='chat-message-input__attach'>
			<button
				type='button'
				class='chat-message-input__attach__button'
				title='Add attachment'
				data-open={openAttachmentPopup.value}
				onClick={() => openAttachmentPopup.value = !openAttachmentPopup.value}
			>
				<IconPlus />
			</button>

			{openAttachmentPopup.value && (
				<div class='chat-message-input__attach__attachment-popup'>
					<label>
						<input
							type='file'
							class='chat-message-input__attach__attachment-popup__file-input'
							onInput={handleDirectUpload}
							multiple
							hidden
						/>
						<span style={{ cursor: 'pointer' }}>Upload Files</span>
					</label>
					<button type='button' onClick={handleAttach}>Add from Storage</button>
				</div>
			)}
		</div>
	);
}
