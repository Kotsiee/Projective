import { JSX } from 'preact';
import { useSignal } from '@preact/signals';
import {
	IconBrandGoogleDrive,
	IconBrandOnedrive,
	IconChevronRight,
	IconCloud,
	IconDeviceDesktop,
	IconFolder,
	IconFolderPlus,
	IconPencil,
	IconPlug,
	IconTrash,
} from '@tabler/icons-preact';
import { toast } from '@projective/ui';
import { LibraryStore } from './useLibraryStore.ts';
import { DirectoryNode, DRAG_FILE_MIME, SOURCE_LABELS, StorageSource } from './types.ts';
import { NameInput } from './NameInput.tsx';
import { ConfirmDialog } from './ConfirmDialog.tsx';

const SOURCE_ICON: Record<StorageSource, JSX.Element> = {
	'local': <IconDeviceDesktop size={17} />,
	'google-drive': <IconBrandGoogleDrive size={17} />,
	'onedrive': <IconBrandOnedrive size={17} />,
	'dropbox': <IconCloud size={17} />,
};

interface DirectoryTreeProps {
	store: LibraryStore;
}

/**
 * Column 1 — the collapsible directory tree plus cloud service roots. Supports
 * inline rename, create-subfolder, delete (with confirmation) and acts as a drop
 * target so files can be relocated by dragging them onto a folder node.
 */
export function DirectoryTree({ store }: DirectoryTreeProps) {
	// Expanded keys: directory ids and `source:<name>` for provider roots.
	const expanded = useSignal<Set<string>>(
		new Set(['source:local', 'source:google-drive', 'gd-projects']),
	);
	const editingId = useSignal<string | null>(null);
	const confirmId = useSignal<string | null>(null);
	const dropTargetId = useSignal<string | null>(null);

	const toggle = (key: string) => {
		const next = new Set(expanded.value);
		next.has(key) ? next.delete(key) : next.add(key);
		expanded.value = next;
	};

	const countFor = (dir: DirectoryNode): number => {
		const files =
			store.files.value.filter((f) => f.source === dir.source && f.directoryId === dir.id).length;
		const subdirs = store.childDirectories(dir.id, dir.source).length;
		return files + subdirs;
	};

	// #region Drag & drop relocation
	const readDraggedId = (e: DragEvent): string | null => {
		if (!e.dataTransfer) return null;
		return e.dataTransfer.getData(DRAG_FILE_MIME) || e.dataTransfer.getData('text/plain') || null;
	};

	const isInternalDrag = (e: DragEvent) =>
		!!e.dataTransfer && e.dataTransfer.types.includes(DRAG_FILE_MIME);

	const onDropInto = (e: DragEvent, dirId: string | null, source: StorageSource) => {
		e.preventDefault();
		e.stopPropagation();
		dropTargetId.value = null;
		const fileId = readDraggedId(e);
		if (fileId) store.moveFile(fileId, dirId, source);
	};
	// #endregion

	const confirmTarget = store.directories.value.find((d) => d.id === confirmId.value) ?? null;

	const renderDir = (dir: DirectoryNode, depth: number) => {
		const key = dir.id;
		const dropKey = `dir:${dir.id}`;
		const isOpen = expanded.value.has(key);
		const children = store.childDirectories(dir.id, dir.source);
		const isActive = store.activeSource.value === dir.source &&
			store.activeDirId.value === dir.id;
		const isDropping = dropTargetId.value === dropKey;
		const isEditing = editingId.value === dir.id;

		return (
			<div key={key} class='uf-tree__branch'>
				<div
					class={`uf-tree__row ${isActive ? 'uf-tree__row--active' : ''} ${
						isDropping ? 'uf-tree__row--dropping' : ''
					}`}
					style={{ paddingLeft: `${0.35 + depth * 0.85}rem` }}
					onClick={() => store.navigateTo(dir.source, dir.id)}
					onDragOver={(e) => {
						if (!isInternalDrag(e)) return;
						e.preventDefault();
						e.stopPropagation();
						dropTargetId.value = dropKey;
					}}
					onDragLeave={() => {
						if (dropTargetId.value === dropKey) dropTargetId.value = null;
					}}
					onDrop={(e) => onDropInto(e, dir.id, dir.source)}
				>
					<button
						type='button'
						class={`uf-tree__caret ${children.length ? '' : 'uf-tree__caret--empty'}`}
						aria-label={isOpen ? 'Collapse' : 'Expand'}
						onClick={(e) => {
							e.stopPropagation();
							if (children.length) toggle(key);
						}}
					>
						{children.length > 0 && (
							<IconChevronRight
								size={14}
								class={`uf-tree__caret-icon ${isOpen ? 'uf-tree__caret-icon--open' : ''}`}
							/>
						)}
					</button>

					<span class='uf-tree__icon'>
						<IconFolder size={16} />
					</span>

					{isEditing
						? (
							<NameInput
								initial={dir.name}
								className='uf-tree__rename'
								onCommit={async (name) => {
									editingId.value = null;
									await store.renameDirectory(dir.id, name);
								}}
								onCancel={() => (editingId.value = null)}
							/>
						)
						: <span class='uf-tree__label' title={dir.name}>{dir.name}</span>}

					{!isEditing && (
						<>
							<span class='uf-tree__count'>{countFor(dir)}</span>
							<span class='uf-tree__actions'>
								<button
									type='button'
									class='uf-tree__action'
									aria-label='New subfolder'
									onClick={(e) => {
										e.stopPropagation();
										expanded.value = new Set(expanded.value).add(key);
										store.createDirectory(dir.id, dir.source);
									}}
								>
									<IconFolderPlus size={15} />
								</button>
								<button
									type='button'
									class='uf-tree__action'
									aria-label='Rename folder'
									onClick={(e) => {
										e.stopPropagation();
										editingId.value = dir.id;
									}}
								>
									<IconPencil size={15} />
								</button>
								<button
									type='button'
									class='uf-tree__action uf-tree__action--danger'
									aria-label='Delete folder'
									onClick={(e) => {
										e.stopPropagation();
										confirmId.value = dir.id;
									}}
								>
									<IconTrash size={15} />
								</button>
							</span>
						</>
					)}
				</div>

				{isOpen && children.length > 0 && (
					<div class='uf-tree__children'>
						{children.map((child) => renderDir(child, depth + 1))}
					</div>
				)}
			</div>
		);
	};

	const renderSource = (source: StorageSource) => {
		const service = store.services.find((s) => s.source === source);
		const connected = source === 'local' ? true : service?.connected ?? false;
		const sourceKey = `source:${source}`;
		const dropKey = `root:${source}`;
		const isOpen = expanded.value.has(sourceKey);
		const roots = store.childDirectories(null, source);
		const isActiveRoot = store.activeSource.value === source && store.activeDirId.value === null;
		const isDropping = dropTargetId.value === dropKey;

		return (
			<div key={source} class='uf-tree__source'>
				<div
					class={`uf-tree__source-head ${isActiveRoot ? 'uf-tree__source-head--active' : ''} ${
						isDropping ? 'uf-tree__row--dropping' : ''
					}`}
					onClick={() => connected && store.navigateTo(source, null)}
					onDragOver={(e) => {
						if (!connected) return;
						if (!e.dataTransfer?.types.includes(DRAG_FILE_MIME)) return;
						e.preventDefault();
						dropTargetId.value = dropKey;
					}}
					onDragLeave={() => {
						if (dropTargetId.value === dropKey) dropTargetId.value = null;
					}}
					onDrop={(e) => connected && onDropInto(e, null, source)}
				>
					<button
						type='button'
						class='uf-tree__caret'
						aria-label={isOpen ? 'Collapse' : 'Expand'}
						onClick={(e) => {
							e.stopPropagation();
							toggle(sourceKey);
						}}
					>
						<IconChevronRight
							size={14}
							class={`uf-tree__caret-icon ${isOpen ? 'uf-tree__caret-icon--open' : ''}`}
						/>
					</button>

					<span class='uf-tree__source-icon'>{SOURCE_ICON[source]}</span>
					<span class='uf-tree__source-label'>{SOURCE_LABELS[source]}</span>

					{connected
						? (
							<span
								class='uf-tree__status uf-tree__status--connected'
								title='Connected'
							/>
						)
						: (
							<button
								type='button'
								class='uf-tree__connect'
								onClick={(e) => {
									e.stopPropagation();
									toast.info(`${SOURCE_LABELS[source]} integration is not connected yet.`);
								}}
							>
								<IconPlug size={13} /> Connect
							</button>
						)}
				</div>

				{isOpen && connected && (
					<div class='uf-tree__children'>
						{roots.length > 0
							? roots.map((dir) => renderDir(dir, 1))
							: <div class='uf-tree__empty'>Empty</div>}
						{source === 'local' && (
							<button
								type='button'
								class='uf-tree__add-root'
								onClick={(e) => {
									e.stopPropagation();
									store.createDirectory(null, 'local');
								}}
							>
								<IconFolderPlus size={15} /> New folder
							</button>
						)}
					</div>
				)}
			</div>
		);
	};

	return (
		<div class='uf-tree'>
			<div class='uf-tree__section-label'>Storage</div>
			{(['local', 'google-drive', 'onedrive', 'dropbox'] as StorageSource[]).map(renderSource)}

			<ConfirmDialog
				isOpen={confirmId.value !== null}
				title='Delete folder'
				message={confirmTarget
					? `Delete "${confirmTarget.name}" and everything inside it? This can't be undone.`
					: ''}
				confirmLabel='Delete folder'
				onCancel={() => (confirmId.value = null)}
				onConfirm={() => {
					const id = confirmId.value;
					confirmId.value = null;
					if (id) store.deleteDirectory(id);
				}}
			/>
		</div>
	);
}
