import '../styles/fields/file-drop.css';
import { JSX } from 'preact';
import { Signal, useSignal } from '@preact/signals';
import { FileFieldProps, FileWithMeta } from '../types/file.ts';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { useFileProcessor } from '../hooks/useFileProcessor.ts';

export function FileDrop(props: FileFieldProps) {
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		accept,
		multiple,
		maxSize,
		maxFiles,
		disabled,
		className,
		style,
		position,
		floatingRule,
		required,
		floating,
		processors,
		onDrop,
		error,
		hint,
		warning,
		info,
		dropzoneLabel,
	} = props;

	// Internal state for files if not controlled
	const internalFiles = useSignal<FileWithMeta[]>([]);

	// Determine if controlled
	const isControlled = value !== undefined;
	const currentFiles = isControlled ? (value || []) : internalFiles.value;

	const handleFilesChange = (newFiles: FileWithMeta[]) => {
		if (!isControlled) {
			internalFiles.value = newFiles;
		}
		onChange?.(newFiles);
	};

	const { addFiles, removeFile } = useFileProcessor(
		currentFiles,
		processors,
		handleFilesChange,
	);

	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const inputRef = useSignal<HTMLInputElement | null>(null);
	const isDragging = useSignal(false);

	const handleDragOver = (e: DragEvent) => {
		e.preventDefault();
		if (isDisabled) return;
		isDragging.value = true;
	};

	const handleDragLeave = (e: DragEvent) => {
		e.preventDefault();
		isDragging.value = false;
	};

	const handleDrop = (e: DragEvent) => {
		e.preventDefault();
		isDragging.value = false;
		if (isDisabled) return;

		if (e.dataTransfer?.files) {
			const dropped = Array.from(e.dataTransfer.files);
			// TODO: Validate maxSize/maxFiles here before adding
			addFiles(dropped);
			onDrop?.(dropped, []); // TODO: Separate rejected
		}
	};

	const handleFileInput = (e: JSX.TargetedEvent<HTMLInputElement>) => {
		if (e.currentTarget.files) {
			const selected = Array.from(e.currentTarget.files);
			addFiles(selected);
		}
	};

	const handleClick = () => {
		if (!isDisabled && inputRef.value) {
			inputRef.value.click();
		}
	};

	return (
		<div className={`field-file ${className || ''}`} style={style}>
			{
				/* <LabelWrapper
				id={id}
				label={label}
				disabled={isDisabled}
				position={position}
				// FIX: Default to 'never' so label is static
				floatingRule={floatingRule ?? 'never'}
				required={required}
				floating={floating}
			/> */
			}

			<div
				className={[
					'field-file__dropzone',
					isDragging.value && 'field-file__dropzone--dragging',
					isDisabled && 'field-file__dropzone--disabled',
				].filter(Boolean).join(' ')}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onClick={handleClick}
			>
				<input
					id={id}
					ref={(el) => {
						inputRef.value = el;
					}}
					type='file'
					className='field-file__input'
					onChange={handleFileInput}
					accept={accept}
					multiple={multiple}
					disabled={!!isDisabled}
				/>

				<div className='field-file__content'>
					<div className='field-file__text'>
						{dropzoneLabel || 'Drag & drop files or click to upload'}
					</div>
				</div>
			</div>

			{/* File List */}
			{
				/* {currentFiles.length > 0 && (
				<div className='field-file__list'>
					{currentFiles.map((file) => (
						<div key={file.id} className='field-file__item'>
							<div className='field-file__item-info'>
								<span className='field-file__item-name'>{file.file.name}</span>
								<span className='field-file__item-size'>
									{(file.file.size / 1024).toFixed(1)} KB
								</span>
							</div>

							{file.status === 'processing' && (
								<div className='field-file__progress'>
									<div
										className='field-file__progress-bar'
										style={{ width: `${file.progress}%` }}
									/>
								</div>
							)}

							{file.status === 'error' && (
								<div className='field-file__error'>
									{file.errors[0]?.message}
								</div>
							)}

							<button
								type='button'
								className='field-file__remove'
								onClick={() => removeFile(file.id)}
								disabled={!!isDisabled}
							>
								×
							</button>
						</div>
					))}
				</div>
			)} */
			}

			<MessageWrapper error={error} hint={hint} warning={warning} info={info} />
		</div>
	);
}
