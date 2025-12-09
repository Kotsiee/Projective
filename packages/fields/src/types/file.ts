import { FileWithMeta } from '@projective/types';
import { ValueFieldProps } from './core.ts';
import { LabelWrapperProps, MessageWrapperProps } from './wrappers.ts';

export type FileStatus = 'pending' | 'processing' | 'ready' | 'error';

export interface FileError {
	code: string;
	message: string;
}

export interface FileProcessor {
	id: string;
	name: string;
	match: (file: File) => boolean;
	process: (
		file: File,
		onProgress?: (pct: number) => void,
	) => Promise<{ file: File; metadata?: any }>;
}

export interface FileFieldProps
	extends
		ValueFieldProps<FileWithMeta[]>,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	accept?: string;
	maxSize?: number;
	maxFiles?: number;
	multiple?: boolean;
	layout?: 'list' | 'grid';
	dropzoneLabel?: string;
	processors?: FileProcessor[];
	onDrop?: (acceptedFiles: File[], rejectedFiles: FileWithMeta[]) => void;
	value?: FileWithMeta[]; // Override base value to use FileWithMeta
	onChange?: (files: FileWithMeta[]) => void;
}
