/**
 * @file StageChatMessage.tsx
 * @description A single chat message in the stage chat tab. Handles burst
 * grouping (avatar + header shown once per burst), left/right alignment by
 * author, a hover action toolbar (reply / react / copy / delete), threaded
 * reply indicators, emoji reactions, and rich media attachments (image,
 * pill-shaped audio player, generic file) that open in the shared media
 * lightbox. Dumb component: all persistence is delegated to the island via
 * callbacks (see documentation/business/brain2.md — dumb components).
 */

import { useSignal } from '@preact/signals';
import {
	IconArrowBackUp,
	IconCopy,
	IconMoodSmile,
	IconPhoto,
	IconTrash,
} from '@tabler/icons-preact';
import {
	AudioPlayer,
	Avatar,
	FileTypeIcon,
	type LightboxMedia,
	PiiNotice,
	Popover,
	toast,
} from '@projective/ui';
import { formatFileSize } from '@projective/data';
import {
	ChatMessageAttachment,
	ChatMessageData,
	ChatMessageReaction,
} from '../../../../islands/project/stage/ChatNetworkSource.ts';
import { useMediaViewer } from '../../../../contexts/MediaViewerContext.tsx';

// #region Types
interface ChatMessageProps {
	message: ChatMessageData;
	/** First message of a same-author burst → render avatar + header. */
	isFirstInBurst: boolean;
	/** Last message of a burst → apply trailing spacing. */
	isLastInBurst: boolean;
	onRetry?: (tempId: string) => void;
	onReply?: (message: ChatMessageData) => void;
	onDelete?: (message: ChatMessageData) => void;
}
// #endregion

// #region Helpers
const QUICK_REACTIONS = ['👍', '❤️', '😂', '🎉', '🙌', '👀'];

function formatTime(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return '';
	return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function isImageAttachment(att: ChatMessageAttachment): boolean {
	return att.type.startsWith('image/') || att.type === 'Image';
}

function isAudioAttachment(att: ChatMessageAttachment): boolean {
	return att.type.startsWith('audio/') || att.type === 'Audio' ||
		/\.(webm|mp3|wav|ogg|m4a|aac|flac)$/i.test(att.name);
}

function toLightboxMedia(att: ChatMessageAttachment, message: ChatMessageData): LightboxMedia {
	return {
		url: att.url,
		name: att.name,
		type: att.type,
		size: att.size,
		uploadedAt: message.timestamp,
		senderName: message.sender.name,
	};
}
// #endregion

// #region Attachments
function MessageAttachments(
	{ message, onDelete }: { message: ChatMessageData; onDelete?: (m: ChatMessageData) => void },
) {
	const viewer = useMediaViewer();
	const attachments = message.attachments ?? [];
	if (attachments.length === 0) return null;

	const openInViewer = (att: ChatMessageAttachment) => {
		if (!att.url) return;
		viewer.open(toLightboxMedia(att, message), {
			onDelete: message.isSelf && onDelete ? () => onDelete(message) : undefined,
		});
	};

	return (
		<div class='chat-msg__attachments'>
			{attachments.map((att) => {
				// Audio plays inline; the play control lives inside the pill.
				if (isAudioAttachment(att) && att.url) {
					return <AudioPlayer key={att.id} src={att.url} className='chat-msg__audio' />;
				}

				if (isImageAttachment(att) && att.url) {
					return (
						<button
							key={att.id}
							type='button'
							class='chat-attach chat-attach--image'
							onClick={() => openInViewer(att)}
						>
							<img
								class='chat-attach__img'
								src={att.url}
								alt={att.name}
								loading='lazy'
								onError={(e) => ((e.currentTarget as HTMLImageElement).style.opacity = '0.2')}
							/>
							<span class='chat-attach__strip'>
								<IconPhoto size={14} />
								<span class='chat-attach__strip-name' title={att.name}>{att.name}</span>
							</span>
						</button>
					);
				}

				// Generic file chip — colour-coded to match the Files tab.
				return (
					<button
						key={att.id}
						type='button'
						class='chat-attach chat-attach--file'
						onClick={() => openInViewer(att)}
					>
						<FileTypeIcon name={att.name} mimeType={att.type} size={34} />
						<span class='chat-attach__file-info'>
							<span class='chat-attach__file-name' title={att.name}>{att.name}</span>
							{att.size > 0 && (
								<span class='chat-attach__file-meta'>{formatFileSize(att.size)}</span>
							)}
						</span>
					</button>
				);
			})}
		</div>
	);
}
// #endregion

/**
 * @function ChatMessage
 * @description Renders one message row per the redesigned dark chat spec.
 */
export default function ChatMessage(
	{ message, isFirstInBurst, isLastInBurst, onRetry, onReply, onDelete }: ChatMessageProps,
) {
	const emojiOpen = useSignal(false);
	const hidden = useSignal(false);
	const reactions = useSignal<ChatMessageReaction[]>(message.reactions ?? []);

	const isSelf = message.isSelf;
	const isSending = message.status === 'sending';
	const isError = message.status === 'error';
	const hasText = !!message.text?.trim();

	// #region Actions
	const handleCopy = async () => {
		const text = message.text?.trim() ||
			(message.attachments ?? []).map((a) => a.name).join(', ');
		try {
			await navigator.clipboard.writeText(text);
			toast.success('Copied to clipboard');
		} catch {
			toast.error('Unable to copy');
		}
	};

	const handleDelete = () => {
		hidden.value = true;
		onDelete?.(message);
	};

	const addReaction = (emoji: string) => {
		emojiOpen.value = false;
		const existing = reactions.value.find((r) => r.emoji === emoji);
		if (existing) {
			reactions.value = reactions.value
				.map((r) =>
					r.emoji === emoji
						? {
							...r,
							reactedByMe: !r.reactedByMe,
							count: r.count + (r.reactedByMe ? -1 : 1),
						}
						: r
				)
				.filter((r) => r.count > 0);
		} else {
			reactions.value = [...reactions.value, { emoji, count: 1, reactedByMe: true }];
		}
	};
	// #endregion

	if (hidden.value) return null;

	const showHeader = isFirstInBurst && !isSelf;

	const rowClasses = [
		'chat-msg',
		isSelf ? 'chat-msg--self' : 'chat-msg--other',
		isFirstInBurst ? 'chat-msg--lead' : 'chat-msg--grouped',
		isLastInBurst && 'chat-msg--tail',
		isSending && 'chat-msg--sending',
	].filter(Boolean).join(' ');

	return (
		<div class={rowClasses}>
			{/* Avatar gutter (other users only) */}
			{!isSelf && (
				<div class='chat-msg__gutter'>
					{isFirstInBurst
						? <Avatar name={message.sender.name} src={message.sender.avatarUrl} size={36} />
						: <span class='chat-msg__hovertime'>{formatTime(message.timestamp)}</span>}
				</div>
			)}

			<div class='chat-msg__col'>
				{showHeader && (
					<div class='chat-msg__header'>
						<span class='chat-msg__author'>{message.sender.name}</span>
						<span class='chat-msg__time'>{formatTime(message.timestamp)}</span>
					</div>
				)}

				{/* Reply context indicator */}
				{message.replyTo && (
					<div class='chat-msg__reply'>
						<IconArrowBackUp size={13} />
						<span class='chat-msg__reply-author'>{message.replyTo.senderName}</span>
						<span class='chat-msg__reply-snippet'>{message.replyTo.snippet}</span>
					</div>
				)}

				<div class={`chat-msg__block ${emojiOpen.value ? 'is-menu-open' : ''}`}>
					<div class='chat-msg__bubble'>
						<MessageAttachments message={message} onDelete={onDelete} />
						{hasText && <div class='chat-msg__text'>{message.text}</div>}
						{message.piiMasked && (
							<PiiNotice categories={message.piiCategories} compact />
						)}
						{isSelf && <span class='chat-msg__self-time'>{formatTime(message.timestamp)}</span>}
					</div>

					{/* Floating hover toolbar */}
					<div class='chat-msg__toolbar' role='toolbar' aria-label='Message actions'>
						<button
							type='button'
							class='chat-msg__tool'
							aria-label='Reply'
							onClick={() => onReply?.(message)}
						>
							<IconArrowBackUp size={16} />
						</button>

						<Popover
							isOpen={emojiOpen.value}
							onClose={() => (emojiOpen.value = false)}
							position={isSelf ? 'bottom-right' : 'bottom-left'}
							className='chat-msg__emoji-popover'
							trigger={
								<button
									type='button'
									class='chat-msg__tool'
									aria-label='Add reaction'
									onClick={() => (emojiOpen.value = !emojiOpen.value)}
								>
									<IconMoodSmile size={16} />
								</button>
							}
							content={
								<div class='chat-msg__emoji-grid'>
									{QUICK_REACTIONS.map((e) => (
										<button
											key={e}
											type='button'
											class='chat-msg__emoji'
											onClick={() => addReaction(e)}
										>
											{e}
										</button>
									))}
								</div>
							}
						/>

						<button
							type='button'
							class='chat-msg__tool'
							aria-label='Copy text'
							onClick={handleCopy}
						>
							<IconCopy size={16} />
						</button>

						{isSelf && (
							<button
								type='button'
								class='chat-msg__tool chat-msg__tool--danger'
								aria-label='Delete message'
								onClick={handleDelete}
							>
								<IconTrash size={16} />
							</button>
						)}
					</div>
				</div>

				{/* Reactions */}
				{reactions.value.length > 0 && (
					<div class='chat-msg__reactions'>
						{reactions.value.map((r) => (
							<button
								key={r.emoji}
								type='button'
								class={`chat-msg__reaction ${r.reactedByMe ? 'is-mine' : ''}`}
								onClick={() => addReaction(r.emoji)}
							>
								<span>{r.emoji}</span>
								<span class='chat-msg__reaction-count'>{r.count}</span>
							</button>
						))}
					</div>
				)}

				{/* Status */}
				{isSending && <div class='chat-msg__status'>Sending…</div>}
				{isError && (
					<div class='chat-msg__status chat-msg__status--error'>
						Failed to send
						<button
							type='button'
							class='chat-msg__retry'
							onClick={() => onRetry?.(message.tempId!)}
						>
							Retry
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
