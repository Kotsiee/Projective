/**
 * Normalise arbitrary user input into a valid `@handle` slug: lowercase,
 * spaces→hyphens, only `[a-z0-9-]`, no doubled hyphens. Kept CSS/DOM-free so it
 * can be unit-tested and reused on both the client and the server.
 */
export function sanitizeHandle(raw: string): string {
	return raw
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '')
		.replace(/-{2,}/g, '-');
}
