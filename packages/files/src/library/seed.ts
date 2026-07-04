import { CloudService, DirectoryNode, LibraryFile } from './types.ts';

const KB = 1024;
const MB = 1024 * 1024;

/**
 * Cloud providers surfaced in the tree. There is no persistence layer behind
 * these — they exist purely as mocked front-end state, tagged by `source`.
 */
export const SEED_SERVICES: CloudService[] = [
	{ source: 'google-drive', label: 'Google Drive', connected: true },
	{ source: 'onedrive', label: 'OneDrive', connected: true },
	{ source: 'dropbox', label: 'Dropbox', connected: false },
];

/**
 * Initial directory tree spanning local + cloud sources. Mirrors the layout in
 * the legacy picker screenshot (Google Drive / Projects / Flower Shop, etc.).
 */
export const SEED_DIRECTORIES: DirectoryNode[] = [
	// Local storage
	{ id: 'local-brand', name: 'Brand assets', parentId: null, source: 'local' },
	{ id: 'local-exports', name: 'Exports', parentId: null, source: 'local' },
	// Google Drive
	{ id: 'gd-projects', name: 'Projects', parentId: null, source: 'google-drive' },
	{ id: 'gd-flowershop', name: 'Flower Shop', parentId: 'gd-projects', source: 'google-drive' },
	{ id: 'gd-shared', name: 'Shared with me', parentId: null, source: 'google-drive' },
];

/** Seed asset library. Cloud entries carry no in-memory `File`. */
export const SEED_FILES: LibraryFile[] = [
	// Local — Brand assets (3)
	f('logo.png', 240 * KB, 'image/png', 'Image', 'local-brand', 'local', '2026-06-28'),
	f('palette.png', 180 * KB, 'image/png', 'Image', 'local-brand', 'local', '2026-06-28'),
	f('brandmark.svg', 32 * KB, 'image/svg+xml', 'Vector', 'local-brand', 'local', '2026-06-29'),
	// Local — Exports (2)
	f('hero-final.png', 3.1 * MB, 'image/png', 'Image', 'local-exports', 'local', '2026-06-30'),
	f('banner.jpg', 1.4 * MB, 'image/jpeg', 'Image', 'local-exports', 'local', '2026-07-01'),
	// Google Drive — Flower Shop (4)
	f('voiceover.m4a', 820 * KB, 'audio/mp4', 'Audio', 'gd-flowershop', 'google-drive', '2026-07-03'),
	f(
		'checkout-flow.fig',
		5.2 * MB,
		'application/octet-stream',
		'Vector',
		'gd-flowershop',
		'google-drive',
		'2026-07-02',
	),
	f(
		'copy-deck.pdf',
		640 * KB,
		'application/pdf',
		'Document',
		'gd-flowershop',
		'google-drive',
		'2026-07-02',
	),
	f(
		'flowershop-brief.pdf',
		2.4 * MB,
		'application/pdf',
		'Document',
		'gd-flowershop',
		'google-drive',
		'2026-07-01',
	),
	// Google Drive — Shared with me (1)
	f(
		'handoff-notes.pdf',
		210 * KB,
		'application/pdf',
		'Document',
		'gd-shared',
		'google-drive',
		'2026-06-27',
	),
];

function f(
	name: string,
	size: number,
	mimeType: string,
	category: LibraryFile['category'],
	directoryId: string,
	source: LibraryFile['source'],
	created: string,
): LibraryFile {
	return {
		id: `seed-${directoryId}-${name}`,
		name,
		size: Math.round(size),
		mimeType,
		category,
		directoryId,
		source,
		createdAt: new Date(`${created}T12:00:00Z`).toISOString(),
	};
}
