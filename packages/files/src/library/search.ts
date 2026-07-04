/**
 * Builds a matcher from a raw search query. The query is compiled as a
 * case-insensitive Regular Expression; if it isn't valid regex we fall back to a
 * plain substring (`includes`) test so partial patterns never throw.
 */
export function buildMatcher(query: string): (value: string) => boolean {
	const trimmed = query.trim();
	if (!trimmed) return () => true;

	try {
		const re = new RegExp(trimmed, 'i');
		return (value: string) => re.test(value);
	} catch {
		const needle = trimmed.toLowerCase();
		return (value: string) => value.toLowerCase().includes(needle);
	}
}
