/**
 * Formats a number string into a currency string.
 * e.g. "1234.5" -> "$1,234.50"
 */
export function formatCurrency(value: string | number, currency = 'USD'): string {
	if (value === '' || value === null || value === undefined) return '';

	const num = typeof value === 'string' ? parseFloat(value) : value;
	if (isNaN(num)) return '';

	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(num);
}

/**
 * Strips formatting characters to return a raw number string.
 * e.g. "$1,234.50" -> "1234.5"
 */
export function parseNumber(value: string): string {
	// Remove all non-numeric characters except the first decimal point
	return value.replace(/[^0-9.]/g, '');
}
