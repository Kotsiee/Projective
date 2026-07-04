import { Signal, useSignal } from '@preact/signals';
import { useRef } from 'preact/hooks';
import { FileCategory, FileWithMeta, getFileCategory } from '@projective/types';
import { toast } from '@projective/ui';
import {
	DirectoryNode,
	LibraryFile,
	SortOption,
	SOURCE_LABELS,
	StorageSource,
	ViewMode,
} from './types.ts';
import { getNameError } from './fileName.ts';
import { SEED_DIRECTORIES, SEED_FILES, SEED_SERVICES } from './seed.ts';

export interface LibraryStoreConfig {
	multiple: boolean;
	maxFiles: number;
	allowedCategories?: FileCategory[];
	allowedFileTypes?: string[];
	initialFiles: FileWithMeta[];
}

/** Everything the browser UI reads and mutates. Backed by `@preact/signals`. */
export interface LibraryStore {
	// Data
	directories: Signal<DirectoryNode[]>;
	files: Signal<LibraryFile[]>;
	services: typeof SEED_SERVICES;

	// Navigation
	activeSource: Signal<StorageSource>;
	activeDirId: Signal<string | null>;
	search: Signal<string>;

	// Selection & details
	selected: Signal<Map<string, LibraryFile>>;
	activeFileId: Signal<string | null>;

	// View controls
	viewMode: Signal<ViewMode>;
	sortMode: Signal<SortOption>;
	typeFilter: Signal<string>;
	treeCollapsed: Signal<boolean>;

	// Type guard
	passesTypeGuard: (file: LibraryFile) => boolean;

	// Navigation actions
	navigateTo: (source: StorageSource, dirId: string | null) => void;
	navigateToFile: (file: LibraryFile) => void;

	// Selection actions
	toggleSelect: (file: LibraryFile) => void;
	removeSelect: (id: string) => void;
	clearSelection: () => void;
	toggleDetails: (file: LibraryFile) => void;

	// Directory CRUD (backed by the assumed directory API for the local source)
	createDirectory: (parentId: string | null, source: StorageSource) => Promise<void>;
	renameDirectory: (id: string, name: string) => Promise<boolean>;
	deleteDirectory: (id: string) => Promise<void>;

	// File actions
	moveFile: (fileId: string, dirId: string | null, source: StorageSource) => void;
	renameFile: (id: string, name: string) => boolean;
	deleteFile: (id: string) => void;
	addUploadedFiles: (files: File[]) => void;

	// Derived helpers
	childDirectories: (parentId: string | null, source: StorageSource) => DirectoryNode[];
	directoryPath: (dirId: string | null, source: StorageSource) => DirectoryNode[];
	fileCategoryFilter: (file: LibraryFile) => boolean;
}

/**
 * Central state for the file browser. Directory mutations optimistically update
 * local signal state, then best-effort persist against the assumed directory API
 * (`/api/v1/files/folders`) for the `local` source — cloud sources are mocked and
 * mutate front-end state only.
 */
export function useLibraryStore(config: LibraryStoreConfig): LibraryStore {
	const { multiple, maxFiles, allowedCategories, allowedFileTypes, initialFiles } = config;

	const directories = useSignal<DirectoryNode[]>(SEED_DIRECTORIES);
	const files = useSignal<LibraryFile[]>(seedWithInitial(initialFiles));

	const activeSource = useSignal<StorageSource>('google-drive');
	const activeDirId = useSignal<string | null>('gd-flowershop');
	const search = useSignal('');

	const selected = useSignal<Map<string, LibraryFile>>(new Map());
	const activeFileId = useSignal<string | null>(null);

	const viewMode = useSignal<ViewMode>('grid');
	const sortMode = useSignal<SortOption>('uploaded_desc');
	const typeFilter = useSignal<string>('all');
	const treeCollapsed = useSignal(false);

	// Monotonic counter for locally created ids (avoids Date.now/random in render).
	const idCounter = useRef(0);
	const nextId = (prefix: string) => `${prefix}-${++idCounter.current}-${crypto.randomUUID()}`;

	// #region Type guards
	const passesTypeGuard = (file: LibraryFile): boolean => {
		if (allowedCategories && allowedCategories.length > 0) {
			if (!allowedCategories.includes(file.category as FileCategory)) return false;
		}
		if (allowedFileTypes && allowedFileTypes.length > 0) {
			const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
			const mime = file.mimeType.toLowerCase();
			const ok = allowedFileTypes.some((t) => {
				const tl = t.toLowerCase();
				return tl === ext || tl === mime;
			});
			if (!ok) return false;
		}
		return true;
	};

	const fileCategoryFilter = (file: LibraryFile): boolean => {
		if (typeFilter.value === 'all') return true;
		return file.category.toLowerCase() === typeFilter.value;
	};
	// #endregion

	// #region Derived helpers
	const childDirectories = (parentId: string | null, source: StorageSource) =>
		directories.value
			.filter((d) => d.source === source && d.parentId === parentId)
			.sort((a, b) => a.name.localeCompare(b.name));

	const directoryPath = (dirId: string | null, source: StorageSource): DirectoryNode[] => {
		const path: DirectoryNode[] = [];
		let cursor = dirId;
		// Guard against cycles with a hard bound.
		let guard = 0;
		while (cursor && guard++ < 100) {
			const dir = directories.value.find((d) => d.id === cursor && d.source === source);
			if (!dir) break;
			path.unshift(dir);
			cursor = dir.parentId;
		}
		return path;
	};

	/** All descendant directory ids of `id` (inclusive), used for cascade delete. */
	const descendantDirIds = (id: string): string[] => {
		const out = [id];
		const stack = [id];
		while (stack.length) {
			const cur = stack.pop()!;
			for (const d of directories.value) {
				if (d.parentId === cur) {
					out.push(d.id);
					stack.push(d.id);
				}
			}
		}
		return out;
	};
	// #endregion

	// #region Navigation
	const navigateTo = (source: StorageSource, dirId: string | null) => {
		activeSource.value = source;
		activeDirId.value = dirId;
		search.value = '';
	};

	const navigateToFile = (file: LibraryFile) => {
		navigateTo(file.source, file.directoryId);
	};
	// #endregion

	// #region Selection & details
	const toggleSelect = (file: LibraryFile) => {
		const next = new Map(selected.value);
		if (next.has(file.id)) {
			next.delete(file.id);
		} else if (!multiple) {
			next.clear();
			next.set(file.id, file);
		} else if (next.size < maxFiles) {
			next.set(file.id, file);
		} else {
			toast.warning(`Maximum of ${maxFiles} files can be selected.`);
			return;
		}
		selected.value = next;
	};

	const removeSelect = (id: string) => {
		if (!selected.value.has(id)) return;
		const next = new Map(selected.value);
		next.delete(id);
		selected.value = next;
	};

	const clearSelection = () => {
		selected.value = new Map();
	};

	const toggleDetails = (file: LibraryFile) => {
		activeFileId.value = activeFileId.value === file.id ? null : file.id;
	};
	// #endregion

	// #region Directory CRUD
	const persistFolder = async (method: string, body: unknown) => {
		// Best-effort persistence via the assumed folder API. Local state is the
		// source of truth; a rejected/absent endpoint never blocks the UI.
		try {
			await fetch('/api/v1/files/folders', {
				method,
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(body),
			});
		} catch {
			/* offline / stubbed endpoint — optimistic state already applied */
		}
	};

	const createDirectory = async (parentId: string | null, source: StorageSource) => {
		// Derive a unique "New folder" name within the target directory.
		const siblings = childDirectories(parentId, source).map((d) => d.name.toLowerCase());
		let name = 'New folder';
		let n = 2;
		while (siblings.includes(name.toLowerCase())) name = `New folder ${n++}`;

		const dir: DirectoryNode = { id: nextId('dir'), name, parentId, source };
		directories.value = [...directories.value, dir];
		navigateTo(source, parentId);

		if (source === 'local') await persistFolder('POST', { name, parentId });
	};

	const renameDirectory = async (id: string, name: string): Promise<boolean> => {
		const err = getNameError(name);
		if (err) {
			toast.error(err);
			return false;
		}
		const trimmed = name.trim();
		directories.value = directories.value.map((d) => d.id === id ? { ...d, name: trimmed } : d);

		const dir = directories.value.find((d) => d.id === id);
		if (dir?.source === 'local') await persistFolder('PATCH', { id, name: trimmed });
		return true;
	};

	const deleteDirectory = async (id: string) => {
		const target = directories.value.find((d) => d.id === id);
		if (!target) return;

		const removedIds = new Set(descendantDirIds(id));

		// Detach any selected files that lived inside the removed subtree.
		const nextSelected = new Map(selected.value);
		for (const [fid, file] of selected.value) {
			if (file.directoryId && removedIds.has(file.directoryId)) nextSelected.delete(fid);
		}
		selected.value = nextSelected;

		directories.value = directories.value.filter((d) => !removedIds.has(d.id));
		files.value = files.value.filter((f) => !(f.directoryId && removedIds.has(f.directoryId)));

		// If we were browsing inside the removed subtree, pop up to its parent.
		if (activeDirId.value && removedIds.has(activeDirId.value)) {
			navigateTo(target.source, target.parentId);
		}

		if (target.source === 'local') await persistFolder('DELETE', { id });
	};
	// #endregion

	// #region File actions
	const moveFile = (fileId: string, dirId: string | null, source: StorageSource) => {
		const file = files.value.find((f) => f.id === fileId);
		if (!file) return;
		if (file.directoryId === dirId && file.source === source) return;

		const updated: LibraryFile = { ...file, directoryId: dirId, source };
		files.value = files.value.map((f) => f.id === fileId ? updated : f);

		// Keep any live selection entry in sync with the moved file.
		if (selected.value.has(fileId)) {
			const next = new Map(selected.value);
			next.set(fileId, updated);
			selected.value = next;
		}

		const dest = dirId
			? directories.value.find((d) => d.id === dirId)?.name ?? SOURCE_LABELS[source]
			: SOURCE_LABELS[source];
		toast.success(`Moved "${file.name}" to ${dest}.`);
	};

	const renameFile = (id: string, name: string): boolean => {
		const err = getNameError(name);
		if (err) {
			toast.error(err);
			return false;
		}
		const trimmed = name.trim();
		const updated = files.value.find((f) => f.id === id);
		if (!updated) return false;

		const next: LibraryFile = { ...updated, name: trimmed };
		files.value = files.value.map((f) => f.id === id ? next : f);
		if (selected.value.has(id)) {
			const sel = new Map(selected.value);
			sel.set(id, next);
			selected.value = sel;
		}
		return true;
	};

	const deleteFile = (id: string) => {
		files.value = files.value.filter((f) => f.id !== id);
		removeSelect(id);
		if (activeFileId.value === id) activeFileId.value = null;
	};

	const addUploadedFiles = (incoming: File[]) => {
		const slotsRemaining = multiple ? maxFiles - selected.value.size : 1;
		if (multiple && slotsRemaining <= 0) {
			toast.error(`Maximum selection limit (${maxFiles}) reached.`);
			return;
		}

		const accepted: LibraryFile[] = [];
		for (const raw of incoming) {
			// Enforce the regex-safe naming rule on upload.
			const nameErr = getNameError(raw.name);
			if (nameErr) {
				toast.error(`${raw.name}: ${nameErr}`);
				continue;
			}
			const category = getFileCategory(raw) as FileCategory | 'Other';
			const candidate: LibraryFile = {
				id: nextId('upload'),
				name: raw.name,
				size: raw.size,
				mimeType: raw.type,
				category,
				// Contextual auto-save: land in the folder the user is browsing.
				directoryId: activeDirId.value,
				source: activeSource.value,
				createdAt: new Date().toISOString(),
				file: raw,
				meta: { uploadedAt: new Date().toISOString() },
			};
			if (!passesTypeGuard(candidate)) {
				toast.error(`File type not allowed: ${raw.name}`);
				continue;
			}
			accepted.push(candidate);
		}

		if (accepted.length === 0) return;

		let toAdd = accepted;
		if (multiple && accepted.length > slotsRemaining) {
			toast.warning(`Limit exceeded. Only adding ${slotsRemaining} file(s).`);
			toAdd = accepted.slice(0, slotsRemaining);
		}

		files.value = [...toAdd, ...files.value];

		// Auto-select the freshly uploaded assets.
		const nextSelected = new Map(selected.value);
		if (!multiple) nextSelected.clear();
		for (const file of toAdd) {
			if (!multiple || nextSelected.size < maxFiles) nextSelected.set(file.id, file);
		}
		selected.value = nextSelected;
	};
	// #endregion

	return {
		directories,
		files,
		services: SEED_SERVICES,
		activeSource,
		activeDirId,
		search,
		selected,
		activeFileId,
		viewMode,
		sortMode,
		typeFilter,
		treeCollapsed,
		passesTypeGuard,
		navigateTo,
		navigateToFile,
		toggleSelect,
		removeSelect,
		clearSelection,
		toggleDetails,
		createDirectory,
		renameDirectory,
		deleteDirectory,
		moveFile,
		renameFile,
		deleteFile,
		addUploadedFiles,
		childDirectories,
		directoryPath,
		fileCategoryFilter,
	};
}

/** Seeds the library with the mock catalogue plus any caller-supplied files. */
function seedWithInitial(initialFiles: FileWithMeta[]): LibraryFile[] {
	const mapped: LibraryFile[] = initialFiles.map((fm, i) => ({
		id: (fm.id as string) ?? `initial-${i}`,
		name: fm.file.name,
		size: fm.file.size,
		mimeType: fm.file.type,
		category: (fm.type as FileCategory | 'Other') ?? 'Other',
		directoryId: null,
		source: 'local' as StorageSource,
		createdAt: (fm.meta?.uploadedAt as string) ?? new Date().toISOString(),
		file: fm.file,
		meta: fm.meta,
	}));
	return [...mapped, ...SEED_FILES];
}

/** Converts a {@link LibraryFile} back into the `FileWithMeta` confirm payload. */
export function toFileWithMeta(file: LibraryFile): FileWithMeta {
	// Reuse the real File when present; otherwise synthesise a reference stub that
	// still reports the correct name / type to downstream consumers.
	const realFile = file.file ?? new File([], file.name, { type: file.mimeType });
	return {
		file: realFile,
		id: file.id,
		status: 'ready',
		progress: 100,
		errors: [],
		type: file.category,
		meta: {
			...(file.meta ?? {}),
			size: file.size,
			source: file.source,
			directoryId: file.directoryId,
			createdAt: file.createdAt,
		},
	};
}
