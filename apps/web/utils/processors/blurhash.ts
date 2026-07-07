import init, { blurhash_from_rgba } from '../../static/wasm/wasm.js';
import { FileProcessor } from 'packages/types/src/files/processing.ts';

/**
 * Client-side BlurHash generation.
 *
 * The heavy lifting (DCT encode) happens in Rust/WASM (`blurhash_from_rgba`, see
 * `wasm/src/lib.rs`). This module's job is purely to turn a browser `File` into the
 * flat RGBA buffer the WASM expects — which is exactly what a `<canvas>` yields for
 * both decoded images and grabbed video frames, so one util covers both media types.
 *
 * BlurHash is a best-effort placeholder: every entry point resolves to `null` on
 * failure rather than throwing, so a bad frame never blocks an upload.
 */

/** Down-sample longest edge to this many px before encoding — plenty for a blur. */
const SAMPLE_MAX = 64;
/** Default component counts (detail). 4×3 is the BlurHash reference default. */
const DEFAULT_COMP_X = 4;
const DEFAULT_COMP_Y = 3;

export interface BlurhashOptions {
	/** Horizontal components, 1..=9. Higher = more horizontal detail. */
	componentX?: number;
	/** Vertical components, 1..=9. Higher = more vertical detail. */
	componentY?: number;
	/** Longest-edge sample size in px used for encoding. Smaller = faster. */
	sampleMax?: number;
}

/** Fits (w, h) inside a `max`×`max` box, preserving aspect ratio, min 1px. */
function sampleSize(w: number, h: number, max: number): { w: number; h: number } {
	if (w <= max && h <= max) return { w, h };
	const scale = Math.min(max / w, max / h);
	return { w: Math.max(1, Math.round(w * scale)), h: Math.max(1, Math.round(h * scale)) };
}

/** Reads RGBA out of a source drawable and runs the WASM encoder. */
function encodeCanvas(
	source: CanvasImageSource,
	srcW: number,
	srcH: number,
	opts: BlurhashOptions,
): string | null {
	const max = opts.sampleMax ?? SAMPLE_MAX;
	const { w, h } = sampleSize(srcW, srcH, max);

	const canvas = document.createElement('canvas');
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext('2d', { willReadFrequently: true });
	if (!ctx) return null;

	ctx.drawImage(source, 0, 0, w, h);
	const { data } = ctx.getImageData(0, 0, w, h); // Uint8ClampedArray, RGBA

	// wasm-bindgen types the param as Uint8Array; the clamped array shares the buffer.
	const rgba = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);

	try {
		return blurhash_from_rgba(
			rgba,
			w,
			h,
			opts.componentX ?? DEFAULT_COMP_X,
			opts.componentY ?? DEFAULT_COMP_Y,
		);
	} catch (e) {
		console.error('[blurhash] WASM encode failed:', e);
		return null;
	}
}

/** Decodes an image `File` and encodes its BlurHash. */
async function blurhashFromImage(file: File, opts: BlurhashOptions): Promise<string | null> {
	const bitmap = await createImageBitmap(file);
	try {
		return encodeCanvas(bitmap, bitmap.width, bitmap.height, opts);
	} finally {
		bitmap.close();
	}
}

/** Grabs one frame from a video `File` and encodes its BlurHash. */
function blurhashFromVideo(file: File, opts: BlurhashOptions): Promise<string | null> {
	return new Promise((resolve) => {
		const url = URL.createObjectURL(file);
		const video = document.createElement('video');
		video.muted = true;
		video.playsInline = true;
		video.preload = 'auto';
		video.src = url;

		let settled = false;
		const cleanup = () => {
			URL.revokeObjectURL(url);
			video.removeAttribute('src');
			video.load();
		};
		const finish = (hash: string | null) => {
			if (settled) return;
			settled = true;
			cleanup();
			resolve(hash);
		};

		// Give up rather than hang an upload on a slow/broken decode.
		const timeout = setTimeout(() => finish(null), 5000);

		const grab = () => {
			clearTimeout(timeout);
			const hash = encodeCanvas(video, video.videoWidth, video.videoHeight, opts);
			finish(hash);
		};

		video.onloadeddata = () => {
			// Seek a touch past the start to skip black/intro leader frames.
			const target = Math.min(0.1, (video.duration || 0) * 0.1);
			if (target > 0 && Number.isFinite(video.duration)) {
				video.onseeked = grab;
				video.currentTime = target;
			} else {
				grab();
			}
		};
		video.onerror = () => finish(null);
	});
}

/**
 * Generate a BlurHash for an image or video `File`, entirely in the browser.
 * Resolves to the ~20-30 byte hash, or `null` if the file isn't visual media
 * or decoding failed. Never throws.
 */
export async function generateBlurhash(
	file: File,
	opts: BlurhashOptions = {},
): Promise<string | null> {
	try {
		await init();
		if (file.type.startsWith('image/')) return await blurhashFromImage(file, opts);
		if (file.type.startsWith('video/')) return await blurhashFromVideo(file, opts);
		return null;
	} catch (e) {
		console.error('[blurhash] generation failed:', e);
		return null;
	}
}

/**
 * A `FileProcessor` (see {@link FileProcessor}) that attaches a BlurHash to a file's
 * `processingMeta` without altering the bytes. Matches images and videos.
 *
 * Note: `useFileProcessor` runs only the first matching processor, so where the
 * image resizer already runs, blurhash is folded into that step instead (the resizer
 * returns `metadata.blurhash`). Use this processor for video, or standalone pipelines.
 */
export const BlurhashProcessor = (opts: BlurhashOptions = {}): FileProcessor => ({
	id: 'blurhash-generator',
	name: 'BlurHash Placeholder (WASM)',

	match: (file) => file.type.startsWith('image/') || file.type.startsWith('video/'),

	process: async (file, onProgress) => {
		onProgress?.(10);
		const blurhash = await generateBlurhash(file, opts);
		onProgress?.(100);
		// Bytes are untouched; the hash rides along in metadata.
		return { file, metadata: blurhash ? { blurhash } : {} };
	},
});
