import { useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';

export function useGlobalDrag() {
	const isDragging = useSignal(false);
	const dragCounter = useRef(0);

	useEffect(() => {
		const handleDragEnter = (e: DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			dragCounter.current += 1;
			if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
			isDragging.value = true;
		};

		const handleDragLeave = (e: DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			dragCounter.current -= 1;
			if (dragCounter.current === 0) {
				isDragging.value = false;
			}
		};

		const handleDragOver = (e: DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
			// Safety: ensure it stays true while over globalThis
			if (!isDragging.value) isDragging.value = true;
		};

		const handleDrop = (e: DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			dragCounter.current = 0;
			isDragging.value = false;
		};

		// Attach to globalThis to catch drags anywhere
		globalThis.addEventListener('dragenter', handleDragEnter);
		globalThis.addEventListener('dragleave', handleDragLeave);
		globalThis.addEventListener('dragover', handleDragOver);
		globalThis.addEventListener('drop', handleDrop);

		return () => {
			globalThis.removeEventListener('dragenter', handleDragEnter);
			globalThis.removeEventListener('dragleave', handleDragLeave);
			globalThis.removeEventListener('dragover', handleDragOver);
			globalThis.removeEventListener('drop', handleDrop);
		};
	}, []);

	return isDragging;
}
