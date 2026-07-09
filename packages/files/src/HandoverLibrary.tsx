import './styles/handover-library.css';
import { FileTypeIcon } from '@projective/ui';
import { formatFileSize } from '@projective/data';
import { IconDownload, IconLockOpen2 } from '@tabler/icons-preact';

/** One released asset in the handover library. */
export interface HandoverLibraryFile {
	id: string;
	name: string;
	mimeType: string;
	size: number;
	url?: string;
	uploadedAt?: string;
	senderName?: string;
}

export interface HandoverLibraryProps {
	files: HandoverLibraryFile[];
	/** Per-file download handler. When omitted and `file.url` exists, a plain download link is used. */
	onDownload?: (file: HandoverLibraryFile) => void;
	/** Header action, shown only when provided. */
	onDownloadAll?: () => void;
	/** Header title. Defaults to "Project Files". */
	title?: string;
	/** Renders the premium unlocked accent (badge + glow border). Defaults to true. */
	unlocked?: boolean;
	className?: string;
}

/** Locale-format an ISO timestamp, returning undefined for missing/invalid input. */
function dateLabel(iso?: string): string | undefined {
	if (!iso) return undefined;
	const date = new Date(iso);
	return Number.isNaN(date.getTime()) ? undefined : date.toLocaleDateString();
}

/**
 * @function HandoverLibrary
 * @description The "unlocked" post-handover downloader (E7): once the protected phase ends, every
 * released asset is laid out in a responsive grid of file cards with unrestricted downloads. The
 * unlocked accent (open-lock badge + faint primary glow) signals that no gating remains.
 */
export function HandoverLibrary(props: HandoverLibraryProps) {
	const {
		files,
		onDownload,
		onDownloadAll,
		title = 'Project Files',
		unlocked = true,
		className,
	} = props;

	const classes = [
		'handover-library',
		unlocked && 'handover-library--unlocked',
		className,
	].filter(Boolean).join(' ');

	return (
		<section class={classes}>
			<header class='handover-library__header'>
				<h3 class='handover-library__title'>
					{title}
					{unlocked && (
						<span class='handover-library__unlocked-badge'>
							<IconLockOpen2 size={13} stroke={2} aria-hidden='true' />
							Unlocked
						</span>
					)}
				</h3>
				{onDownloadAll && (
					<button
						type='button'
						class='handover-library__download-all'
						onClick={onDownloadAll}
					>
						<IconDownload size={15} stroke={2} aria-hidden='true' />
						Download all
					</button>
				)}
			</header>
			{files.length === 0
				? (
					<p class='handover-library__empty'>
						No files were shared in this project.
					</p>
				)
				: (
					<ul class='handover-library__grid'>
						{files.map((file) => {
							const uploaded = dateLabel(file.uploadedAt);
							const meta = [
								formatFileSize(file.size),
								uploaded,
								file.senderName,
							].filter(Boolean).join(' · ');

							return (
								<li key={file.id} class='handover-library__card'>
									<span class='handover-library__file-icon' aria-hidden='true'>
										<FileTypeIcon name={file.name} mimeType={file.mimeType} size={34} />
									</span>
									<span class='handover-library__body'>
										<span class='handover-library__name' title={file.name}>{file.name}</span>
										<span class='handover-library__meta'>{meta}</span>
									</span>
									{onDownload
										? (
											<button
												type='button'
												class='handover-library__download'
												aria-label={`Download ${file.name}`}
												onClick={() => onDownload(file)}
											>
												<IconDownload size={16} stroke={2} />
											</button>
										)
										: file.url && (
											<a
												href={file.url}
												download={file.name}
												class='handover-library__download'
												aria-label={`Download ${file.name}`}
											>
												<IconDownload size={16} stroke={2} />
											</a>
										)}
								</li>
							);
						})}
					</ul>
				)}
		</section>
	);
}
