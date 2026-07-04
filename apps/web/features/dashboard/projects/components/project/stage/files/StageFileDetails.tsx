/* #region Imports */
import { JSX } from 'preact';
import { formatFileSize, formatShortDate, type StageFileEntry } from '@projective/data';
import { IconButton } from '@projective/ui';
import { IconArrowsMaximize, IconDownload, IconMessageCircle, IconX } from '@tabler/icons-preact';
import { getFileVisual, renderFileIcon } from './StageFileVisuals.tsx';
/* #endregion */

/* #region Interfaces */
export interface StageFileDetailsProps {
	/** The file the inspector is describing. */
	entry: StageFileEntry;
	/** Opens the full-view modal (double-click equivalent). */
	onOpenFull: (entry: StageFileEntry) => void;
	/** Jumps to the originating chat message, when known. */
	onJump?: (entry: StageFileEntry) => void;
	/** Collapses the inspector. */
	onClose: () => void;
}
/* #endregion */

/* #region Component */
/**
 * @function StageFileDetails
 * @description The slide-out right-hand inspector for the Files tab. Mirrors the
 * packaged UploadFile details column: a preview, a metadata block, and the
 * primary actions (open full view, jump to source, download).
 */
export function StageFileDetails(
	{ entry, onOpenFull, onJump, onClose }: StageFileDetailsProps,
): JSX.Element {
	const visual = getFileVisual(entry);
	const isImage = entry.category === 'image' && !!entry.url;

	return (
		<div class='stage-file-details'>
			<header class='stage-file-details__head'>
				<span class='stage-file-details__eyebrow'>Details</span>
				<IconButton ghost size='small' aria-label='Close details' onClick={onClose}>
					<IconX size={18} />
				</IconButton>
			</header>

			<button
				type='button'
				class='stage-file-details__preview'
				onClick={() => onOpenFull(entry)}
				title='Open full view'
			>
				{isImage
					? <img src={entry.url} class='stage-file-details__image' alt={entry.name} />
					: (
						<div class={`stage-file-card__icon stage-file-card__icon--${visual.tone}`}>
							{renderFileIcon(visual.tone, 56)}
						</div>
					)}
				<span class='stage-file-details__expand'>
					<IconArrowsMaximize size={16} /> Open full view
				</span>
			</button>

			<h3 class='stage-file-details__name' title={entry.name}>{entry.name}</h3>

			<dl class='stage-file-details__meta'>
				<div class='stage-file-details__row'>
					<dt>Type</dt>
					<dd>{entry.extension?.toUpperCase() || entry.mimeType || '—'}</dd>
				</div>
				<div class='stage-file-details__row'>
					<dt>Size</dt>
					<dd>{formatFileSize(entry.size)}</dd>
				</div>
				<div class='stage-file-details__row'>
					<dt>Uploaded</dt>
					<dd>{formatShortDate(entry.timestamp)}</dd>
				</div>
				<div class='stage-file-details__row'>
					<dt>By</dt>
					<dd>{entry.senderName}</dd>
				</div>
			</dl>

			<div class='stage-file-details__actions'>
				{entry.messageId && onJump && (
					<button
						type='button'
						class='stage-file-details__action'
						onClick={() => onJump(entry)}
					>
						<IconMessageCircle size={16} /> Jump to message
					</button>
				)}
				<a
					class='stage-file-details__action'
					href={entry.url}
					download={entry.name}
					target='_blank'
					rel='noopener noreferrer'
				>
					<IconDownload size={16} /> Download
				</a>
			</div>
		</div>
	);
}
/* #endregion */
