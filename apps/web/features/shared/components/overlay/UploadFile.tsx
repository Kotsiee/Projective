import '../../styles/components/overlay/upload-file.css';
import { useComputed, useSignal } from '@preact/signals';
import { FileCategory, FileWithMeta, getFileCategory } from '@projective/types';
import { DataDisplay, formatFileSize } from '@projective/data';
import { SelectField, TextField } from '@projective/fields';
import {
	Button,
	ButtonGroup,
	FileTypeIcon,
	IconButton,
	Overlay,
	resolveFileVisual,
	toast,
} from '@projective/ui';
import {
	IconCheck,
	IconCloudUpload,
	IconGridDots,
	IconList,
	IconSearch,
	IconSortAscending,
} from '@tabler/icons-preact';
import { JSX } from 'preact';
import { useRef } from 'preact/hooks';

interface UploadFileProps {
	isOpen: boolean;
	onClose: () => void;
	/** Fired when the user clicks 'Confirm Selection' */
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

type ViewMode = 'list' | 'grid';
type SortOption = 'uploaded_desc' | 'alphabetical_asc' | 'last_used_desc';

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
	// #region State & Refs
	const viewMode = useSignal<ViewMode>('grid');
	const searchQuery = useSignal('');
	const sortMode = useSignal<SortOption>('uploaded_desc');
	const activeFilter = useSignal<string>('all');
	const uploadedFiles = useSignal<FileWithMeta[]>([]);
	const selectedFiles = useSignal<Map<string, FileWithMeta>>(new Map());

	const fileInputRef = useRef<HTMLInputElement>(null);
	const dragCounter = useRef(0);
	const isDragOver = useSignal(false);
	// #endregion

	// #region Handlers & File Processing
	const validateFile = (file: File, category: FileCategory): boolean => {
		if (allowedCategories && allowedCategories.length > 0) {
			if (!allowedCategories.includes(category)) return false;
		}

		if (allowedFileTypes && allowedFileTypes.length > 0) {
			const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
			const mime = file.type.toLowerCase();

			const matchesExt = allowedFileTypes.some((t) => t.toLowerCase() === extension);
			const matchesMime = allowedFileTypes.some((t) => t.toLowerCase() === mime);

			if (!matchesExt && !matchesMime) return false;
		}

		return true;
	};

	const processFiles = (files: File[]) => {
		const currentSelectedCount = selectedFiles.value.size;
		let slotsRemaining = multiple ? maxFiles - currentSelectedCount : 1;

		if (slotsRemaining <= 0 && multiple) {
			toast.error(`Maximum selection limit (${maxFiles}) reached.`);
			return;
		}

		const validFiles: File[] = [];
		for (const file of files) {
			const category = getFileCategory(file) as FileCategory;
			if (validateFile(file, category)) {
				validFiles.push(file);
			} else {
				toast.error(`File type not allowed: ${file.name}`);
			}
		}

		if (validFiles.length === 0) return;

		let filesToAdd = validFiles;
		if (multiple && validFiles.length > slotsRemaining) {
			toast.warning(`Limit exceeded. Only adding ${slotsRemaining} file(s).`);
			filesToAdd = validFiles.slice(0, slotsRemaining);
		}

		const processed: FileWithMeta[] = filesToAdd.map((f) => ({
			file: f,
			id: crypto.randomUUID(),
			status: 'ready',
			progress: 100,
			errors: [],
			type: getFileCategory(f) as FileCategory,
			meta: {
				uploadedAt: new Date().toISOString(),
			},
		}));

		// Add to newly uploaded array
		uploadedFiles.value = [...processed, ...uploadedFiles.value];

		// Automatically select newly uploaded files
		const newSelectedMap = new Map(selectedFiles.value);
		if (!multiple) newSelectedMap.clear();

		processed.forEach((p) => {
			if (!multiple || newSelectedMap.size < maxFiles) {
				newSelectedMap.set(p.id as string, p);
			}
		});
		selectedFiles.value = newSelectedMap;
	};

	// Robust drag and drop to prevent UI getting stuck
	const handleDragEnter = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounter.current++;
		if (e.dataTransfer?.types.includes('Files')) {
			isDragOver.value = true;
		}
	};

	const handleDragLeave = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounter.current--;
		if (dragCounter.current === 0) {
			isDragOver.value = false;
		}
	};

	const handleDrop = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounter.current = 0;
		isDragOver.value = false;

		if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
			processFiles(Array.from(e.dataTransfer.files));
		}
	};

	const handleFileInput = (e: JSX.TargetedEvent<HTMLInputElement>) => {
		if (e.currentTarget.files && e.currentTarget.files.length > 0) {
			processFiles(Array.from(e.currentTarget.files));
			e.currentTarget.value = '';
		}
	};

	const handleItemClick = (item: FileWithMeta) => {
		const newSelectedMap = new Map(selectedFiles.value);

		if (newSelectedMap.has(item.id as string)) {
			newSelectedMap.delete(item.id as string);
		} else {
			if (!multiple) {
				newSelectedMap.clear();
				newSelectedMap.set(item.id as string, item);
			} else if (newSelectedMap.size < maxFiles) {
				newSelectedMap.set(item.id as string, item);
			} else {
				toast.warning(`Maximum of ${maxFiles} files can be selected.`);
			}
		}

		selectedFiles.value = newSelectedMap;
	};

	const handleConfirm = () => {
		if (onConfirm) {
			onConfirm(Array.from(selectedFiles.value.values()));
		}
		onClose();
	};
	// #endregion

	// #region Computed Data (Library)
	const filteredLibraryData = useComputed(() => {
		let data = [...initialFiles];

		// Enforce initial strict filters
		data = data.filter((f) => validateFile(f.file, f.type as FileCategory));

		// 1. Search
		if (searchQuery.value) {
			const query = searchQuery.value.toLowerCase();
			data = data.filter((f) => f.file.name.toLowerCase().includes(query));
		}

		// 2. User Filter
		if (activeFilter.value !== 'all') {
			data = data.filter((f) => f.type?.toLowerCase() === activeFilter.value);
		}

		// 3. Sort
		data.sort((a, b) => {
			if (sortMode.value === 'alphabetical_asc') {
				return a.file.name.localeCompare(b.file.name);
			}
			if (sortMode.value === 'last_used_desc') {
				const timeA = a.meta?.lastUsed ? new Date(a.meta.lastUsed).getTime() : 0;
				const timeB = b.meta?.lastUsed ? new Date(b.meta.lastUsed).getTime() : 0;
				return timeB - timeA;
			}
			const dateA = a.meta?.uploadedAt ? new Date(a.meta.uploadedAt).getTime() : 0;
			const dateB = b.meta?.uploadedAt ? new Date(b.meta.uploadedAt).getTime() : 0;
			return dateB - dateA;
		});

		return data;
	});
	// #endregion

	// #region Renderers
	const renderFileItem = (item: FileWithMeta) => {
		const isGrid = viewMode.value === 'grid';
		const isSelected = selectedFiles.value.has(item.id as string);
		const isImage = item.type === 'Image';
		const objectUrl = isImage ? URL.createObjectURL(item.file) : undefined;
		const visual = resolveFileVisual({
			name: item.file.name,
			mimeType: item.file.type,
			category: item.type,
		});
		const meta = `${formatFileSize(item.file.size)} · ${item.type ?? 'File'}`;

		return (
			<div
				className={`upload-file-card ${
					isGrid ? 'upload-file-card--grid' : 'upload-file-card--list'
				} ${isSelected ? 'upload-file-card--selected' : ''}`}
				onClick={() => handleItemClick(item)}
				draggable
				onDragStart={(e) => {
					if (e.dataTransfer) {
						e.dataTransfer.setData('application/json', JSON.stringify(item));
						e.dataTransfer.effectAllowed = 'copy';
					}
				}}
			>
				<div className='upload-file-card__preview'>
					{isImage && objectUrl
						? <img src={objectUrl} alt={item.file.name} className='upload-file-card__image' />
						: (
							<FileTypeIcon
								name={item.file.name}
								mimeType={item.file.type}
								category={item.type}
								variant='plain'
								size={isGrid ? 38 : 22}
							/>
						)}
				</div>

				<div className='upload-file-card__footer'>
					<span className='upload-file-card__name' title={item.file.name}>{item.file.name}</span>
					<div className='upload-file-card__sub'>
						<span
							className='upload-file-card__badge'
							style={{ backgroundColor: visual.color }}
						>
							{visual.letter}
						</span>
						<span className='upload-file-card__meta'>{meta}</span>
					</div>
				</div>

				{isSelected && (
					<span className='upload-file-card__check'>
						<IconCheck size={14} />
					</span>
				)}
			</div>
		);
	};
	// #endregion

	return (
		<Overlay
			type='side'
			side='right'
			isOpen={isOpen}
			onClose={onClose}
			title='Select Files'
		>
			<div
				className='upload-file__layout'
				onDragEnter={handleDragEnter}
				onDragOver={(e) => {
					e.preventDefault();
					e.stopPropagation();
				}}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
			>
				{/* Hidden File Input */}
				<input
					type='file'
					ref={fileInputRef}
					multiple={multiple}
					accept={allowedFileTypes?.join(',')}
					onChange={handleFileInput}
					style={{ display: 'none' }}
				/>

				{/* Fixed Drag Overlay */}
				{isDragOver.value && (
					<div className='upload-file__drop-overlay'>
						<IconCloudUpload size={48} />
						<h2>Drop files to upload</h2>
					</div>
				)}

				{/* Toolbar */}
				<div className='upload-file__toolbar'>
					<TextField
						placeholder='Search library...'
						value={searchQuery}
						prefix={<IconSearch size={16} />}
						className='upload-file__search'
					/>
					<SelectField
						options={[
							{ label: 'All Types', value: 'all' },
							{ label: 'Images', value: 'image' },
							{ label: 'Documents', value: 'document' },
							{ label: 'Video', value: 'video' },
						]}
						value={activeFilter}
						className='upload-file__filter'
					/>
					<SelectField
						options={[
							{ label: 'Newest First', value: 'uploaded_desc' },
							{ label: 'Alphabetical', value: 'alphabetical_asc' },
							{ label: 'Last Used', value: 'last_used_desc' },
						]}
						value={sortMode}
						prefix={<IconSortAscending size={16} />}
						className='upload-file__sort'
					/>
					<ButtonGroup>
						<IconButton
							variant={viewMode.value === 'list' ? 'primary' : 'secondary'}
							aria-label='List View'
							onClick={() => viewMode.value = 'list'}
						>
							<IconList size={18} />
						</IconButton>
						<IconButton
							variant={viewMode.value === 'grid' ? 'primary' : 'secondary'}
							aria-label='Grid View'
							onClick={() => viewMode.value = 'grid'}
						>
							<IconGridDots size={18} />
						</IconButton>
					</ButtonGroup>
				</div>

				{/* Content Area */}
				<div className='upload-file__content'>
					{/* Local Uploads Section */}
					{uploadedFiles.value.length > 0 && (
						<div>
							<div className='upload-file__section-title'>New Uploads</div>
							<div className={`upload-file__${viewMode.value}`}>
								{uploadedFiles.value.map((fileMeta) => (
									<div key={fileMeta.id} style={{ position: 'relative' }}>
										{renderFileItem(fileMeta)}
									</div>
								))}
							</div>
						</div>
					)}

					{/* Library Section */}
					<div style={{ flex: 1 }}>
						<div className='upload-file__section-title'>Library</div>
						<DataDisplay
							dataSource={filteredLibraryData.value}
							mode={viewMode.value}
							renderItem={(item) => (
								<div key={item.id} style={{ position: 'relative' }}>
									{renderFileItem(item)}
								</div>
							)}
							gridColumns={2}
							gap={12}
							emptyState={
								<div className='upload-file__empty'>
									No files found matching criteria.
								</div>
							}
						/>
					</div>
				</div>

				{/* Sticky Footer */}
				<div className='upload-file__footer'>
					<Button
						variant='secondary'
						style={{ flex: 1 }}
						startIcon={<IconCloudUpload size={18} />}
						onClick={() => fileInputRef.current?.click()}
					>
						Upload new
					</Button>
					<Button
						variant='primary'
						style={{ flex: 2 }}
						onClick={handleConfirm}
						disabled={selectedFiles.value.size === 0}
					>
						{selectedFiles.value.size > 0
							? `Confirm Selection (${selectedFiles.value.size})`
							: 'Select a file'}
					</Button>
				</div>
			</div>
		</Overlay>
	);
}
