import { JSX } from 'preact';
import {
	IconBrandFigma,
	IconFile,
	IconFileText,
	IconFileZip,
	IconMusic,
	IconPhoto,
	IconVideo,
} from '@tabler/icons-preact';
import '../../styles/components/file-type-icon.css';

// #region Tone system
/** Colour identity for a file type. Kept in sync with the Files tab tones. */
export type FileTone = 'image' | 'pdf' | 'design' | 'audio' | 'video' | 'archive' | 'file';

/** The canonical tone → colour map shared across every file surface. */
export const FILE_TONE_COLORS: Record<FileTone, string> = {
	image: 'hsl(160, 60%, 42%)',
	pdf: 'hsl(4, 74%, 57%)',
	design: 'hsl(258, 70%, 62%)',
	audio: 'hsl(258, 70%, 62%)',
	video: 'hsl(258, 70%, 62%)',
	archive: 'hsl(220, 9%, 55%)',
	file: 'hsl(220, 9%, 55%)',
};

export interface FileVisual {
	tone: FileTone;
	/** Single-letter shorthand for compact badges. */
	letter: string;
	/** Resolved tone colour (an `hsl(...)` string). */
	color: string;
}

const DESIGN_EXTS = new Set(['FIG', 'PSD', 'AI', 'SKETCH', 'XD']);
const ARCHIVE_EXTS = new Set(['ZIP', 'RAR', 'TAR', '7Z', 'GZ']);

/**
 * Resolves a file's tone + badge letter from any combination of filename, MIME
 * type and coarse category — so callers holding a `File`, a server MIME string,
 * or a `FileCategory` all land on the same colour identity.
 */
export function resolveFileVisual(
	input: { name?: string; mimeType?: string; category?: string },
): FileVisual {
	const ext = (input.name?.split('.').pop() ?? '').toUpperCase();
	const mime = (input.mimeType ?? '').toLowerCase();
	const cat = (input.category ?? '').toLowerCase();

	let tone: FileTone = 'file';
	let letter = ext.charAt(0) || 'F';

	if (cat === 'image' || mime.startsWith('image/')) {
		tone = 'image';
		letter = 'I';
	} else if (mime.includes('pdf') || ext === 'PDF') {
		tone = 'pdf';
		letter = 'P';
	} else if (cat === 'vector' || DESIGN_EXTS.has(ext)) {
		tone = 'design';
		letter = ext.charAt(0) || 'D';
	} else if (cat === 'audio' || mime.startsWith('audio/')) {
		tone = 'audio';
		letter = ext.charAt(0) || 'A';
	} else if (cat === 'video' || mime.startsWith('video/')) {
		tone = 'video';
		letter = ext.charAt(0) || 'V';
	} else if (cat === 'compression' || ARCHIVE_EXTS.has(ext)) {
		tone = 'archive';
		letter = ext.charAt(0) || 'Z';
	} else if (cat === 'document' || cat === 'presentation' || cat === 'spreadsheet') {
		tone = 'pdf';
		letter = ext.charAt(0) || 'D';
	}

	return { tone, letter, color: FILE_TONE_COLORS[tone] };
}

/** The tabler glyph matching a resolved tone, at the requested size. */
export function renderFileGlyph(tone: FileTone, size: number): JSX.Element {
	switch (tone) {
		case 'image':
			return <IconPhoto size={size} stroke={1.6} />;
		case 'pdf':
			return <IconFileText size={size} stroke={1.6} />;
		case 'design':
			return <IconBrandFigma size={size} stroke={1.6} />;
		case 'audio':
			return <IconMusic size={size} stroke={1.6} />;
		case 'video':
			return <IconVideo size={size} stroke={1.6} />;
		case 'archive':
			return <IconFileZip size={size} stroke={1.6} />;
		default:
			return <IconFile size={size} stroke={1.6} />;
	}
}
// #endregion

// #region Component
export interface FileTypeIconProps {
	name?: string;
	mimeType?: string;
	category?: string;
	/** Box size in px. @default 32 */
	size?: number;
	/**
	 * `filled` (default): white glyph on a tone-coloured rounded square (compact
	 * identity used in rows/chips). `plain`: tone-coloured glyph, no background.
	 */
	variant?: 'filled' | 'plain';
	className?: string;
}

/**
 * @function FileTypeIcon
 * @description A colour-coded file-type glyph. Renders the tone-filled square
 * used across the Files tab, upload picker and attachment chips so a file reads
 * the same colour everywhere.
 */
export function FileTypeIcon(
	{ name, mimeType, category, size = 32, variant = 'filled', className }: FileTypeIconProps,
) {
	const visual = resolveFileVisual({ name, mimeType, category });
	const classes = ['file-type-icon', `file-type-icon--${variant}`, className]
		.filter(Boolean).join(' ');

	if (variant === 'plain') {
		return (
			<span className={classes} style={{ color: visual.color }}>
				{renderFileGlyph(visual.tone, size)}
			</span>
		);
	}

	return (
		<span
			className={classes}
			style={{ width: `${size}px`, height: `${size}px`, backgroundColor: visual.color }}
		>
			{renderFileGlyph(visual.tone, Math.round(size * 0.55))}
		</span>
	);
}
// #endregion
