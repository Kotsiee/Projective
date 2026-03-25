import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { FileProcessor } from '../types/file.ts';
import { FileWithMeta } from '@projective/types';

const generateId = () => Math.random().toString(36).substring(2, 15);

export function useFileProcessor(
	files: FileWithMeta[],
	processors: FileProcessor[] = [],
	onChange: (files: FileWithMeta[]) => void,
) {
	const processingQueue = useSignal<string[]>([]);

	useEffect(() => {
		const pendingFiles = files.filter(
			(f) => f.id && f.status === 'pending' && !processingQueue.value.includes(f.id),
		);

		if (pendingFiles.length === 0) return;

		pendingFiles.forEach((fileMeta) => {
			processFile(fileMeta as FileWithMeta & { id: string });
		});
	}, [files]);

	const processFile = async (fileMeta: FileWithMeta & { id: string }) => {
		const fileId = fileMeta.id;

		processingQueue.value = [...processingQueue.value, fileId];

		updateFile(fileId, { status: 'processing', progress: 0 });

		const processor = processors.find((p) => p.match(fileMeta.file));

		if (!processor) {
			updateFile(fileId, { status: 'ready', progress: 100 });
			removeFromQueue(fileId);
			return;
		}

		try {
			const result = await processor.process(fileMeta.file, (pct) => {
				updateFile(fileId, { progress: pct });
			});

			updateFile(fileId, {
				file: result.file,
				processingMeta: result.metadata,
				status: 'ready',
				progress: 100,
			});
		} catch (err: any) {
			updateFile(fileId, {
				status: 'error',
				errors: [{ code: 'PROCESSING_ERROR', message: err.message || 'Unknown error' }],
			});
		} finally {
			removeFromQueue(fileId);
		}
	};

	const updateFile = (id: string | undefined, updates: Partial<FileWithMeta>) => {
		if (!id) return;
		const newFiles = files.map((f) => (f.id === id ? { ...f, ...updates } : f));
		onChange(newFiles);
	};

	const removeFromQueue = (id: string | undefined) => {
		if (!id) return;
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

	const removeFile = (id: string | undefined) => {
		if (!id) return;
		onChange(files.filter((f) => f.id !== id));
	};

	return {
		addFiles,
		removeFile,
	};
}
