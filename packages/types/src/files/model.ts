export type FileStatus = 'pending' | 'processing' | 'ready' | 'error';
import { FileCategory } from './categories.ts';

export interface FileError {
	code: string;
	message: string;
}

export interface FileWithMeta {
	file: File;
	id?: string;
	preview?: string;
	status: FileStatus;
	progress: number;
	errors: FileError[];
	processingMeta?: Record<string, any>;
	type?: FileCategory | 'Other';
}
