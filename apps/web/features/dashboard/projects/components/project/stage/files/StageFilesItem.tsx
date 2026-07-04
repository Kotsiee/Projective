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
	/** Fired on single-click — slides out the Details inspector. */
	onSelect: (entry: StageFileEntry, e: MouseEvent) => void;
	/** Fired on double-click — opens the full-view modal. */
	onOpen: (entry: StageFileEntry) => void;
	/** Whether this card is the one currently shown in the inspector. */
	active?: boolean;
}
/* #endregion */

/* #region Component */
/**
 * @function StageFilesItem
 * @description A rounded asset card for the Files Grid view: a rich inline image
 * preview (or a centred, colour-coded vector icon for system files) above a
 * footer row mapping filename, size and uploader.
 */
export function StageFilesItem(
	{ entry, onSelect, onOpen, active }: StageFilesItemProps,
): JSX.Element {
	const visual = getFileVisual(entry);
	const isImage = entry.category === 'image' && !!entry.url;

	return (
		<button
			type='button'
			class={`stage-file-card${active ? ' stage-file-card--active' : ''}`}
			onClick={(e) => onSelect(entry, e as unknown as MouseEvent)}
			onDblClick={() => onOpen(entry)}
			title={`${entry.name} — double-click to open`}
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
