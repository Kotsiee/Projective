/* #region Imports */
import { JSX } from 'preact';
import { IconFile, IconFileText, IconFileZip, IconMusic, IconVideo } from '@tabler/icons-preact';
import '../../../../styles/components/project/stage/files/message-files-item.css';
import {
	ChatMessageAttachment,
	ChatMessageData,
} from '../../../../islands/project/stage/ChatNetworkSource.ts';
/* #endregion */

/* #region Interfaces */
/**
 * Props for the StageFilesItem component.
 */
export interface StageFilesItemProps {
	/** The attachment data to render. */
	attachment: ChatMessageAttachment;
	/** The parent chat message containing context like timestamp. */
	message: ChatMessageData;
	/** Indicates if the current file is actively selected. */
	isSelected?: boolean;
	/** The destination URL for opening the file */
	openUrl?: string;
	/** Callback fired when the item is clicked or activated. */
	onAction: (e: Event) => void;
}
/* #endregion */

/* #region Component */
/**
 * @function StageFilesItem
 * @description Renders a selectable grid item for a file shared in a stage chat.
 * @param {StageFilesItemProps} props - Component properties.
 * @returns {JSX.Element}
 */
export function StageFilesItem(
	{ attachment, message, isSelected, openUrl, onAction }: StageFilesItemProps,
): JSX.Element {
	const dateObj = new Date(message.timestamp);
	const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

	const mimeType = attachment.type?.toLowerCase() || '';
	const isImage = mimeType.startsWith('image/');
	const ext = attachment.name?.split('.').pop()?.toUpperCase() || 'FILE';

	const renderFallbackIcon = () => {
		if (mimeType.startsWith('video/')) return <IconVideo size={42} stroke={1.5} />;
		if (mimeType.startsWith('audio/')) return <IconMusic size={42} stroke={1.5} />;
		if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('rar')) {
			return <IconFileZip size={42} stroke={1.5} />;
		}
		if (mimeType.startsWith('text/') || mimeType.includes('pdf') || mimeType.includes('document')) {
			return <IconFileText size={42} stroke={1.5} />;
		}
		return <IconFile size={42} stroke={1.5} />;
	};

	return (
		<a
			class={`stage-files-item ${isSelected ? 'stage-files-item--selected' : ''}`}
			href={openUrl}
			f-partial={openUrl}
			onClick={onAction}
			role='button'
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					onAction(e);
				}
			}}
		>
			<div class='stage-files-item__preview-container'>
				{isImage
					? (
						<img
							src={attachment.url}
							class='stage-files-item__preview'
							alt={attachment.name || 'File preview'}
							loading='lazy'
						/>
					)
					: (
						<div class='stage-files-item__fallback'>
							{renderFallbackIcon()}
							<span class='stage-files-item__fallback-ext'>{ext}</span>
						</div>
					)}
			</div>
			<div class='stage-files-item__details'>
				<span class='stage-files-item__name' title={attachment.name}>
					{attachment.name || 'Unnamed File'}
				</span>
				<span class='stage-files-item__date'>
					{dateStr}
				</span>
			</div>
		</a>
	);
}
/* #endregion */
