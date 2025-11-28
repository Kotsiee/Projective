import { useEffect } from 'preact/hooks';
import { FileProcessor, FileWithMeta } from '@projective/types';

interface UseFileProcessorProps {
	files: FileWithMeta[];
	processors?: FileProcessor[];
	updateFile: (id: string, updates: Partial<FileWithMeta>) => void;
}

export function useFileProcessor({ files, processors, updateFile }: UseFileProcessorProps) {
	useEffect(() => {
		if (!processors || processors.length === 0) {
			// No processors? Mark all pending as ready immediately.
			files.forEach((f) => {
				if (f.status === 'pending' && f.errors.length === 0) {
					updateFile(f.id, { status: 'ready', progress: 100 });
				}
			});
			return;
		}

		// Find pending files
		files.forEach(async (fileWrapper) => {
			if (fileWrapper.status !== 'pending' || fileWrapper.errors.length > 0) return;

			// Find matching processor
			const processor = processors.find((p) => p.match(fileWrapper.file));

			if (!processor) {
				// No processor needed, mark ready
				updateFile(fileWrapper.id, { status: 'ready', progress: 100 });
				return;
			}

			// Start Processing
			updateFile(fileWrapper.id, { status: 'processing', progress: 0 });

			try {
				const result = await processor.process(fileWrapper.file, (pct) => {
					updateFile(fileWrapper.id, { progress: pct });
				});

				// Success
				updateFile(fileWrapper.id, {
					file: result.file, // Replace raw with optimized
					processingMeta: result.metadata,
					status: 'ready',
					progress: 100,
				});
			} catch (err) {
				console.error('Processing failed', err);
				updateFile(fileWrapper.id, {
					status: 'error',
					errors: [...fileWrapper.errors, {
						code: 'processing-failed',
						message: 'Optimization failed',
					}],
				});
			}
		});
	}, [files, processors]); // Re-run when files change
}
