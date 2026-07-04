import { FileCategory } from '@projective/types';

/**
 * Storage back-ends the browser can surface. `local` is backed by the real
 * directory API (see {@link useLibraryStore}); the cloud sources are a purely
 * mocked front-end state layer — there is no DB behind them yet.
 */
export type StorageSource = 'local' | 'google-drive' | 'onedrive' | 'dropbox';

export type ViewMode = 'list' | 'grid';
export type SortOption = 'uploaded_desc' | 'alphabetical_asc' | 'last_used_desc';

/** A folder node in a single source's directory tree. */
export interface DirectoryNode {
	id: string;
	name: string;
	/** `null` places the folder at the source's root. */
	parentId: string | null;
	source: StorageSource;
}

/**
 * A file asset in the library. For freshly uploaded assets `file` holds the real
 * browser {@link File}; library/cloud entries are references and synthesise a
 * `File` only at confirm-time (see `toFileWithMeta`).
 */
export interface LibraryFile {
	id: string;
	name: string;
	size: number;
	mimeType: string;
	category: FileCategory | 'Other';
	/** Owning directory; `null` = the source root. */
	directoryId: string | null;
	source: StorageSource;
	createdAt: string;
	lastUsed?: string;
	/** Present only for locally uploaded assets held in memory. */
	file?: File;
	meta?: Record<string, unknown>;
}

/** A cloud provider entry rendered in the tree's services section. */
export interface CloudService {
	source: StorageSource;
	label: string;
	connected: boolean;
}

/** Drag payload MIME identifying an internal library file being relocated. */
export const DRAG_FILE_MIME = 'application/x-uploadfile-id';

/** Human labels for each storage source, used in breadcrumbs and details. */
export const SOURCE_LABELS: Record<StorageSource, string> = {
	'local': 'Local storage',
	'google-drive': 'Google Drive',
	'onedrive': 'OneDrive',
	'dropbox': 'Dropbox',
};
