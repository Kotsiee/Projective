/* #region Imports */
import { JSX } from 'preact';
import { formatFileSize, formatShortDate, type StageFileEntry } from '@projective/data';
import { getFileVisual, renderFileIcon } from './StageFileVisuals.tsx';
/* #endregion */

/* #region Interfaces */
export interface StageFilesListProps {
	/** Ordered, already-filtered file entries. */
	entries: StageFileEntry[];
	/** Fired on single-click — slides out the Details inspector. */
	onSelect: (entry: StageFileEntry, e: MouseEvent) => void;
	/** Fired on double-click — opens the full-view modal. */
	onOpen: (entry: StageFileEntry) => void;
	/** Id of the row currently shown in the inspector. */
	activeId?: string | null;
}
/* #endregion */

/* #region Component */
/**
 * @function StageFilesList
 * @description A scanning-optimised List view: file-type icon, name, uploader,
 * size and abbreviated date aligned in uniform columns. Each row activates the
 * shared lightbox.
 */
export function StageFilesList(
	{ entries, onSelect, onOpen, activeId }: StageFilesListProps,
): JSX.Element {
	return (
		<div class='stage-files-list' role='table' aria-label='Files'>
			{entries.map((entry) => {
				const visual = getFileVisual(entry);
				const isActive = entry.id === activeId;
				return (
					<button
						key={entry.id}
						type='button'
						role='row'
						class={`stage-files-row${isActive ? ' stage-files-row--active' : ''}`}
						onClick={(e) => onSelect(entry, e as unknown as MouseEvent)}
						onDblClick={() => onOpen(entry)}
						title={`${entry.name} — double-click to open`}
					>
						<span class={`stage-file-icon stage-file-icon--${visual.tone}`}>
							{renderFileIcon(visual.tone, 18)}
						</span>
						<span class='stage-files-row__name'>{entry.name}</span>
						<span class='stage-files-row__uploader'>{entry.senderName}</span>
						<span class='stage-files-row__size'>{formatFileSize(entry.size)}</span>
						<span class='stage-files-row__date'>{formatShortDate(entry.timestamp)}</span>
					</button>
				);
			})}
		</div>
	);
}
/* #endregion */
