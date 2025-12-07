import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { FileProcessor, FileWithMeta } from '../types/file.ts';

// Simple ID generator if uuid not available
const generateId = () => Math.random().toString(36).substring(2, 15);

export function useFileProcessor(
	files: FileWithMeta[],
	processors: FileProcessor[] = [],
	onChange: (files: FileWithMeta[]) => void,
) {
	const processingQueue = useSignal<string[]>([]);

	useEffect(() => {
		const pendingFiles = files.filter(
			(f) => f.status === 'pending' && !processingQueue.value.includes(f.id),
		);

		if (pendingFiles.length === 0) return;

		pendingFiles.forEach((fileMeta) => {
			processFile(fileMeta);
		});
	}, [files]);

	const processFile = async (fileMeta: FileWithMeta) => {
		// Add to queue
		processingQueue.value = [...processingQueue.value, fileMeta.id];

		// Update status to processing
		updateFile(fileMeta.id, { status: 'processing', progress: 0 });

		// Find matching processor
		const processor = processors.find((p) => p.match(fileMeta.file));

		if (!processor) {
			// No processor found, mark as ready (or error if strict?)
			// For now, just ready
			updateFile(fileMeta.id, { status: 'ready', progress: 100 });
			removeFromQueue(fileMeta.id);
			return;
		}

		try {
			const result = await processor.process(fileMeta.file, (pct) => {
				updateFile(fileMeta.id, { progress: pct });
			});

			updateFile(fileMeta.id, {
				file: result.file,
				processingMeta: result.metadata,
				status: 'ready',
				progress: 100,
			});
		} catch (err: any) {
			updateFile(fileMeta.id, {
				status: 'error',
				errors: [{ code: 'PROCESSING_ERROR', message: err.message || 'Unknown error' }],
			});
		} finally {
			removeFromQueue(fileMeta.id);
		}
	};

	const updateFile = (id: string, updates: Partial<FileWithMeta>) => {
		const newFiles = files.map((f) => (f.id === id ? { ...f, ...updates } : f));
		onChange(newFiles);
	};

	const removeFromQueue = (id: string) => {
		processingQueue.value = processingQueue.value.filter((pid) => pid !== id);
	};

	const addFiles = (newFiles: File[]) => {
		const newFileMetas: FileWithMeta[] = newFiles.map((f) => ({
			file: f,
			originalFile: f,
			id: generateId(),
			status: 'pending',
			progress: 0,
			errors: [],
		}));

		onChange([...files, ...newFileMetas]);
	};

	const removeFile = (id: string) => {
		onChange(files.filter((f) => f.id !== id));
	};

	return {
		addFiles,
		removeFile,
	};
}
