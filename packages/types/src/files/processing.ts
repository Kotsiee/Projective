export interface ProcessorResult {
	file: File; // The new, processed file (e.g. image.webp)
	metadata?: Record<string, any>; // Extra info (e.g. { compressionRatio: '40%' })
}

export interface FileProcessor {
	id: string;
	name: string; // e.g. "Image Optimizer"
	match: (file: File) => boolean; // Does this processor handle this file?
	process: (file: File, onProgress?: (pct: number) => void) => Promise<ProcessorResult>;
}
