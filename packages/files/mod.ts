// @projective/files — shared file library / picker components.
// The UploadFile modal (multi-column directory browser) and its supporting
// store + types, extracted out of apps/web so any feature can reuse it.

export * from './src/UploadFile.tsx';

// Store + types, exposed for callers that need to drive or type the library
// (e.g. building a submission deliverable bundle from selected files).
export {
	type LibraryStore,
	type LibraryStoreConfig,
	toFileWithMeta,
	useLibraryStore,
} from './src/library/useLibraryStore.ts';
export type {
	CloudService,
	DirectoryNode,
	LibraryFile,
	SortOption,
	StorageSource,
	ViewMode,
} from './src/library/types.ts';
