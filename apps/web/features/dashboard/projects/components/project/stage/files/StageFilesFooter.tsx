/* #region Imports */
import { JSX } from 'preact';
import { Button } from '@projective/ui';
import { IconFile, IconFileText, IconFileZip, IconMusic, IconVideo } from '@tabler/icons-preact';
import '../../../../styles/components/project/stage/files/message-files-footer.css';
import {
	ChatMessageAttachment,
	ChatMessageData,
} from '../../../../islands/project/stage/ChatNetworkSource.ts';
/* #endregion */

/* #region Interfaces */
/**
 * Props for the StageFilesFooter component.
 */
export interface StageFilesFooterProps {
	/** The currently selected attachment. Null if nothing is selected. */
	attachment: ChatMessageAttachment | null;
	/** The message context for the selected attachment. */
	message: ChatMessageData | null;
	/** The destination URL for opening the file */
	openUrl?: string;
}
/* #endregion */

/* #region Helpers */
const formatFileType = (mimeType: string, filename: string): string => {
	if (!mimeType) {
		const ext = filename.split('.').pop()?.toUpperCase() || '';
		return ext ? `${ext} File` : 'File';
	}
	if (mimeType.includes('png')) return 'PNG Image';
	if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'JPEG Image';
	if (mimeType.includes('pdf')) return 'PDF Document';
	return 'File';
};
/* #endregion */

/* #region Component */
/**
 * @function StageFilesFooter
 * @description Displays a detailed footer panel for a selected file/attachment in the stage view.
 * @param {StageFilesFooterProps} props - The component properties.
 * @returns {JSX.Element | null}
 */
export default function StageFilesFooter(
	{ attachment, message, openUrl }: StageFilesFooterProps,
): JSX.Element | null {
	if (!attachment || !message) return null;

	const dateObj = new Date(message.timestamp);
	const dateStr = dateObj.toLocaleDateString('en-US');
	const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
		.toLowerCase();

	const typeLabel = formatFileType(attachment.type, attachment.name);
	const mimeType = attachment.type?.toLowerCase() || '';
	const isImage = mimeType.startsWith('image/');

	const renderFallbackIcon = () => {
		if (mimeType.startsWith('video/')) return <IconVideo size={64} stroke={1.5} />;
		if (mimeType.startsWith('audio/')) return <IconMusic size={64} stroke={1.5} />;
		if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('rar')) {
			return <IconFileZip size={64} stroke={1.5} />;
		}
		if (mimeType.startsWith('text/') || mimeType.includes('pdf') || mimeType.includes('document')) {
			return <IconFileText size={64} stroke={1.5} />;
		}
		return <IconFile size={64} stroke={1.5} />;
	};

	return (
		<div class='stage-files-footer'>
			<div class='stage-files-footer__preview-container'>
				{isImage
					? (
						<img
							src={attachment.url}
							class='stage-files-footer__preview'
							alt={attachment.name || 'Selected file preview'}
						/>
					)
					: (
						<div class='stage-files-footer__preview-fallback'>
							{renderFallbackIcon()}
						</div>
					)}
			</div>

			<div class='stage-files-footer__details'>
				<div class='stage-files-footer__header'>
					<h3 class='stage-files-footer__title'>{attachment.name || 'Unnamed File'}</h3>
					<p class='stage-files-footer__meta'>
						{typeLabel} <br />
						{dateStr} - {timeStr}
					</p>
				</div>

				<hr class='stage-files-footer__divider' />

				<div class='stage-files-footer__message'>
					{message.text && <p class='stage-files-footer__message-text'>{message.text}</p>}

					<div class='stage-files-footer__actions'>
						<Button variant='primary' href={openUrl} f-partial={openUrl}>
							Open
						</Button>
						<Button variant='secondary'>
							Download
						</Button>
						<Button variant='secondary'>
							Properties
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
/* #endregion */
