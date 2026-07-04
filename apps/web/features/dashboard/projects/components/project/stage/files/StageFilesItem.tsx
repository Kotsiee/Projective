/* #region Imports */
import { JSX } from 'preact';
import { formatFileSize, type StageFileEntry } from '@projective/data';
import { getFileVisual, renderFileIcon } from './StageFileVisuals.tsx';
/* #endregion */

/* #region Interfaces */
/**
 * Props for the StageFilesItem component (a single Grid-view asset card).
 */
export interface StageFilesItemProps {
	/** The canonical file entry to render. */
	entry: StageFileEntry;
	/** Fired when the card is activated (opens the lightbox). */
	onOpen: (entry: StageFileEntry) => void;
}
/* #endregion */

/* #region Component */
/**
 * @function StageFilesItem
 * @description A rounded asset card for the Files Grid view: a rich inline image
 * preview (or a centred, colour-coded vector icon for system files) above a
 * footer row mapping filename, size and uploader.
 */
export function StageFilesItem({ entry, onOpen }: StageFilesItemProps): JSX.Element {
	const visual = getFileVisual(entry);
	const isImage = entry.category === 'image' && !!entry.url;

	return (
		<button
			type='button'
			class='stage-file-card'
			onClick={() => onOpen(entry)}
			title={entry.name}
		>
			<div class='stage-file-card__preview'>
				{isImage
					? (
						<img
							src={entry.url}
							class='stage-file-card__image'
							alt={entry.name}
							loading='lazy'
						/>
					)
					: (
						<div class={`stage-file-card__icon stage-file-card__icon--${visual.tone}`}>
							{renderFileIcon(visual.tone, 40)}
						</div>
					)}
			</div>

			<div class='stage-file-card__footer'>
				<span class='stage-file-card__name'>{entry.name}</span>
				<div class='stage-file-card__sub'>
					<span class={`stage-file-badge stage-file-badge--${visual.tone}`}>{visual.letter}</span>
					<span class='stage-file-card__meta'>
						{formatFileSize(entry.size)} · {entry.senderName}
					</span>
				</div>
			</div>
		</button>
	);
}
/* #endregion */
