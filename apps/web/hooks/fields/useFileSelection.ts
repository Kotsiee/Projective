import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { FileWithMeta } from '@projective/types';
import { validateFile } from '@projective/shared';

interface UseFileSelectionProps {
	multiple?: boolean;
	maxFiles?: number;
	accept?: string;
	maxSize?: number;
	onChange?: (files: File[]) => void;
}

export function useFileSelection({
	multiple,
	maxFiles = 0,
	accept,
	maxSize,
	onChange,
}: UseFileSelectionProps) {
	const files = useSignal<FileWithMeta[]>([]);

	const revokePreviews = (items: FileWithMeta[]) => {
		items.forEach((item) => {
			if (item.preview) URL.revokeObjectURL(item.preview);
		});
	};

	useEffect(() => {
		return () => revokePreviews(files.value);
	}, []);

	const addFiles = (newFiles: File[]) => {
		let currentFiles = multiple ? [...files.value] : [];

		if (multiple && maxFiles > 0) {
			const remainingSlots = maxFiles - currentFiles.length;
			if (remainingSlots <= 0) return;
			if (newFiles.length > remainingSlots) newFiles = newFiles.slice(0, remainingSlots);
		} else if (!multiple) {
			revokePreviews(currentFiles);
			currentFiles = [];
			newFiles = [newFiles[0]];
		}

		const mappedFiles: FileWithMeta[] = newFiles.map((file) => {
			let preview: string | undefined;
			if (file.type.startsWith('image/')) preview = URL.createObjectURL(file);

			// Initial validation
			const errors = validateFile(file, accept, maxSize);

			return {
				file,
				id: crypto.randomUUID(),
				preview,
				status: errors.length > 0 ? 'error' : 'pending', // Start as pending!
				progress: 0,
				errors,
			};
		});

		files.value = [...currentFiles, ...mappedFiles];
		emitChange();
	};

	const removeFile = (id: string) => {
		const fileToRemove = files.value.find((f) => f.id === id);
		if (fileToRemove) revokePreviews([fileToRemove]);
		files.value = files.value.filter((f) => f.id !== id);
		emitChange();
	};

	// --- NEW: Update single file state ---
	const updateFile = (id: string, updates: Partial<FileWithMeta>) => {
		files.value = files.value.map((f) => {
			if (f.id !== id) return f;

			// If file blob changed (e.g. compression), update preview
			if (updates.file && updates.file !== f.file) {
				if (f.preview) URL.revokeObjectURL(f.preview);
				if (updates.file.type.startsWith('image/')) {
					updates.preview = URL.createObjectURL(updates.file);
				}
			}
			return { ...f, ...updates };
		});

		// Only emit if status changed to ready or file list changed
		if (updates.status === 'ready' || updates.file) {
			emitChange();
		}
	};

	const emitChange = () => {
		// Only expose files that are Ready (processed) and valid
		const validRawFiles = files.value
			.filter((f) => f.status === 'ready' && f.errors.length === 0)
			.map((f) => f.file);
		onChange?.(validRawFiles);
	};

	return { files, addFiles, removeFile, updateFile };
}
