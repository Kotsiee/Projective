import { FileProcessor } from '../../types/src/files/processing.ts';

/**
 * Simulates a WASM Image Optimizer.
 * It "shrinks" the file size and changes extension to .webp after 2 seconds.
 */
export const MockImageOptimizer: FileProcessor = {
	id: 'mock-wasm-optimizer',
	name: 'WASM Optimizer',

	match: (file) => file.type.startsWith('image/') && !file.type.includes('webp'),

	process: async (file, onProgress) => {
		return new Promise((resolve) => {
			let progress = 0;

			// Simulate work ticks
			const interval = setInterval(() => {
				progress += 10;
				onProgress?.(progress);

				if (progress >= 100) {
					clearInterval(interval);

					// Create a fake "Optimized" file
					// In real Rust WASM, you'd return the actual Blob here
					const newBlob = new Blob([file], { type: 'image/webp' });
					const newFile = new File([newBlob], file.name.replace(/\.[^/.]+$/, '') + '.webp', {
						type: 'image/webp',
						lastModified: Date.now(),
					});

					resolve({
						file: newFile,
						metadata: { optimization: 'Saved 40%' },
					});
				}
			}, 200); // 2 seconds total
		});
	},
};
