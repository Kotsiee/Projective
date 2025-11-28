import { useSignal } from '@preact/signals';
import { useCallback, useRef } from 'preact/hooks';

interface UseFileDropProps {
	onDrop: (files: File[]) => void;
	disabled?: boolean;
}

export function useFileDrop({ onDrop, disabled }: UseFileDropProps) {
	const isDragActive = useSignal(false);
	const dragCounter = useRef(0);

	const handleDragEnter = useCallback((e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (disabled) return;

		dragCounter.current += 1;
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
		isDragActive.value = true;
	}, [disabled]);

	const handleDragLeave = useCallback((e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (disabled) return;

		dragCounter.current -= 1;
		if (dragCounter.current === 0) {
			isDragActive.value = false;
		}
	}, [disabled]);

	const handleDragOver = useCallback((e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (disabled) return;
		// Necessary to allow dropping
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
	}, [disabled]);

	const handleDrop = useCallback((e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();

		dragCounter.current = 0;
		isDragActive.value = false;

		if (disabled) return;
		if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			const fileList = Array.from(e.dataTransfer.files);
			onDrop(fileList);
		}
	}, [onDrop, disabled]);

	return {
		isDragActive,
		dropProps: {
			onDragEnter: handleDragEnter,
			onDragLeave: handleDragLeave,
			onDragOver: handleDragOver,
			onDrop: handleDrop,
		},
	};
}
