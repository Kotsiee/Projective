export function getCsrfToken(name = 'pjv-csrf'): string | null {
	const cookie = typeof document !== 'undefined' ? document.cookie : '';
	if (!cookie) return null;

	const match = cookie.match(
		new RegExp('(?:^|; )' + name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '=([^;]*)'),
	);

	return match ? decodeURIComponent(match[1]) : null;
}
