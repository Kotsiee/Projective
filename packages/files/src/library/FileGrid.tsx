import { Signal, useSignal } from '@preact/signals';
import { useEffect, useMemo } from 'preact/hooks';
import {
	IconCheck,
	IconDotsVertical,
	IconEye,
	IconFolder,
	IconFolderShare,
	IconPencil,
	IconTrash,
} from '@tabler/icons-preact';
import { FileTypeIcon, resolveFileVisual } from '@projective/ui';
import { formatFileSize } from '@projective/data';
import { LibraryStore } from './useLibraryStore.ts';
import { DirectoryNode, DRAG_FILE_MIME, LibraryFile, SOURCE_LABELS } from './types.ts';
import { buildMoveOptions, Menu, MenuItem } from './Menu.tsx';
import { NameInput } from './NameInput.tsx';
import { ConfirmDialog } from './ConfirmDialog.tsx';

interface FileGridProps {
	store: LibraryStore;
	directories: DirectoryNode[];
	files: LibraryFile[];
	/** When true, cards show their full source/folder path (used in search). */
	showPaths?: boolean;
	emptyLabel: string;
}

/** The center-column visualization of subfolders and files. */
export function FileGrid({ store, directories, files, showPaths, emptyLabel }: FileGridProps) {
	const isGrid = store.viewMode.value === 'grid';
	const renamingId = useSignal<string | null>(null);
	const confirmDeleteId = useSignal<string | null>(null);

	const pendingDelete = files.find((f) => f.id === confirmDeleteId.value) ?? null;

	if (directories.length === 0 && files.length === 0) {
		return <div class='upload-file__empty'>{emptyLabel}</div>;
	}

	return (
		<>
			<div class={`upload-file__${isGrid ? 'grid' : 'list'}`}>
				{directories.map((dir) => <FolderCard key={dir.id} store={store} dir={dir} />)}
				{files.map((file) => (
					<FileCard
						key={file.id}
						store={store}
						file={file}
						showPath={showPaths}
						renamingId={renamingId}
						onRename={() => (renamingId.value = file.id)}
						onDelete={() => (confirmDeleteId.value = file.id)}
					/>
				))}
			</div>

			<ConfirmDialog
				isOpen={confirmDeleteId.value !== null}
				title='Delete file'
				message={pendingDelete ? `Delete "${pendingDelete.name}"? This can't be undone.` : ''}
				confirmLabel='Delete file'
				onCancel={() => (confirmDeleteId.value = null)}
				onConfirm={() => {
					const id = confirmDeleteId.value;
					confirmDeleteId.value = null;
					if (id) store.deleteFile(id);
				}}
			/>
		</>
	);
}

// #region Folder card
function FolderCard({ store, dir }: { store: LibraryStore; dir: DirectoryNode }) {
	const isGrid = store.viewMode.value === 'grid';
	const dropping = useSignal(false);
	const count = store.files.value.filter((f) => f.directoryId === dir.id).length +
		store.childDirectories(dir.id, dir.source).length;

	return (
		<div
			class={`upload-file-card upload-file-card--folder ${
				isGrid ? 'upload-file-card--grid' : 'upload-file-card--list'
			} ${dropping.value ? 'upload-file-card--dropping' : ''}`}
			onClick={() => store.navigateTo(dir.source, dir.id)}
			onDragOver={(e) => {
				if (!e.dataTransfer?.types.includes(DRAG_FILE_MIME)) return;
				e.preventDefault();
				e.stopPropagation();
				dropping.value = true;
			}}
			onDragLeave={() => (dropping.value = false)}
			onDrop={(e) => {
				e.preventDefault();
				e.stopPropagation();
				dropping.value = false;
				const id = e.dataTransfer?.getData(DRAG_FILE_MIME) ||
					e.dataTransfer?.getData('text/plain');
				if (id) store.moveFile(id, dir.id, dir.source);
			}}
		>
			<div class='upload-file-card__preview upload-file-card__preview--folder'>
				<IconFolder size={isGrid ? 40 : 22} stroke={1.6} />
			</div>
			<div class='upload-file-card__footer'>
				<span class='upload-file-card__name' title={dir.name}>{dir.name}</span>
				<span class='upload-file-card__meta'>{count} item{count === 1 ? '' : 's'}</span>
			</div>
		</div>
	);
}
// #endregion

// #region File card
interface FileCardProps {
	store: LibraryStore;
	file: LibraryFile;
	showPath?: boolean;
	renamingId: Signal<string | null>;
	onRename: () => void;
	onDelete: () => void;
}

function FileCard({ store, file, showPath, renamingId, onRename, onDelete }: FileCardProps) {
	const isGrid = store.viewMode.value === 'grid';
	const isSelected = store.selected.value.has(file.id);
	const isActive = store.activeFileId.value === file.id;
	const isRenaming = renamingId.value === file.id;
	const isImage = file.category === 'Image' && !!file.file;

	// Create (and clean up) an object URL only for locally held image files.
	const objectUrl = useMemo(
		() => (isImage && file.file ? URL.createObjectURL(file.file) : undefined),
		[file.id],
	);
	useEffect(() => () => {
		if (objectUrl) URL.revokeObjectURL(objectUrl);
	}, [objectUrl]);

	const visual = resolveFileVisual({
		name: file.name,
		mimeType: file.mimeType,
		category: file.category,
	});

	const pathLabel = showPath ? locationLabel(store, file) : file.category;
	const meta = `${formatFileSize(file.size)} · ${pathLabel}`;

	const menuItems: MenuItem[] = [
		{
			key: 'details',
			label: isActive ? 'Hide details' : 'View details',
			icon: <IconEye size={15} />,
			onSelect: () => store.toggleDetails(file),
		},
		{
			key: 'rename',
			label: 'Rename',
			icon: <IconPencil size={15} />,
			onSelect: onRename,
		},
		{
			key: 'move',
			label: 'Move to…',
			icon: <IconFolderShare size={15} />,
			submenuTitle: 'Move to folder',
			submenu: buildMoveOptions(store, file.id),
		},
		{
			key: 'delete',
			label: 'Delete file',
			icon: <IconTrash size={15} />,
			danger: true,
			onSelect: onDelete,
		},
	];

	return (
		<div
			class={`upload-file-card ${isGrid ? 'upload-file-card--grid' : 'upload-file-card--list'} ${
				isSelected ? 'upload-file-card--selected' : ''
			} ${isActive ? 'upload-file-card--active' : ''}`}
			draggable={!isRenaming}
			onClick={() => !isRenaming && store.toggleDetails(file)}
			onDragStart={(e) => {
				if (!e.dataTransfer) return;
				e.dataTransfer.setData(DRAG_FILE_MIME, file.id);
				e.dataTransfer.setData('text/plain', file.id);
				e.dataTransfer.effectAllowed = 'move';
			}}
		>
			<div class='upload-file-card__preview'>
				{objectUrl
					? <img src={objectUrl} alt={file.name} class='upload-file-card__image' />
					: (
						<FileTypeIcon
							name={file.name}
							mimeType={file.mimeType}
							category={file.category}
							variant='plain'
							size={isGrid ? 38 : 22}
						/>
					)}
			</div>

			<div class='upload-file-card__footer'>
				{isRenaming
					? (
						<NameInput
							initial={file.name}
							selectBaseName
							onCommit={(name) => {
								renamingId.value = null;
								store.renameFile(file.id, name);
							}}
							onCancel={() => (renamingId.value = null)}
						/>
					)
					: <span class='upload-file-card__name' title={file.name}>{file.name}</span>}
				<div class='upload-file-card__sub'>
					<span class='upload-file-card__badge' style={{ backgroundColor: visual.color }}>
						{visual.letter}
					</span>
					<span class='upload-file-card__meta' title={meta}>{meta}</span>
				</div>
			</div>

			{/* Selection checkbox — separate affordance from the details toggle. */}
			<button
				type='button'
				class={`upload-file-card__check ${
					isSelected ? 'upload-file-card__check--on' : 'upload-file-card__check--off'
				}`}
				aria-label={isSelected ? 'Deselect file' : 'Select file'}
				aria-pressed={isSelected}
				onClick={(e) => {
					e.stopPropagation();
					store.toggleSelect(file);
				}}
			>
				{isSelected && <IconCheck size={14} />}
			</button>

			<div class='upload-file-card__menu' onClick={(e) => e.stopPropagation()}>
				<Menu
					align='right'
					trigger={
						<span class='upload-file-card__menu-btn' aria-label='File actions'>
							<IconDotsVertical size={16} />
						</span>
					}
					items={menuItems}
				/>
			</div>
		</div>
	);
}
// #endregion

/** A file's location as "Source / Folder / Subfolder", used in search results. */
function locationLabel(store: LibraryStore, file: LibraryFile): string {
	const path = store.directoryPath(file.directoryId, file.source);
	return [SOURCE_LABELS[file.source], ...path.map((d) => d.name)].join(' / ');
}
