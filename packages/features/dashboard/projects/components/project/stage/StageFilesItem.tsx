/* #region Imports */
import { JSX } from 'preact';
import '../../../styles/components/project/stage/files/message-files-item.css';
import {
	ChatMessageAttachment,
	ChatMessageData,
} from '../../../islands/project/stage/ChatNetworkSource.ts';
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
	/** Callback fired when the item is clicked. */
	onClick?: () => void;
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
	{ attachment, message, isSelected, onClick }: StageFilesItemProps,
): JSX.Element {
	// Format the date to "Jan 16" style
	const dateObj = new Date(message.timestamp);
	const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

	return (
		<div
			class={`stage-files-item ${isSelected ? 'stage-files-item--selected' : ''}`}
			onClick={onClick}
			role='button'
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					onClick?.();
				}
			}}
		>
			<div class='stage-files-item__preview-container'>
				<img
					src={attachment.url}
					class='stage-files-item__preview'
					alt={attachment.name || 'File preview'}
					loading='lazy'
				/>
			</div>
			<div class='stage-files-item__details'>
				<span class='stage-files-item__name' title={attachment.name}>
					{attachment.name || 'Unnamed File'}
				</span>
				<span class='stage-files-item__date'>
					{dateStr}
				</span>
			</div>
		</div>
	);
}
/* #endregion */
