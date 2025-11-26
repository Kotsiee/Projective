import { type Cookie, deleteCookie, getCookies, setCookie } from '@std/http/cookie';

type SetAuthOpts = {
	accessToken: string;
	refreshToken: string;
	/** Pass the current request URL so we can decide secure + naming correctly. */
	requestUrl: URL;
};

/** Local dev can’t use __Host-* (requires secure + no Domain + Path=/ on HTTPS). */
function resolveCookieNames(isSecureOrigin: boolean, isLocalhost: boolean) {
	if (isSecureOrigin && !isLocalhost) {
		return { ACCESS_NAME: '__Host-pjv-at', REFRESH_NAME: '__Host-pjv-rt' };
	}
	return { ACCESS_NAME: 'pjv-at', REFRESH_NAME: 'pjv-rt' };
}

function isLocalhostHost(hostname: string) {
	return (
		hostname === 'localhost' ||
		hostname === '127.0.0.1' ||
		hostname === '[::1]' ||
		/\.local(domain)?$/i.test(hostname)
	);
}

export function setAuthCookies(
	headers: Headers,
	{ accessToken, refreshToken, requestUrl }: SetAuthOpts,
) {
	const isSecureOrigin = requestUrl.protocol === 'https:';
	const isLocal = isLocalhostHost(requestUrl.hostname);
	const { ACCESS_NAME, REFRESH_NAME } = resolveCookieNames(isSecureOrigin, isLocal);

	// Common attributes for auth cookies
	const common: Partial<Cookie> = {
		httpOnly: true,
		sameSite: 'Lax',
		secure: isSecureOrigin && !isLocal, // never mark Secure on localhost
		path: '/', // required for __Host-* and fine for non-__Host too
	};

	// Access: ~15 minutes
	setCookie(headers, {
		...common,
		name: ACCESS_NAME,
		value: accessToken,
		maxAge: 60 * 15,
	});

	// Refresh: ~30 days
	setCookie(headers, {
		...common,
		name: REFRESH_NAME,
		value: refreshToken,
		maxAge: 60 * 60 * 24 * 30,
	});

	// CSRF (readable) — double-submit token, same naming irrespective of env
	setCookie(headers, {
		name: 'pjv-csrf',
		value: randomToken(),
		httpOnly: false, // must be readable by JS
		sameSite: 'Lax',
		secure: isSecureOrigin && !isLocal,
		path: '/',
		maxAge: 60 * 60 * 24 * 30,
	});
}

export function clearAuthCookies(headers: Headers, requestUrl: URL) {
	const isSecureOrigin = requestUrl.protocol === 'https:';
	const isLocal = isLocalhostHost(requestUrl.hostname);
	const { ACCESS_NAME, REFRESH_NAME } = resolveCookieNames(isSecureOrigin, isLocal);

	const base = { path: '/', secure: isSecureOrigin && !isLocal } as const;

	// Delete both possible names just in case a previous env wrote the other variant.
	deleteCookie(headers, ACCESS_NAME, base);
	deleteCookie(headers, REFRESH_NAME, base);
	deleteCookie(headers, 'pjv-csrf', base);

	// Also try deleting the opposite flavor to avoid sticky leftovers across envs.
	deleteCookie(headers, '__Host-pjv-at', base);
	deleteCookie(headers, '__Host-pjv-rt', base);
	deleteCookie(headers, 'pjv-at', base);
	deleteCookie(headers, 'pjv-rt', base);
}

export function getAuthCookies(req: Request) {
	const c = getCookies(req.headers);
	// Support both name variants seamlessly.
	const accessToken = c['__Host-pjv-at'] ?? c['pjv-at'];
	const refreshToken = c['__Host-pjv-rt'] ?? c['pjv-rt'];
	return {
		accessToken,
		refreshToken,
		csrf: c['pjv-csrf'],
	};
}

// ---- CSRF helpers ----

export function verifyCsrf(req: Request): boolean {
	const method = req.method.toUpperCase();
	if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return true;

	const cookies = getCookies(req.headers);
	const sent = req.headers.get('X-CSRF');
	const expected = cookies['pjv-csrf'];
	return Boolean(sent && expected && sent === expected);
}

// Generate a CSRF token
function randomToken(bytes = 32) {
	const a = new Uint8Array(bytes);
	crypto.getRandomValues(a);
	return btoa(String.fromCharCode(...a)).replace(/=+$/, '');
}
