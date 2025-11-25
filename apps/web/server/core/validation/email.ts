export function isLikelyEmail(s: string): boolean {
	if (!s || !s.includes('@')) return false;
	const [, domain = ''] = s.split('@');
	return domain.includes('.') && !/\s/.test(s);
}
