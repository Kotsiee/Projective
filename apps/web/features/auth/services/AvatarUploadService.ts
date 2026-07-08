/**
 * @file AvatarUploadService.ts
 * @description Frontend orchestration for the three-phase avatar upload:
 *   1. init     → reserve a files.items row + signed upload URL
 *   2. PUT      → upload the bytes to the signed storage URL
 *   3. finalise → scan + promote to public_assets, return the public URL
 * Requires an authenticated session (the OAuth onboarding flow on /join).
 */

import { getCsrfToken } from '@projective/utils';

export interface AvatarUploadResult {
	fileId: string;
	publicUrl: string;
}

export class AvatarUploadService {
	static async upload(file: File): Promise<AvatarUploadResult> {
		// The user is authenticated (OAuth onboarding), so our own POST endpoints
		// require the CSRF double-submit token. The PUT below goes to Supabase
		// storage directly and is not subject to our middleware.
		const csrf = getCsrfToken() || '';

		// 1. Reserve the record + signed upload URL.
		const initRes = await fetch('/api/v1/files/avatar/init', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'X-CSRF': csrf },
			body: JSON.stringify({
				filename: file.name,
				mimeType: file.type,
				sizeBytes: file.size,
			}),
		});
		if (!initRes.ok) throw new Error('Could not start the image upload.');
		const { fileId, uploadUrl } = await initRes.json();

		// 2. Upload the bytes straight to the signed storage URL.
		const putRes = await fetch(uploadUrl, {
			method: 'PUT',
			headers: { 'Content-Type': file.type || 'application/octet-stream' },
			body: file,
		});
		if (!putRes.ok) throw new Error('Could not upload the image.');

		// 3. Scan + promote to the public bucket.
		const finRes = await fetch('/api/v1/files/avatar/finalise', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'X-CSRF': csrf },
			body: JSON.stringify({ fileId }),
		});
		if (!finRes.ok) throw new Error('Could not process the image.');
		const fin = await finRes.json();

		return { fileId, publicUrl: fin.publicUrl };
	}
}
