/**
 * Characters that break regex patterns or file-path resolution and are therefore
 * disallowed in asset / directory names: `*` `/` `|` `\` `?` `:` `"` `<` `>`.
 */
const INVALID_NAME_CHARS = /[*/|\\?:"<>]/;

/**
 * Validates a file or directory name against the regex-safe naming rule.
 *
 * @returns a human-readable error string, or `null` when the name is valid.
 */
export function getNameError(name: string): string | null {
	const trimmed = name.trim();
	if (!trimmed) return 'Name cannot be empty.';

	const match = trimmed.match(INVALID_NAME_CHARS);
	if (match) {
		return `The character "${match[0]}" isn't allowed in names.`;
	}

	return null;
}

/** Convenience predicate over {@link getNameError}. */
export function isValidName(name: string): boolean {
	return getNameError(name) === null;
}
