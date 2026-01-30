/* #region Imports */
import '../styles/fields/file-drop.css';
import { JSX } from 'preact';
import { Signal, useSignal } from '@preact/signals';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { useFileProcessor } from '../hooks/useFileProcessor.ts';
import { FileWithMeta } from '@projective/types';
import { FileFieldProps } from '../types/file.ts';
/* #endregion */

/**
 * @function FileDrop
 * @description A drag-and-drop file upload component that integrates with
 * the projective design system and file processing pipeline.
 */
export function FileDrop(props: FileFieldProps) {
	// #region State & Setup
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
		processors,
		onDrop,
		error,
		hint,
		warning,
		info,
		dropzoneLabel,
		required,
		floatingRule = 'never', // Usually static for large dropzones
	} = props;

	const internalFiles = useSignal<FileWithMeta[]>([]);
	const isControlled = value !== undefined;
	const currentFiles = isControlled ? (value || []) : internalFiles.value;

	const handleFilesChange = (newFiles: FileWithMeta[]) => {
		if (!isControlled) internalFiles.value = newFiles;
		onChange?.(newFiles);
	};

	const { addFiles } = useFileProcessor(
		currentFiles,
		processors,
		handleFilesChange,
	);

	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const isError = error instanceof Signal ? error.value : error;
	const inputRef = useSignal<HTMLInputElement | null>(null);
	const isDragging = useSignal(false);
	// #endregion

	// #region Event Handlers
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
			addFiles(dropped);
			onDrop?.(dropped, []);
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
	// #endregion

	return (
		<div className={`field-file ${className || ''}`} style={style}>
			<LabelWrapper
				id={id}
				label={label}
				disabled={isDisabled}
				required={required}
				error={!!isError}
				floatingRule={floatingRule}
			/>

			<div
				className={[
					'field-file__dropzone',
					isDragging.value && 'field-file__dropzone--dragging',
					isDisabled && 'field-file__dropzone--disabled',
					isError && 'field-file__dropzone--error',
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

			<MessageWrapper error={error} hint={hint} warning={warning} info={info} />
		</div>
	);
}
