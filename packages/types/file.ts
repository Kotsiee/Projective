import { BaseFieldProps } from "./fields/form.ts";

export type FileStatus = "pending" | "processing" | "ready" | "error";

export interface FileError {
	code: string;
	message: string;
}

export interface FileWithMeta {
	file: File; // The CURRENT file (may change after processing!)
	originalFile?: File; // Keep reference to original if needed
	id: string;
	preview?: string;
	status: FileStatus;
	progress: number; // 0-100
	errors: FileError[];
	processingMeta?: Record<string, any>; // Store WASM results here
}

export interface FileFieldProps extends BaseFieldProps<File[]> {
	accept?: string;
	maxSize?: number;
	maxFiles?: number;
	multiple?: boolean;
	layout?: "list" | "grid";
	dropzoneLabel?: string;

	// New: Inject processors
	processors?: import("./processing.ts").FileProcessor[];

	onDrop?: (acceptedFiles: File[], rejectedFiles: FileWithMeta[]) => void;
}
