import '@styles/components/fields/FileField.css';
import { useRef } from 'preact/hooks';
import { IconUpload } from '@tabler/icons-preact';
import { FileFieldProps } from '@projective/types';
import { useFileSelection } from '@hooks/fields/useFileSelection.ts';
import { useFileProcessor } from '@hooks/fields/useFileProcessor.ts';
import { useFileDrop } from '@hooks/fields/useFileDrop.ts';
import { formatBytes } from '@projective/shared';
import FileListItem from './FileListItem.tsx';

interface ExtendedFileProps extends FileFieldProps {
	layout?: 'list' | 'grid';
}

export default function FileDrop(props: ExtendedFileProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const layout = props.layout || 'list';

	const { files, addFiles, removeFile, updateFile } = useFileSelection({
		multiple: props.multiple,
		maxFiles: props.maxFiles,
		maxSize: props.maxSize,
		accept: props.accept,
		onChange: props.onChange,
	});

	// --- NEW: Processor Engine ---
	useFileProcessor({
		files: files.value,
		processors: props.processors,
		updateFile,
	});

	const { isDragActive, dropProps } = useFileDrop({
		onDrop: (droppedFiles) => addFiles(droppedFiles),
		disabled: props.disabled,
	});

	const handleBrowseClick = () => {
		if (!props.disabled) inputRef.current?.click();
	};

	const handleInputChange = (e: Event) => {
		const target = e.target as HTMLInputElement;
		if (target.files?.length) addFiles(Array.from(target.files));
		target.value = '';
	};

	const dropClasses = [
		'file-drop',
		isDragActive.value ? 'file-drop--active' : '',
		props.disabled ? 'file-drop--disabled' : '',
		props.error ? 'file-drop--error' : '',
		props.className,
	].filter(Boolean).join(' ');

	return (
		<div className='file-field'>
			{props.label && (
				<label className='file-field__label'>
					{props.label} {props.required && <span className='file-field__req'>*</span>}
				</label>
			)}

			<div {...dropProps} className={dropClasses} onClick={handleBrowseClick}>
				<input
					ref={inputRef}
					type='file'
					className='file-drop__input'
					multiple={props.multiple}
					accept={props.accept}
					onChange={handleInputChange}
					disabled={props.disabled}
				/>
				<div className='file-drop__content'>
					<div className='file-drop__icon'>
						<IconUpload size={24} />
					</div>
					<div className='file-drop__text'>{props.dropzoneLabel || 'Click or Drag'}</div>
					<div className='file-drop__hint'>
						{props.accept} {props.maxSize && `(Max ${formatBytes(props.maxSize)})`}
					</div>
				</div>
			</div>

			{files.value.length > 0 && (
				<div className={`file-list-wrapper file-list-wrapper--${layout}`}>
					{files.value.map((item) => (
						<FileListItem key={item.id} item={item} onRemove={removeFile} layout={layout} />
					))}
				</div>
			)}

			{props.error && <div className='file-field__msg-error'>{props.error}</div>}
		</div>
	);
}
