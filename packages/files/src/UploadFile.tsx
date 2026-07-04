import './styles/upload-file.css';
import { useComputed } from '@preact/signals';
import { FileCategory, FileWithMeta } from '@projective/types';
import { MenuSelect, TextField } from '@projective/fields';
import { Button, ButtonGroup, IconButton, Overlay } from '@projective/ui';
import {
	IconCloudUpload,
	IconGridDots,
	IconLayoutSidebar,
	IconLayoutSidebarLeftCollapse,
	IconList,
	IconSearch,
	IconSortAscending,
	IconX,
} from '@tabler/icons-preact';
import { JSX } from 'preact';
import { useRef } from 'preact/hooks';
import { useSignal } from '@preact/signals';

import { toFileWithMeta, useLibraryStore } from './library/useLibraryStore.ts';
import { buildMatcher } from './library/search.ts';
import { DirectoryNode, LibraryFile, SortOption } from './library/types.ts';
import { DirectoryTree } from './library/DirectoryTree.tsx';
import { Breadcrumbs } from './library/Breadcrumbs.tsx';
import { FileGrid } from './library/FileGrid.tsx';
import { FileDetails } from './library/FileDetails.tsx';
import { SelectionTray } from './library/SelectionTray.tsx';

interface UploadFileProps {
	isOpen: boolean;
	onClose: () => void;
	/** Fired when the user clicks 'Confirm selection' */
	onConfirm?: (files: FileWithMeta[]) => void;
	/** Data source for previously uploaded files */
	initialFiles?: FileWithMeta[];
	/** Allow multiple files to be selected? Defaults to true. */
	multiple?: boolean;
	/** Maximum number of total files that can be selected. Defaults to 10. */
	maxFiles?: number;
	/** Array of allowed generic categories (e.g. ['Image', 'Document']) */
	allowedCategories?: FileCategory[];
	/** Array of allowed file extensions or MIME types (e.g. ['.png', '.pdf', 'image/jpeg']) */
	allowedFileTypes?: string[];
}

/**
 * A multi-column directory browser for attaching files from the local library or
 * connected cloud storage. Column 1 is a collapsible directory tree, column 2 the
 * main file view (breadcrumbs, search, grid/list), column 3 a details panel that
 * expands when a file is active.
 */
export function UploadFileIsland({
	isOpen,
	onClose,
	onConfirm,
	initialFiles = [],
	multiple = true,
	maxFiles = 10,
	allowedCategories,
	allowedFileTypes,
}: UploadFileProps) {
	const store = useLibraryStore({
		multiple,
		maxFiles,
		allowedCategories,
		allowedFileTypes,
		initialFiles,
	});

	const fileInputRef = useRef<HTMLInputElement>(null);
	const dragCounter = useRef(0);
	const isDragOver = useSignal(false);

	// #region Derived view (search overrides the scoped folder view)
	const view = useComputed<{ dirs: DirectoryNode[]; files: LibraryFile[]; searching: boolean }>(
		() => {
			const query = store.search.value.trim();

			if (query) {
				// Global search: match file AND directory names across every source.
				const matcher = buildMatcher(query);
				const dirs = store.directories.value.filter((d) => matcher(d.name));
				const files = store.files.value.filter((f) =>
					store.passesTypeGuard(f) && store.fileCategoryFilter(f) && matcher(f.name)
				);
				return { dirs, files: sortFiles(files, store.sortMode.value), searching: true };
			}

			// Scoped folder view.
			const dirs = store.childDirectories(store.activeDirId.value, store.activeSource.value);
			const files = store.files.value.filter((f) =>
				f.source === store.activeSource.value &&
				f.directoryId === store.activeDirId.value &&
				store.passesTypeGuard(f) && store.fileCategoryFilter(f)
			);
			return { dirs, files: sortFiles(files, store.sortMode.value), searching: false };
		},
	);
	// #endregion

	const activeFile = useComputed(() =>
		store.files.value.find((f) => f.id === store.activeFileId.value) ?? null
	);

	// #region Upload + drag/drop of OS files
	const handleFileInput = (e: JSX.TargetedEvent<HTMLInputElement>) => {
		if (e.currentTarget.files && e.currentTarget.files.length > 0) {
			store.addUploadedFiles(Array.from(e.currentTarget.files));
			e.currentTarget.value = '';
		}
	};

	const handleDragEnter = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounter.current++;
		// Only react to OS file drags — internal file→folder drags carry a custom MIME.
		if (e.dataTransfer?.types.includes('Files')) isDragOver.value = true;
	};

	const handleDragLeave = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounter.current--;
		if (dragCounter.current === 0) isDragOver.value = false;
	};

	const handleDrop = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounter.current = 0;
		isDragOver.value = false;
		if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
			store.addUploadedFiles(Array.from(e.dataTransfer.files));
		}
	};
	// #endregion

	const handleConfirm = () => {
		onConfirm?.([...store.selected.value.values()].map(toFileWithMeta));
		onClose();
	};

	const selectionCount = store.selected.value.size;
	const detailsOpen = activeFile.value !== null;

	return (
		<Overlay
			type='modal'
			isOpen={isOpen}
			onClose={onClose}
			width={1060}
			height={780}
			className='upload-file-modal'
		>
			<div
				class='upload-file'
				onDragEnter={handleDragEnter}
				onDragOver={(e) => {
					e.preventDefault();
					e.stopPropagation();
				}}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
			>
				<input
					type='file'
					ref={fileInputRef}
					multiple={multiple}
					accept={allowedFileTypes?.join(',')}
					onChange={handleFileInput}
					style={{ display: 'none' }}
				/>

				{isDragOver.value && (
					<div class='upload-file__drop-overlay'>
						<IconCloudUpload size={48} />
						<h2>Drop files to upload</h2>
					</div>
				)}

				{/* Header */}
				<header class='upload-file__header'>
					<IconButton
						variant='secondary'
						ghost
						aria-label={store.treeCollapsed.value ? 'Show folders' : 'Hide folders'}
						onClick={() => (store.treeCollapsed.value = !store.treeCollapsed.value)}
					>
						{store.treeCollapsed.value
							? <IconLayoutSidebar size={20} />
							: <IconLayoutSidebarLeftCollapse size={20} />}
					</IconButton>
					<div class='upload-file__heading'>
						<h2 class='upload-file__title'>Select files</h2>
						<p class='upload-file__subtitle'>Attach from your library or connected storage</p>
					</div>
					<IconButton variant='secondary' ghost rounded aria-label='Close' onClick={onClose}>
						<IconX size={20} />
					</IconButton>
				</header>

				{/* Columns */}
				<div class='upload-file__columns'>
					{!store.treeCollapsed.value && (
						<aside class='upload-file__col upload-file__col--tree'>
							<DirectoryTree store={store} />
						</aside>
					)}

					<section class='upload-file__col upload-file__col--main'>
						<div class='upload-file__toolbar'>
							<TextField
								placeholder='Search library…'
								value={store.search}
								prefix={<IconSearch size={16} />}
								className='upload-file__search'
							/>
							<MenuSelect
								value={store.typeFilter.value}
								onChange={(v) => (store.typeFilter.value = v)}
								options={[
									{ label: 'All types', value: 'all' },
									{ label: 'Images', value: 'image' },
									{ label: 'Documents', value: 'document' },
									{ label: 'Audio', value: 'audio' },
									{ label: 'Video', value: 'video' },
									{ label: 'Vectors', value: 'vector' },
								]}
								aria-label='Filter by type'
							/>
							<MenuSelect<SortOption>
								value={store.sortMode.value}
								onChange={(v) => (store.sortMode.value = v)}
								icon={<IconSortAscending size={16} />}
								options={[
									{ label: 'Newest first', value: 'uploaded_desc' },
									{ label: 'Alphabetical', value: 'alphabetical_asc' },
									{ label: 'Last used', value: 'last_used_desc' },
								]}
								aria-label='Sort'
							/>
							<ButtonGroup>
								<IconButton
									variant={store.viewMode.value === 'list' ? 'primary' : 'secondary'}
									aria-label='List view'
									onClick={() => (store.viewMode.value = 'list')}
								>
									<IconList size={18} />
								</IconButton>
								<IconButton
									variant={store.viewMode.value === 'grid' ? 'primary' : 'secondary'}
									aria-label='Grid view'
									onClick={() => (store.viewMode.value = 'grid')}
								>
									<IconGridDots size={18} />
								</IconButton>
							</ButtonGroup>
						</div>

						{view.value.searching
							? (
								<div class='upload-file__searching-note'>
									Showing global results for "{store.search.value.trim()}"
								</div>
							)
							: <Breadcrumbs store={store} />}

						<div class='upload-file__scroll'>
							<FileGrid
								store={store}
								directories={view.value.dirs}
								files={view.value.files}
								showPaths={view.value.searching}
								emptyLabel={view.value.searching
									? 'No files or folders match your search.'
									: 'This folder is empty.'}
							/>
						</div>
					</section>

					{detailsOpen && (
						<aside class='upload-file__col upload-file__col--details'>
							<FileDetails store={store} file={activeFile.value!} />
						</aside>
					)}
				</div>

				<SelectionTray store={store} />

				{/* Footer */}
				<footer class='upload-file__footer'>
					<Button
						variant='secondary'
						startIcon={<IconCloudUpload size={18} />}
						onClick={() => fileInputRef.current?.click()}
					>
						Upload new
					</Button>
					<Button
						variant='primary'
						className='upload-file__confirm'
						onClick={handleConfirm}
						disabled={selectionCount === 0}
					>
						{selectionCount > 0 ? `Confirm selection (${selectionCount})` : 'Select a file'}
					</Button>
				</footer>
			</div>
		</Overlay>
	);
}

/** Sorts library files by the chosen toolbar option. */
function sortFiles(files: LibraryFile[], mode: SortOption): LibraryFile[] {
	const copy = [...files];
	copy.sort((a, b) => {
		if (mode === 'alphabetical_asc') return a.name.localeCompare(b.name);
		if (mode === 'last_used_desc') {
			return time(b.lastUsed) - time(a.lastUsed);
		}
		return time(b.createdAt) - time(a.createdAt);
	});
	return copy;
}

function time(iso?: string): number {
	if (!iso) return 0;
	const t = new Date(iso).getTime();
	return Number.isNaN(t) ? 0 : t;
}
