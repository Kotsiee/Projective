import '../../../../styles/components/project/stage/chat/message-input.css';
import {
	IconMicrophone,
	IconPlayerRecord,
	IconPlus,
	IconSend,
	IconSquare,
	IconTrash,
	IconX,
} from '@tabler/icons-preact';
import { Signal, useSignal } from '@preact/signals';
import { FileTypeIcon, IconButton } from '@projective/ui';
import { formatFileSize } from '@projective/data';
import { UploadFileIsland } from '@features/shared/components/overlay/UploadFile.tsx';
import { FileWithMeta } from '@projective/types';
import { useMemo, useRef } from 'preact/hooks';
import AudioMessageInputVisualizer from './AudioMessageInput.tsx';
import { ChatMessageData } from '@features/dashboard/projects/islands/project/stage/ChatNetworkSource.ts';
import {
	AudioRecorderResult,
	AudioRecorderService,
} from '@features/shared/services/comms/audioRecorderService.ts';

type RecordingState = 'idle' | 'pressing' | 'locked';

interface ChatMessageInputProps {
	onSend: (text: string, files: FileWithMeta[]) => void;
	files: Signal<FileWithMeta[]>;
	/** The message currently being replied to, if any. */
	replyingTo?: Signal<ChatMessageData | null>;
	onCancelReply?: () => void;
}

export default function ChatMessageInput(
	{ onSend, files, replyingTo, onCancelReply }: ChatMessageInputProps,
) {
	const text = useSignal('');
	const isUploadFileOpen = useSignal(false);

	const audioRecorder = useMemo(() => new AudioRecorderService(), []);
	const recordingState = useSignal<RecordingState>('idle');
	const liveStream = useSignal<MediaStream | null>(null);
	const recordedAudio = useSignal<AudioRecorderResult | null>(null);
	const pointerDownTime = useRef<number>(0);

	const resetAudioState = () => {
		recordingState.value = 'idle';
		liveStream.value = null;
		recordedAudio.value = null;
	};

	const handleSend = () => {
		const payloadFiles = [...files.value];

		// If there is an audio message, bundle it with the other attachments
		if (recordedAudio.value) {
			const audioFile: FileWithMeta = {
				id: crypto.randomUUID(),
				file: recordedAudio.value.file,
				type: 'Audio',
				status: 'error',
				progress: 0,
				errors: [],
			};
			payloadFiles.push(audioFile);
		}

		if (!text.value.trim() && payloadFiles.length === 0) return;

		onSend(text.value, payloadFiles);

		text.value = '';
		files.value = [];
		resetAudioState();
	};

	const handleDiscardAudio = () => {
		audioRecorder.cancel();
		resetAudioState();
	};

	const handleRemoveFile = (idToRemove: string) => {
		files.value = files.value.filter((f) => f.id !== idToRemove);
	};

	// --- Recording Interaction Logic ---
	const startRecording = async () => {
		await audioRecorder.start();
		liveStream.value = audioRecorder.stream;
	};

	const stopRecording = async () => {
		const result = await audioRecorder.stop();
		liveStream.value = null;
		if (result) recordedAudio.value = result;

		recordingState.value = 'idle';
	};

	const handleRecordPointerDown = async (e: PointerEvent) => {
		if (e.button !== 0 && e.pointerType === 'mouse') return;
		if (recordingState.value === 'locked') return;

		const target = e.currentTarget as HTMLElement;
		target.setPointerCapture(e.pointerId);
		pointerDownTime.current = Date.now();
		recordingState.value = 'pressing';

		await startRecording();
	};

	const handleRecordPointerUp = async (e: PointerEvent) => {
		const target = e.currentTarget as HTMLElement;
		if (target.hasPointerCapture(e.pointerId)) {
			target.releasePointerCapture(e.pointerId);
		}

		if (recordingState.value === 'locked') {
			await stopRecording();
			return;
		}

		if (recordingState.value === 'pressing') {
			const duration = Date.now() - pointerDownTime.current;
			if (duration < 250) {
				recordingState.value = 'locked';
			} else {
				await stopRecording();
			}
		}
	};

	const isRecording = recordingState.value !== 'idle';
	const hasRecordedAudio = recordedAudio.value !== null;
	const isAudioActive = isRecording || hasRecordedAudio;

	const replyTarget = replyingTo?.value ?? null;

	return (
		<div class='chat-message-input'>
			{replyTarget && (
				<div class='chat-message-input__reply'>
					<div class='chat-message-input__reply-body'>
						<span class='chat-message-input__reply-label'>
							Replying to {replyTarget.sender.name}
						</span>
						<span class='chat-message-input__reply-snippet'>
							{replyTarget.text?.trim() || replyTarget.attachments?.[0]?.name || 'Attachment'}
						</span>
					</div>
					<IconButton
						aria-label='Cancel reply'
						variant='secondary'
						ghost
						rounded
						size='small'
						onClick={() => onCancelReply?.()}
					>
						<IconX size={16} />
					</IconButton>
				</div>
			)}

			{files.value.length > 0 && !isAudioActive && (
				<div class='chat-message-input__attachments'>
					{files.value.map((f) => (
						<div key={f.id} class='chat-attach-chip' title={f.file.name}>
							<FileTypeIcon
								name={f.file.name}
								mimeType={f.file.type}
								category={f.type}
								size={30}
							/>
							<div class='chat-attach-chip__info'>
								<span class='chat-attach-chip__name'>{f.file.name}</span>
								<span class='chat-attach-chip__meta'>{formatFileSize(f.file.size)}</span>
							</div>
							<button
								type='button'
								class='chat-attach-chip__remove'
								aria-label='Remove attachment'
								onClick={() => handleRemoveFile(f.id as string)}
							>
								<IconX size={14} />
							</button>
						</div>
					))}
				</div>
			)}

			<div class='chat-message-input__content'>
				<div
					class='chat-message-input__left'
					style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
				>
					<IconButton
						aria-label='Add attachment'
						variant='secondary'
						rounded
						onClick={() => isUploadFileOpen.value = true}
						disabled={isRecording}
					>
						<IconPlus size={18} />
					</IconButton>
					{hasRecordedAudio && (
						<IconButton
							aria-label='Discard message'
							variant='danger'
							ghost={true}
							rounded
							onClick={handleDiscardAudio}
						>
							<IconTrash size={18} />
						</IconButton>
					)}
				</div>

				<div class='chat-message-input__input-wrapper'>
					{isAudioActive
						? (
							<AudioMessageInputVisualizer
								stream={liveStream.value}
								audioBlob={recordedAudio.value?.blob || null}
							/>
						)
						: (
							<input
								type='text'
								class='chat-message-input__input'
								placeholder='Type a message...'
								value={text.value}
								onInput={(e) => text.value = e.currentTarget.value}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										handleSend();
									}
								}}
							/>
						)}
				</div>

				<div class='chat-message-input__right'>
					{hasRecordedAudio || (text.value.trim() || files.value.length > 0) && !isRecording
						? (
							<IconButton
								aria-label='Send'
								ghost={false}
								variant='primary'
								rounded
								onClick={handleSend}
							>
								<IconSend size={18} />
							</IconButton>
						)
						: (
							<div
								style={{ display: 'flex', touchAction: 'none', userSelect: 'none' }}
								onPointerDown={handleRecordPointerDown}
								onPointerUp={handleRecordPointerUp}
								onPointerCancel={handleRecordPointerUp}
							>
								<IconButton
									aria-label={isRecording ? 'Stop Recording' : 'Record'}
									variant={isRecording ? 'danger' : 'secondary'}
									rounded
									onClick={(e: Event) => e.preventDefault()}
								>
									{recordingState.value === 'locked'
										? <IconSquare size={18} />
										: recordingState.value === 'pressing'
										? <IconPlayerRecord size={18} />
										: <IconMicrophone size={18} />}
								</IconButton>
							</div>
						)}
				</div>
			</div>

			<UploadFileIsland
				isOpen={isUploadFileOpen.value}
				onClose={() => isUploadFileOpen.value = false}
				multiple={true}
				onConfirm={(selectedFiles) => {
					const newFiles = [...files.value];
					for (const file of selectedFiles) {
						if (!newFiles.some((f) => f.id === file.id)) newFiles.push(file);
					}
					files.value = newFiles;
				}}
			/>
		</div>
	);
}
