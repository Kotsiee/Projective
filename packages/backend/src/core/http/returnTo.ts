/**
 * @file returnTo.ts
 * @description Open-redirect guard for the "return to where I was" flow. A
 * redirect target that survives a round trip through an email link and untrusted
 * query params must never be honoured verbatim — an attacker could point it at
 * `//evil.com` or `https://evil.com` and turn our confirm endpoint into an open
 * redirect. safeReturnTo() collapses anything that is not a plain, same-origin,
 * root-relative path down to a safe fallback.
 */

/** Default landing when no (valid) return target is supplied. */
export const DEFAULT_RETURN_TO = '/home';

/**
 * Returns `value` only when it is a safe same-origin path, else `fallback`.
 *
 * Accepts: `/`, `/explore`, `/explore?q=x#frag`.
 * Rejects: absolute URLs (`https://…`), protocol-relative (`//host`),
 * backslash tricks (`/\host`, `\\host`), and non-path junk.
 */
export function safeReturnTo(
	value: string | null | undefined,
	fallback: string = DEFAULT_RETURN_TO,
): string {
	if (!value) return fallback;

	const v = value.trim();

	// Must be root-relative and not protocol-relative / backslash-escaped.
	if (!v.startsWith('/')) return fallback;
	if (v.startsWith('//') || v.startsWith('/\\')) return fallback;
	if (v.includes('\\')) return fallback;

	// Reject control chars that browsers may normalise into a host or header.
	for (let i = 0; i < v.length; i++) {
		const code = v.charCodeAt(i);
		if (code <= 0x1f || code === 0x7f) return fallback;
	}

	return v;
}
