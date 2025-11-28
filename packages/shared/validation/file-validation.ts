import { FileError } from '../types/file.ts';

/**
 * Validates a single file against size and type constraints.
 */
export function validateFile(
	file: File,
	accept?: string,
	maxSize?: number,
): FileError[] {
	const errors: FileError[] = [];

	// 1. Size Check
	if (maxSize && file.size > maxSize) {
		errors.push({
			code: 'file-too-large',
			message: `File is larger than ${formatBytes(maxSize)}`,
		});
	}

	// 2. Type Check (Simplified Accept logic)
	if (accept) {
		const acceptedTypes = accept.split(',').map((t) => t.trim());
		const fileType = file.type;
		const fileName = file.name.toLowerCase();

		const isValid = acceptedTypes.some((type) => {
			// MIME (image/*)
			if (type.endsWith('/*')) {
				const baseType = type.split('/')[0];
				return fileType.startsWith(baseType + '/');
			}
			// Exact MIME (image/png)
			if (type.includes('/')) {
				return fileType === type;
			}
			// Extension (.pdf)
			if (type.startsWith('.')) {
				return fileName.endsWith(type.toLowerCase());
			}
			return false;
		});

		if (!isValid) {
			errors.push({
				code: 'file-invalid-type',
				message: `File type not accepted`,
			});
		}
	}

	return errors;
}

export function formatBytes(bytes: number, decimals = 2) {
	if (bytes === 0) return '0 Bytes';
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
