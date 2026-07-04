/**
 * @file stageFiles.ts
 * @description Layout-agnostic parsing & shaping utilities for the unified
 * "Files" view. A stage aggregates every attachment sent inside its project
 * chat channel; the backend returns those attachments in a nested
 * `{ attachment, message }` envelope. These pure helpers flatten that envelope
 * into a single canonical {@link StageFileEntry} that both the Grid renderer and
 * the List renderer consume without either owning any parsing logic. Sorting,
 * category filtering and text search are also expressed here so the two views
 * stay in perfect lockstep and the island only orchestrates.
 */

// #region Types
/** Coarse bucket a file falls into, used by the filter tags (All/Images/Docs/Other). */
export type StageFileCategory = 'image' | 'doc' | 'other';

/** Ordering exposed by the "Sort by" dropdown. */
export type StageFileSort = 'recent' | 'oldest' | 'name' | 'size';

/**
 * Canonical, render-ready descriptor for a single file shared in a stage chat.
 * Flattened from the backend envelope so no renderer needs to know the wire shape.
 */
export interface StageFileEntry {
	/** Stable id of the file (attachment/file id). */
	id: string;
	/** Original filename including extension. */
	name: string;
	/** Direct/streaming access URL for the asset. */
	url: string;
	/** Size in bytes (0 when unknown). */
	size: number;
	/** MIME type (may be empty when the server could not determine it). */
	mimeType: string;
	/** Display name of the member who uploaded the file. */
	senderName: string;
	/** 1–2 letter initials derived from (or supplied alongside) the sender name. */
	senderInitials: string;
	/** Id of the chat message the file was attached to — powers "Jump to chat message". */
	messageId: string;
	/** ISO timestamp of the source message. */
	timestamp: string;
	/** Pre-computed category bucket. */
	category: StageFileCategory;
	/** Uppercased extension (e.g. `PDF`, `FIG`) for icon badges. */
	extension: string;
}

/** Minimal shape of a raw file item as returned by `getFiles` / the files API. */
export interface RawStageFile {
	id?: string;
	attachment?: {
		id?: string;
		name?: string;
		type?: string;
		size?: number;
		url?: string;
	};
	message?: {
		id?: string;
		timestamp?: string;
		sender?: {
			name?: string;
			initials?: string;
		};
	};
}
// #endregion

// #region Primitive helpers
/** Derives up-to-two-letter initials from a display name (`"Amara Sol"` → `"AS"`). */
export function getInitials(name?: string | null): string {
	if (!name) return '?';
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return '?';
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Uppercased file extension, or `FILE` when the name has none. */
export function getExtension(name?: string | null): string {
	if (!name) return 'FILE';
	const dot = name.lastIndexOf('.');
	if (dot <= 0 || dot === name.length - 1) return 'FILE';
	return name.slice(dot + 1).toUpperCase();
}

/** Buckets a mime type into the coarse category used by the filter tags. */
export function categorizeFile(mimeType?: string | null): StageFileCategory {
	const mt = (mimeType || '').toLowerCase();
	if (mt.startsWith('image/')) return 'image';
	if (
		mt.startsWith('text/') ||
		mt.includes('pdf') ||
		mt.includes('word') ||
		mt.includes('document') ||
		mt.includes('spreadsheet') ||
		mt.includes('presentation')
	) {
		return 'doc';
	}
	return 'other';
}

/** Human-readable byte size (`3.8 MB`, `640 KB`). */
export function formatFileSize(bytes?: number, decimals = 1): string {
	if (!bytes || bytes <= 0) return '—';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
	const value = bytes / Math.pow(k, i);
	// Whole numbers read cleaner without trailing zeros (e.g. "18 MB" vs "18.0 MB").
	const rounded = Number.isInteger(value) ? value : parseFloat(value.toFixed(decimals));
	return `${rounded} ${sizes[i]}`;
}

/** Abbreviated month/day for the List view (`Jul 3`). */
export function formatShortDate(iso?: string): string {
	if (!iso) return '—';
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return '—';
	return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Long, human date for the lightbox metadata (`Jul 1, 2026`). */
export function formatLongDate(iso?: string): string {
	if (!iso) return '—';
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return '—';
	return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
// #endregion

// #region Parsing
/**
 * Flattens one raw backend file envelope into a {@link StageFileEntry}. Tolerant
 * of missing fields — anything absent degrades to a safe placeholder rather than
 * throwing, so a single malformed row never breaks the whole view.
 */
export function parseStageFile(raw: RawStageFile): StageFileEntry {
	const att = raw.attachment ?? {};
	const msg = raw.message ?? {};
	const sender = msg.sender ?? {};

	const name = att.name || 'Untitled file';
	const senderName = sender.name || 'Unknown';

	return {
		id: att.id || raw.id || crypto.randomUUID(),
		name,
		url: att.url || '',
		size: att.size ?? 0,
		mimeType: att.type || '',
		senderName,
		senderInitials: sender.initials || getInitials(senderName),
		messageId: msg.id || '',
		timestamp: msg.timestamp || '',
		category: categorizeFile(att.type),
		extension: getExtension(name),
	};
}

/** Maps a list of raw envelopes into canonical entries. */
export function parseStageFiles(rows: RawStageFile[] | null | undefined): StageFileEntry[] {
	if (!rows || !Array.isArray(rows)) return [];
	return rows.map(parseStageFile);
}
// #endregion

// #region Sort / filter
/** Maps a filter-tag key to the categories it admits (`all` admits everything). */
export function matchesCategory(entry: StageFileEntry, filter: 'all' | StageFileCategory): boolean {
	return filter === 'all' || entry.category === filter;
}

/**
 * Applies the active category tag + free-text search to a list of entries.
 * Search matches on filename and uploader name, case-insensitively.
 */
export function filterStageFiles(
	entries: StageFileEntry[],
	opts: { category?: 'all' | StageFileCategory; search?: string } = {},
): StageFileEntry[] {
	const category = opts.category ?? 'all';
	const query = (opts.search ?? '').trim().toLowerCase();

	return entries.filter((e) => {
		if (!matchesCategory(e, category)) return false;
		if (!query) return true;
		return (
			e.name.toLowerCase().includes(query) ||
			e.senderName.toLowerCase().includes(query)
		);
	});
}

/** Returns a new, sorted array of entries (does not mutate the input). */
export function sortStageFiles(entries: StageFileEntry[], sort: StageFileSort): StageFileEntry[] {
	const copy = [...entries];
	const time = (e: StageFileEntry) => {
		const t = new Date(e.timestamp).getTime();
		return Number.isNaN(t) ? 0 : t;
	};

	switch (sort) {
		case 'oldest':
			return copy.sort((a, b) => time(a) - time(b));
		case 'name':
			return copy.sort((a, b) => a.name.localeCompare(b.name));
		case 'size':
			return copy.sort((a, b) => b.size - a.size);
		case 'recent':
		default:
			return copy.sort((a, b) => time(b) - time(a));
	}
}
// #endregion
