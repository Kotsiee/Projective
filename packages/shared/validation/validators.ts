/**
 * Validates a credit card number using the Luhn Algorithm.
 * Returns true if valid.
 */
export function isValidCreditCard(value: string): boolean {
	// Remove spaces/dashes
	const digits = value.replace(/\D/g, '');

	if (digits.length < 13 || digits.length > 19) return false;

	let sum = 0;
	let shouldDouble = false;

	// Loop backwards
	for (let i = digits.length - 1; i >= 0; i--) {
		let digit = parseInt(digits.charAt(i));

		if (shouldDouble) {
			if ((digit *= 2) > 9) digit -= 9;
		}

		sum += digit;
		shouldDouble = !shouldDouble;
	}

	return sum % 10 === 0;
}
