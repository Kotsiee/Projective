/* #region Imports */
import { JSX } from 'preact';
import { formatFileSize } from '@projective/data';
import { FileTypeIcon, IconButton, Overlay } from '@projective/ui';
import { IconDownload, IconX } from '@tabler/icons-preact';
import type { SubmissionFile } from '../../../../contracts/Submissions.ts';
/* #endregion */

/* #region Helpers */
const isImage = (f: SubmissionFile) => f.mimeType.startsWith('image/') && !!f.url;
/* #endregion */

/* #region Grid */
export interface SubmissionFileGridProps {
	files: SubmissionFile[];
	activeId: string | null;
	onSelect: (file: SubmissionFile, e: MouseEvent) => void;
	onOpen: (file: SubmissionFile) => void;
}

/**
 * @function SubmissionFileGrid
 * @description Center-canvas grid of a submission's deliverables. Single-click
 * slides out the Details inspector; double-click opens the full-view modal.
 */
export function SubmissionFileGrid(
	{ files, activeId, onSelect, onOpen }: SubmissionFileGridProps,
): JSX.Element {
	return (
		<div class='submission-file-grid'>
			{files.map((f) => (
				<button
					key={f.id}
					type='button'
					class={`submission-file-card${f.id === activeId ? ' submission-file-card--active' : ''}`}
					onClick={(e) => onSelect(f, e as unknown as MouseEvent)}
					onDblClick={() => onOpen(f)}
					title={`${f.name} — double-click to open`}
				>
					<div class='submission-file-card__preview'>
						{isImage(f)
							? <img src={f.url} alt={f.name} loading='lazy' />
							: <FileTypeIcon name={f.name} mimeType={f.mimeType} size={40} variant='plain' />}
					</div>
					<div class='submission-file-card__footer'>
						<span class='submission-file-card__name'>{f.name}</span>
						<span class='submission-file-card__meta'>{formatFileSize(f.size)}</span>
					</div>
				</button>
			))}
		</div>
	);
}
/* #endregion */

/* #region Inspector */
export interface SubmissionFileInspectorProps {
	file: SubmissionFile;
	onOpenFull: (file: SubmissionFile) => void;
	onClose: () => void;
}

/** The slide-out right-hand details panel for a selected deliverable. */
export function SubmissionFileInspector(
	{ file, onOpenFull, onClose }: SubmissionFileInspectorProps,
): JSX.Element {
	return (
		<div class='submission-file-inspector'>
			<header class='submission-file-inspector__head'>
				<span class='submission-file-inspector__eyebrow'>File details</span>
				<IconButton ghost size='small' aria-label='Close details' onClick={onClose}>
					<IconX size={18} />
				</IconButton>
			</header>

			<button
				type='button'
				class='submission-file-inspector__preview'
				onClick={() => onOpenFull(file)}
				title='Open full view'
			>
				{isImage(file)
					? <img src={file.url} alt={file.name} />
					: <FileTypeIcon name={file.name} mimeType={file.mimeType} size={56} variant='plain' />}
			</button>

			<h3 class='submission-file-inspector__name'>{file.name}</h3>
			<dl class='submission-file-inspector__meta'>
				<div>
					<dt>Type</dt>
					<dd>{file.mimeType || '—'}</dd>
				</div>
				<div>
					<dt>Size</dt>
					<dd>{formatFileSize(file.size)}</dd>
				</div>
				{file.directory && (
					<div>
						<dt>Folder</dt>
						<dd>{file.directory}</dd>
					</div>
				)}
			</dl>

			<a
				class='submission-file-inspector__download'
				href={file.url}
				download={file.name}
				target='_blank'
				rel='noopener noreferrer'
			>
				<IconDownload size={16} /> Download
			</a>
		</div>
	);
}
/* #endregion */

/* #region Full-view modal */
export interface SubmissionFilePreviewProps {
	file: SubmissionFile | null;
	onClose: () => void;
}

/** Full-view modal shown on double-click of a deliverable. */
export function SubmissionFilePreview(
	{ file, onClose }: SubmissionFilePreviewProps,
): JSX.Element {
	return (
		<Overlay type='modal' isOpen={!!file} onClose={onClose} width={880} height={640}>
			{file && (
				<div class='submission-file-preview'>
					<header class='submission-file-preview__head'>
						<span class='submission-file-preview__name'>{file.name}</span>
						<IconButton ghost rounded aria-label='Close' onClick={onClose}>
							<IconX size={20} />
						</IconButton>
					</header>
					<div class='submission-file-preview__body'>
						{isImage(file)
							? <img src={file.url} alt={file.name} />
							: (
								<div class='submission-file-preview__fallback'>
									<FileTypeIcon
										name={file.name}
										mimeType={file.mimeType}
										size={72}
										variant='plain'
									/>
									<p>{file.name}</p>
									<a href={file.url} download={file.name} target='_blank' rel='noopener noreferrer'>
										<IconDownload size={16} /> Download to view
									</a>
								</div>
							)}
					</div>
				</div>
			)}
		</Overlay>
	);
}
/* #endregion */
