/* #region Imports */
import { JSX } from 'preact';
import { FileTypeIcon } from '@projective/ui';
import { IconFileDescription, IconMessageDots } from '@tabler/icons-preact';
import type { SubmissionFile } from '../../../../contracts/Submissions.ts';
/* #endregion */

/** Sentinel key for the isolated "Submission Details" node at the top of the list. */
export const DETAILS_KEY = '__details__';

export interface SubmissionAssetListProps {
	files: SubmissionFile[];
	selectedKey: string;
	onSelect: (key: string) => void;
	/** When true, a per-file flag dot shows which files already carry feedback. */
	flaggedFileIds?: string[];
}

/**
 * @function SubmissionAssetList
 * @description The dual-pane left navigation shared by the Accept / Request
 * Revision modals. The topmost "Submission Details" node is visually isolated
 * from the deliverable file nodes beneath it.
 */
export function SubmissionAssetList(
	{ files, selectedKey, onSelect, flaggedFileIds = [] }: SubmissionAssetListProps,
): JSX.Element {
	return (
		<nav class='submission-asset-list' aria-label='Submission assets'>
			<button
				type='button'
				class={`submission-asset submission-asset--details${
					selectedKey === DETAILS_KEY ? ' is-active' : ''
				}`}
				onClick={() => onSelect(DETAILS_KEY)}
			>
				<IconFileDescription size={18} />
				<span class='submission-asset__name'>Submission Details</span>
			</button>

			<div class='submission-asset-list__files'>
				{files.map((f) => (
					<button
						key={f.id}
						type='button'
						class={`submission-asset${f.id === selectedKey ? ' is-active' : ''}`}
						onClick={() => onSelect(f.id)}
					>
						<FileTypeIcon name={f.name} mimeType={f.mimeType} size={18} />
						<span class='submission-asset__name'>{f.name}</span>
						{flaggedFileIds.includes(f.id) && (
							<span class='submission-asset__flag' title='Has feedback'>
								<IconMessageDots size={14} />
							</span>
						)}
					</button>
				))}
			</div>
		</nav>
	);
}
/* #endregion */
