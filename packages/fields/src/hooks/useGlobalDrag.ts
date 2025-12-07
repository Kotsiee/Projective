import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';

export function useGlobalDrag() {
	const isDragging = useSignal(false);

	useEffect(() => {
		let dragCounter = 0;

		const handleDragEnter = (e: DragEvent) => {
			e.preventDefault();
			dragCounter++;
			if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
				isDragging.value = true;
			}
		};

		const handleDragLeave = (e: DragEvent) => {
			e.preventDefault();
			dragCounter--;
			if (dragCounter === 0) {
				isDragging.value = false;
			}
		};

		const handleDragOver = (e: DragEvent) => {
			e.preventDefault();
		};

		const handleDrop = (e: DragEvent) => {
			e.preventDefault();
			dragCounter = 0;
			isDragging.value = false;
		};

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
