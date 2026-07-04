import { useSignal } from '@preact/signals';
import { useEffect, useMemo } from 'preact/hooks';
import {
	IconDownload,
	IconExternalLink,
	IconFolderShare,
	IconLayoutSidebarRightCollapse,
	IconPencil,
	IconTrash,
} from '@tabler/icons-preact';
import { Button, FileTypeIcon, IconButton, toast } from '@projective/ui';
import { formatFileSize } from '@projective/data';
import { LibraryStore } from './useLibraryStore.ts';
import { LibraryFile, SOURCE_LABELS } from './types.ts';
import { buildMoveOptions, Menu } from './Menu.tsx';
import { NameInput } from './NameInput.tsx';
import { ConfirmDialog } from './ConfirmDialog.tsx';

interface FileDetailsProps {
	store: LibraryStore;
	file: LibraryFile;
}

/**
 * Column 3 — the details panel for the active file. Supports inline rename,
 * download, open-original, move-to-folder and delete (with confirmation).
 */
export function FileDetails({ store, file }: FileDetailsProps) {
	const editingName = useSignal(false);
	const confirmDelete = useSignal(false);

	const isImage = file.category === 'Image' && !!file.file;
	const objectUrl = useMemo(
		() => (isImage && file.file ? URL.createObjectURL(file.file) : undefined),
		[file.id],
	);
	useEffect(() => () => {
		if (objectUrl) URL.revokeObjectURL(objectUrl);
	}, [objectUrl]);

	const path = store.directoryPath(file.directoryId, file.source);
	const sourcePath = [SOURCE_LABELS[file.source], ...path.map((d) => d.name), file.name].join(
		' / ',
	);
	const created = formatDate(file.createdAt);

	const download = () => {
		if (!file.file) {
			toast.info('This is a linked reference — open it from its source to download.');
			return;
		}
		const url = URL.createObjectURL(file.file);
		const a = document.createElement('a');
		a.href = url;
		a.download = file.name;
		a.click();
		URL.revokeObjectURL(url);
	};

	return (
		<div class='uf-details'>
			<div class='uf-details__header'>
				<IconButton
					variant='secondary'
					ghost
					size='small'
					aria-label='Close details'
					onClick={() => (store.activeFileId.value = null)}
				>
					<IconLayoutSidebarRightCollapse size={18} />
				</IconButton>
				<span class='uf-details__title'>File details</span>
			</div>

			<div class='uf-details__body'>
				<div class='uf-details__preview'>
					{objectUrl
						? <img src={objectUrl} alt={file.name} class='uf-details__image' />
						: (
							<FileTypeIcon
								name={file.name}
								mimeType={file.mimeType}
								category={file.category}
								variant='plain'
								size={64}
							/>
						)}
				</div>

				<div class='uf-details__name-row'>
					{editingName.value
						? (
							<NameInput
								initial={file.name}
								selectBaseName
								className='uf-details__name-editor'
								onCommit={(name) => {
									editingName.value = false;
									store.renameFile(file.id, name);
								}}
								onCancel={() => (editingName.value = false)}
							/>
						)
						: (
							<>
								<span class='uf-details__name' title={file.name}>{file.name}</span>
								<button
									type='button'
									class='uf-details__name-edit'
									aria-label='Rename file'
									onClick={() => (editingName.value = true)}
								>
									<IconPencil size={15} />
								</button>
							</>
						)}
				</div>

				<dl class='uf-details__meta'>
					<Row label='Type' value={file.category} />
					<Row label='Size' value={formatFileSize(file.size)} />
					<Row label='Created' value={created} />
					<Row label='Source' value={sourcePath} multiline />
				</dl>

				<div class='uf-details__actions'>
					<Button
						variant='secondary'
						fullWidth
						startIcon={<IconDownload size={16} />}
						onClick={download}
					>
						Download
					</Button>
					<Button
						variant='secondary'
						fullWidth
						startIcon={<IconExternalLink size={16} />}
						onClick={() => toast.info(`Opening "${file.name}" in ${SOURCE_LABELS[file.source]}…`)}
					>
						Open original
					</Button>

					<Menu
						align='left'
						className='uf-details__move'
						trigger={
							<span class='uf-details__move-btn'>
								<IconFolderShare size={16} /> Move to folder
							</span>
						}
						items={buildMoveOptions(store, file.id)}
					/>

					<Button
						variant='danger'
						ghost
						fullWidth
						startIcon={<IconTrash size={16} />}
						onClick={() => (confirmDelete.value = true)}
					>
						Delete file
					</Button>
				</div>
			</div>

			<ConfirmDialog
				isOpen={confirmDelete.value}
				title='Delete file'
				message={`Delete "${file.name}"? This can't be undone.`}
				confirmLabel='Delete file'
				onCancel={() => (confirmDelete.value = false)}
				onConfirm={() => {
					confirmDelete.value = false;
					store.deleteFile(file.id);
				}}
			/>
		</div>
	);
}

function Row({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
	return (
		<div class={`uf-details__row ${multiline ? 'uf-details__row--multiline' : ''}`}>
			<dt class='uf-details__row-label'>{label}</dt>
			<dd class='uf-details__row-value'>{value}</dd>
		</div>
	);
}

function formatDate(iso: string): string {
	try {
		return new Date(iso).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	} catch {
		return iso;
	}
}
