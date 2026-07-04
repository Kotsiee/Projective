/* #region Imports */
import { ComponentChildren, JSX } from 'preact';
import { formatFileSize } from '@projective/data';
import { FileTypeIcon } from '@projective/ui';
import type { SubmissionFile } from '../../../../contracts/Submissions.ts';
/* #endregion */

export interface SubmissionFilePaneProps {
	file: SubmissionFile;
	/** Extra content rendered below the metadata (e.g. a feedback field). */
	children?: ComponentChildren;
}

/**
 * @function SubmissionFilePane
 * @description Read-only right-pane view of a single deliverable used inside the
 * Accept / Request Revision modals: a preview, filename and metadata, plus an
 * optional slot for per-file inputs.
 */
export function SubmissionFilePane({ file, children }: SubmissionFilePaneProps): JSX.Element {
	const isImage = file.mimeType.startsWith('image/') && !!file.url;
	return (
		<div class='submission-file-pane'>
			<div class='submission-file-pane__preview'>
				{isImage
					? <img src={file.url} alt={file.name} />
					: <FileTypeIcon name={file.name} mimeType={file.mimeType} size={64} variant='plain' />}
			</div>
			<h3 class='submission-file-pane__name'>{file.name}</h3>
			<p class='submission-file-pane__meta'>
				{file.mimeType || 'file'} · {formatFileSize(file.size)}
				{file.directory ? ` · ${file.directory}` : ''}
			</p>
			{children}
		</div>
	);
}
/* #endregion */
