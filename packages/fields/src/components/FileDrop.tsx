/* #region Imports */
import '../styles/fields/file-drop.css';
import { JSX } from 'preact';
import { useSignal } from '@preact/signals';
import {
	IconBooks,
	IconCloudUpload,
	IconFile,
	IconFilePlus,
	IconLoader2,
	IconPhoto,
	IconRefresh,
	IconTrash,
} from '@tabler/icons-preact';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { FileWithMeta, getFileCategory } from '@projective/types';
import { FileFieldProps } from '../types/file.ts';
import { TargetedEvent } from 'preact';
import { toast } from '@projective/ui'; // Required for notifications
/* #endregion */

export function FileDrop(props: FileFieldProps) {
	const {
		id,
		label,
		value,
		onChange,
		accept,
		multiple,
		disabled,
		className,
		style,
		error,
		required,
		variant = 'split',
		listPosition = 'below',
		onLibraryClick,
		maxSize = 10 * 1024 * 1024,
		maxFiles = 10,
		floatingRule = 'never',
		actionPosition = 'below',
	} = props;

	const isDragging = useSignal(false);
	const inputRef = useSignal<HTMLInputElement | null>(null);

	const files = value?.value || [];

	// #region Helpers
	const processFiles = (incomingFiles: File[]) => {
		if (disabled) return;

		let validFiles = incomingFiles;

		// 1. Validate File Type (Accept) - CRITICAL FOR DRAG & DROP
		if (accept) {
			const acceptedTypes = accept.split(',').map((t) => t.trim().toLowerCase());

			validFiles = validFiles.filter((f) => {
				const fType = f.type.toLowerCase();
				const fName = f.name.toLowerCase();

				const isValid = acceptedTypes.some((type) => {
					// Check extension (e.g., .png)
					if (type.startsWith('.')) return fName.endsWith(type);
					// Check mime type (e.g., image/*)
					if (type.endsWith('/*')) return fType.startsWith(type.replace('/*', ''));
					// Check exact mime type (e.g., image/png)
					return fType === type;
				});

				if (!isValid) {
					toast.error(`File "${f.name}" format is not supported.`);
					return false;
				}
				return true;
			});
		}

		// 2. Validate Max Files
		if (!multiple && validFiles.length > 1) {
			// If single mode, just take the last one dropped
			validFiles = [validFiles[validFiles.length - 1]];
		} else if (multiple && (files.length + validFiles.length) > maxFiles) {
			const slotsRemaining = maxFiles - files.length;
			if (slotsRemaining <= 0) {
				toast.error(`Maximum file limit (${maxFiles}) reached.`);
				return;
			}

			toast.warning(`Limit exceeded. Only adding ${slotsRemaining} file(s).`);
			validFiles = validFiles.slice(0, slotsRemaining);
		}

		// 3. Validate Size
		validFiles = validFiles.filter((f) => {
			if (f.size > maxSize) {
				const sizeMb = Math.round(maxSize / 1024 / 1024);
				toast.error(`"${f.name}" is too large (Max ${sizeMb}MB).`);
				return false;
			}
			return true;
		});

		if (validFiles.length === 0) return;

		// 4. Create FileWithMeta
		const processed: FileWithMeta[] = validFiles.map((f) => ({
			file: f,
			id: crypto.randomUUID(),
			status: 'pending',
			progress: 0,
			errors: [],
			type: getFileCategory(f),
			meta: {
				uploadedAt: new Date().toISOString(),
			},
		}));

		if (onChange) {
			if (multiple) {
				onChange([...files, ...processed]);
			} else {
				// Replace in single mode
				onChange([processed[processed.length - 1]]);
			}
		}
	};

	const handleRemove = (fileId: string, e?: Event) => {
		e?.stopPropagation();
		if (onChange) {
			onChange(files.filter((f) => f.id !== fileId));
		}
	};
	// #endregion

	// #region Event Handlers
	const handleDragEnter = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (!disabled) isDragging.value = true;
	};

	const handleDragLeave = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();

		// Fix: Only disable dragging if we actually left the container
		// (prevents flickering when dragging over child elements like icons)
		const container = e.currentTarget as HTMLElement;
		const enteringElement = e.relatedTarget as HTMLElement;

		if (!container.contains(enteringElement)) {
			isDragging.value = false;
		}
	};

	const handleDrop = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		isDragging.value = false;

		if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
			processFiles(Array.from(e.dataTransfer.files));
			e.dataTransfer.clearData();
		}
	};

	const handleFileInput = (e: JSX.TargetedEvent<HTMLInputElement>) => {
		if (e.currentTarget.files) {
			processFiles(Array.from(e.currentTarget.files));
			e.currentTarget.value = '';
		}
	};

	const triggerUpload = () => inputRef.value?.click();
	// #endregion

	// #region Renderers
	const renderIcon = (file: FileWithMeta) => {
		if (file.status === 'processing') {
			return <IconLoader2 size={24} className='file-drop__spinner' />;
		}
		if (file.type === 'Image') return <IconPhoto size={24} />;
		return <IconFile size={24} />;
	};

	const renderFileList = () => (
		<div className='file-drop__list'>
			{files.map((file) => (
				<div key={file.id} className='file-drop__item'>
					{file.status === 'processing' && (
						<div className='file-drop__progress-bg' style={{ width: `${file.progress}%` }} />
					)}

					<div className='file-drop__item-info'>
						{file.type === 'Image'
							? (
								<img
									src={URL.createObjectURL(file.file)}
									className='file-drop__preview-thumb'
									alt={file.file.name}
								/>
							)
							: (
								<div style={{ color: 'var(--text-secondary)' }}>
									{renderIcon(file)}
								</div>
							)}

						<div className='file-drop__meta'>
							<span className='file-drop__filename'>{file.file.name}</span>
							<span className='file-drop__filesize'>
								{(file.file.size / 1024 / 1024).toFixed(2)} MB
								{file.status === 'processing' && ` • ${Math.round(file.progress)}%`}
								{file.status === 'error' && (
									<span style={{ color: 'var(--error-500)' }}>• Failed</span>
								)}
							</span>
						</div>
					</div>

					<button
						type='button'
						className='file-drop__remove'
						onClick={(e) => handleRemove(file.id!, e)}
						title='Remove file'
					>
						<IconTrash size={18} />
					</button>
				</div>
			))}
		</div>
	);

	const renderSinglePreview = (file: FileWithMeta) => (
		<div
			className={`file-drop__container ${disabled ? 'file-drop__container--disabled' : ''}`}
			style={{ flexDirection: 'column', height: 'auto', padding: 0 }}
		>
			<div className={`file-drop__single-preview file-drop__single-preview--${actionPosition}`}>
				<img
					src={URL.createObjectURL(file.file)}
					className='file-drop__single-img'
					alt='Preview'
				/>

				{actionPosition === 'overlay' && (
					<button type='button' className='file-drop__change-btn' onClick={triggerUpload}>
						<IconRefresh size={32} />
						<span>Change Image</span>
					</button>
				)}
			</div>

			{actionPosition === 'below' && (
				<button
					type='button'
					className='file-drop__remove-bar'
					onClick={() => handleRemove(file.id!)}
				>
					<IconTrash size={16} /> Remove & Change
				</button>
			)}
		</div>
	);
	// #endregion

	const hasSingleFile = !multiple && files.length > 0;

	return (
		<div className={`field-file ${className || ''}`} style={style}>
			<LabelWrapper
				id={id}
				label={label}
				disabled={disabled}
				required={required}
				error={!!error}
				floatingRule={floatingRule}
			/>

			{/* LIST ABOVE */}
			{listPosition === 'top' && multiple && files.length > 0 && renderFileList()}

			{/* DROPZONE OR SINGLE PREVIEW */}
			{hasSingleFile
				? (
					renderSinglePreview(files[0])
				)
				: (
					<div
						className={[
							'file-drop__container',
							disabled && 'file-drop__container--disabled',
							!!error && 'file-drop__container--error',
							variant === 'single' && 'file-drop__container--single',
						].filter(Boolean).join(' ')}
						onDragEnter={handleDragEnter}
						onDragOver={(e) => {
							e.preventDefault();
							e.stopPropagation();
						}}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						onClick={variant === 'single' ? triggerUpload : undefined}
					>
						<input
							ref={(el) => (inputRef.value = el) as any}
							type='file'
							id={id}
							multiple={multiple}
							accept={accept}
							onChange={handleFileInput}
							style={{ display: 'none' }}
						/>

						{isDragging.value && (
							<div className='file-drop__overlay'>
								<div className='file-drop__overlay-content'>
									<IconFilePlus size={48} />
									<span>Drop files to add them</span>
								</div>
							</div>
						)}

						{variant === 'split' && (
							<>
								<div
									className='file-drop__split-action'
									onClick={(e) => {
										e.stopPropagation();
										triggerUpload();
									}}
								>
									<IconCloudUpload size={32} stroke={1.5} />
									<div>
										<div className='file-drop__label'>Upload from Device</div>
										<div className='file-drop__sub'>JPG, PNG, PDF (Max 10MB)</div>
									</div>
								</div>
								<div className='file-drop__divider' />
								<div
									className='file-drop__split-action'
									onClick={(e) => {
										e.stopPropagation();
										onLibraryClick?.();
									}}
								>
									<IconBooks size={32} stroke={1.5} />
									<div>
										<div className='file-drop__label'>Select from Library</div>
										<div className='file-drop__sub'>Reuse existing assets</div>
									</div>
								</div>
							</>
						)}

						{variant === 'single' && (
							<div className='file-drop__split-action' style={{ width: '100%', border: 'none' }}>
								<IconCloudUpload size={32} stroke={1.5} />
								<div className='file-drop__label'>Click to Upload</div>
							</div>
						)}
					</div>
				)}

			{/* LIST BELOW */}
			{listPosition === 'below' && multiple && files.length > 0 && renderFileList()}
		</div>
	);
}
