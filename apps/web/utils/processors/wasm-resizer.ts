import init, { resize_image } from '../../static/wasm/wasm.js';
import { FileProcessor } from '../../../../packages/types/processing.ts';

// Config interface
interface ResizerConfig {
	maxWidth: number;
	maxHeight: number;
	quality: number; // 0-100
}

export const WasmImageResizer = (config: ResizerConfig): FileProcessor => ({
	id: 'wasm-image-resizer',
	name: 'Rust Resizer (WASM)',

	// Only handle images
	match: (file) => file.type.startsWith('image/'),

	process: async (file, onProgress) => {
		// 1. Initialize WASM (downloads the .wasm file if not cached)
		onProgress?.(5); // Started
		await init();

		onProgress?.(20); // Loaded WASM

		// 2. Read File to Bytes (Uint8Array)
		const arrayBuffer = await file.arrayBuffer();
		const bytes = new Uint8Array(arrayBuffer);

		onProgress?.(40); // Read into memory

		// 3. Call Rust
		try {
			// Rust signature: (bytes: &[u8], width: u32, height: u32, quality: u8)
			const resizedBytes = resize_image(
				bytes,
				config.maxWidth,
				config.maxHeight,
				config.quality,
			);

			onProgress?.(80); // Processing complete

			// 4. Convert Bytes back to File
			// We output JPEG in Rust, so we enforce that mime type here
			const newFile = new File(
				// FIX: Type assertion to satisfy the strict ArrayBuffer vs SharedArrayBuffer check
				[resizedBytes as unknown as BlobPart],
				file.name.replace(/\.[^/.]+$/, '') + '.jpg',
				{ type: 'image/jpeg', lastModified: Date.now() },
			);

			// Calculate savings for fun
			const saved = ((file.size - newFile.size) / file.size * 100).toFixed(1);

			return {
				file: newFile,
				metadata: {
					optimization: `Resized to ${config.maxWidth}px (${saved}% saved)`,
				},
			};
		} catch (e) {
			console.error('WASM Error:', e);
			throw new Error('Failed to process image via WASM');
		}
	},
});
