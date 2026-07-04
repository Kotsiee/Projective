/* #region Imports */
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
import type { StageFileEntry } from '@projective/data';
/* #endregion */

/* #region Types */
/** Colour-coded visual identity for a file type, shared by the Grid and List renderers. */
export interface FileVisual {
	/** CSS modifier suffix (e.g. `image`, `pdf`) applied to icon/badge classes. */
	tone: 'image' | 'pdf' | 'design' | 'audio' | 'video' | 'archive' | 'file';
	/** Single-letter glyph used in the compact grid-card badge. */
	letter: string;
}
/* #endregion */

/* #region Resolver */
const DESIGN_EXTS = new Set(['FIG', 'PSD', 'AI', 'SKETCH', 'XD']);
const ARCHIVE_EXTS = new Set(['ZIP', 'RAR', 'TAR', '7Z', 'GZ']);

/**
 * Resolves the colour tone + badge letter for a file. Images collapse to `I`;
 * every other type takes the first letter of its extension so the badge reads as
 * a natural shorthand (`P` for PDF, `F` for Figma, `Z` for a zip, `M` for m4a).
 */
export function getFileVisual(entry: StageFileEntry): FileVisual {
	const ext = entry.extension.toUpperCase();
	const mime = entry.mimeType.toLowerCase();

	if (entry.category === 'image' || mime.startsWith('image/')) {
		return { tone: 'image', letter: 'I' };
	}
	if (mime.includes('pdf') || ext === 'PDF') return { tone: 'pdf', letter: 'P' };
	if (DESIGN_EXTS.has(ext)) return { tone: 'design', letter: ext.charAt(0) };
	if (mime.startsWith('audio/')) return { tone: 'audio', letter: ext.charAt(0) || 'A' };
	if (mime.startsWith('video/')) return { tone: 'video', letter: ext.charAt(0) || 'V' };
	if (ARCHIVE_EXTS.has(ext)) return { tone: 'archive', letter: ext.charAt(0) };
	if (entry.category === 'doc') return { tone: 'pdf', letter: ext.charAt(0) || 'D' };
	return { tone: 'file', letter: ext.charAt(0) || 'F' };
}

/** The lucide/tabler glyph matching a resolved tone, at the requested size. */
export function renderFileIcon(tone: FileVisual['tone'], size: number): JSX.Element {
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
/* #endregion */
