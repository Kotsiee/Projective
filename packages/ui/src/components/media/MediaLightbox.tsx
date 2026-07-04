import { useSignal } from '@preact/signals';
import {
	IconArrowBackUp,
	IconDownload,
	IconFile,
	IconFileText,
	IconMusic,
	IconPhoto,
	IconShare3,
	IconTrash,
	IconVideo,
	IconX,
	IconZoomIn,
	IconZoomOut,
} from '@tabler/icons-preact';
import { Modal } from '../overlay/Modal.tsx';
import { IconButton } from '../button/IconButton.tsx';
import { AudioPlayer } from './AudioPlayer.tsx';
import '../../styles/components/media-lightbox.css';

// #region Types
/** Generic descriptor for any media/file shown in the lightbox. */
export interface LightboxMedia {
	url: string;
	name: string;
	/** MIME type or coarse category (e.g. `image/png`, `audio/webm`, `Image`). */
	type: string;
	size?: number;
	/** ISO upload timestamp. */
	uploadedAt?: string;
	senderName?: string;
	/** Initials for the uploader (falls back to derived from `senderName`). */
	senderInitials?: string;
	/** Source chat message id — enables the "Jump to chat message" action. */
	messageId?: string;
}

export interface MediaLightboxProps {
	isOpen: boolean;
	media: LightboxMedia | null;
	onClose: () => void;
	/** Override the default anchor download behaviour. */
	onDownload?: (media: LightboxMedia) => void;
	/** When provided, renders the primary "Jump to chat message" action. */
	onJump?: (media: LightboxMedia) => void;
	onShare?: (media: LightboxMedia) => void;
	onDelete?: (media: LightboxMedia) => void;
}
// #endregion

// #region Helpers
function formatBytes(bytes?: number, decimals = 1): string {
	if (!bytes || bytes <= 0) return '—';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
	const value = bytes / Math.pow(k, i);
	const rounded = Number.isInteger(value) ? value : parseFloat(value.toFixed(decimals));
	return `${rounded} ${sizes[i]}`;
}

function formatDate(iso?: string): string {
	if (!iso) return '—';
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return '—';
	return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isImage(type: string): boolean {
	return type.startsWith('image/') || type === 'Image';
}

function isAudio(type: string): boolean {
	return type.startsWith('audio/') || type === 'Audio';
}

function isVideo(type: string): boolean {
	return type.startsWith('video/') || type === 'Video';
}

/** Coarse category used to pick the header icon + accent colour. */
function category(type: string): 'image' | 'audio' | 'video' | 'doc' | 'file' {
	if (isImage(type)) return 'image';
	if (isAudio(type)) return 'audio';
	if (isVideo(type)) return 'video';
	const t = (type || '').toLowerCase();
	if (t.startsWith('text/') || t.includes('pdf') || t.includes('document')) return 'doc';
	return 'file';
}

/** Short, human type label (`IMG`, `PDF`, `M4A`) for the header + metadata. */
function shortType(media: LightboxMedia): string {
	const cat = category(media.type);
	if (cat === 'image') return 'IMG';
	if (cat === 'audio') return 'AUDIO';
	if (cat === 'video') return 'VIDEO';
	const dot = media.name.lastIndexOf('.');
	if (dot > 0 && dot < media.name.length - 1) return media.name.slice(dot + 1).toUpperCase();
	if (media.type) return media.type.split('/').pop()!.toUpperCase();
	return 'FILE';
}

function categoryIcon(cat: ReturnType<typeof category>, size: number) {
	switch (cat) {
		case 'image':
			return <IconPhoto size={size} />;
		case 'audio':
			return <IconMusic size={size} />;
		case 'video':
			return <IconVideo size={size} />;
		case 'doc':
			return <IconFileText size={size} />;
		default:
			return <IconFile size={size} />;
	}
}
// #endregion

/**
 * @function MediaLightbox
 * @description A general-purpose, full-screen media viewer. A top header names
 * the asset (icon, filename, `TYPE · SIZE`, close); the left canvas previews it
 * in large resolution (image lightbox with zoom, or audio player); the right
 * sidebar lists structured metadata (Size, Type, Uploaded by, Date) above the
 * primary actions — "Jump to chat message" (routes back to the source message)
 * and "Download" — with optional Share / Delete.
 */
export function MediaLightbox(
	{ isOpen, media, onClose, onDownload, onJump, onShare, onDelete }: MediaLightboxProps,
) {
	const zoomed = useSignal(false);

	if (!media) return null;

	const cat = category(media.type);

	const handleDownload = () => {
		if (onDownload) return onDownload(media);
		const a = document.createElement('a');
		a.href = media.url;
		a.download = media.name;
		a.rel = 'noopener';
		document.body.appendChild(a);
		a.click();
		a.remove();
	};

	const handleShare = () => {
		if (onShare) return onShare(media);
		// deno-lint-ignore no-explicit-any
		const nav = navigator as any;
		if (nav.share) {
			nav.share({ title: media.name, url: media.url }).catch(() => {});
		} else if (nav.clipboard?.writeText) {
			nav.clipboard.writeText(media.url).catch(() => {});
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} fullScreen className='media-lightbox-modal'>
			<div className='media-lightbox'>
				{/* Header */}
				<header className='media-lightbox__topbar'>
					<div className='media-lightbox__topbar-id'>
						<span className={`media-lightbox__topbar-icon media-lightbox__topbar-icon--${cat}`}>
							{categoryIcon(cat, 20)}
						</span>
						<div className='media-lightbox__topbar-text'>
							<span className='media-lightbox__topbar-name' title={media.name}>{media.name}</span>
							<span className='media-lightbox__topbar-sub'>
								{shortType(media)} · {formatBytes(media.size)}
							</span>
						</div>
					</div>
					<IconButton variant='secondary' rounded aria-label='Close viewer' onClick={onClose}>
						<IconX size={20} />
					</IconButton>
				</header>

				<div className='media-lightbox__body'>
					{/* Canvas */}
					<div className='media-lightbox__stage'>
						{isImage(media.type) && (
							<div className='media-lightbox__stage-actions'>
								<IconButton
									variant='secondary'
									rounded
									aria-label={zoomed.value ? 'Zoom out' : 'Zoom in'}
									onClick={() => (zoomed.value = !zoomed.value)}
								>
									{zoomed.value ? <IconZoomOut size={20} /> : <IconZoomIn size={20} />}
								</IconButton>
							</div>
						)}

						<div className='media-lightbox__canvas'>
							{isImage(media.type)
								? (
									<img
										className={`media-lightbox__image ${zoomed.value ? 'is-zoomed' : ''}`}
										src={media.url}
										alt={media.name}
										onClick={() => (zoomed.value = !zoomed.value)}
									/>
								)
								: isAudio(media.type)
								? (
									<div className='media-lightbox__audio'>
										<div className='media-lightbox__audio-icon'>
											<IconMusic size={40} />
										</div>
										<AudioPlayer src={media.url} className='media-lightbox__audio-player' />
									</div>
								)
								: (
									<div className='media-lightbox__file'>
										{categoryIcon(cat, 72)}
										<span className='media-lightbox__file-name'>{media.name}</span>
									</div>
								)}
						</div>
					</div>

					{/* Metadata sidebar */}
					<aside className='media-lightbox__sidebar'>
						<div className='media-lightbox__meta'>
							<span className='media-lightbox__meta-label'>Metadata</span>
							<dl className='media-lightbox__props'>
								<div className='media-lightbox__prop'>
									<dt>Size</dt>
									<dd>{formatBytes(media.size)}</dd>
								</div>
								<div className='media-lightbox__prop'>
									<dt>Type</dt>
									<dd>{shortType(media)}</dd>
								</div>
								<div className='media-lightbox__prop'>
									<dt>Uploaded by</dt>
									<dd>{media.senderName || '—'}</dd>
								</div>
								<div className='media-lightbox__prop'>
									<dt>Date</dt>
									<dd>{formatDate(media.uploadedAt)}</dd>
								</div>
							</dl>
						</div>

						<div className='media-lightbox__actions'>
							{onJump && (
								<button
									type='button'
									className='media-lightbox__action media-lightbox__action--primary'
									onClick={() => onJump(media)}
								>
									<IconArrowBackUp size={18} />
									<span>Jump to chat message</span>
								</button>
							)}
							<button type='button' className='media-lightbox__action' onClick={handleDownload}>
								<IconDownload size={18} />
								<span>Download</span>
							</button>
							{onShare && (
								<button type='button' className='media-lightbox__action' onClick={handleShare}>
									<IconShare3 size={18} />
									<span>Share</span>
								</button>
							)}
							{onDelete && (
								<button
									type='button'
									className='media-lightbox__action media-lightbox__action--danger'
									onClick={() => onDelete(media)}
								>
									<IconTrash size={18} />
									<span>Delete</span>
								</button>
							)}
						</div>
					</aside>
				</div>
			</div>
		</Modal>
	);
}
