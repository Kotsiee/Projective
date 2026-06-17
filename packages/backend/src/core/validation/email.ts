import { DateTime } from '@projective/types';

export function isLikelyEmail(s: string): boolean {
	if (!s || !s.includes('@')) return false;
	const [, domain = ''] = s.split('@');
	return domain.includes('.') && !/\s/.test(s);
}

/**
 * Interface representing the detailed breakdown of password validation results.
 */
export interface PasswordValidationResult {
	isValid: boolean;
	hasMinLength: boolean;
	hasUppercase: boolean;
	hasLowercase: boolean;
	hasSymbol: boolean;
	hasNoSpaces: boolean;
	isNotCommonSequence: boolean;
}

/**
 * Validates a password against comprehensive security criteria.
 * * Criteria included:
 * - 8 characters or more
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one symbol/special character
 * - Contains no whitespace characters
 * - Avoids obvious keyboard sequences (e.g., "12345", "qwerty")
 */
export function validatePassword(password: string): PasswordValidationResult {
	if (!password) {
		return {
			isValid: false,
			hasMinLength: false,
			hasUppercase: false,
			hasLowercase: false,
			hasSymbol: false,
			hasNoSpaces: false,
			isNotCommonSequence: false,
		};
	}

	const hasMinLength = password.length >= 8;
	const hasUppercase = /[A-Z]/.test(password);
	const hasLowercase = /[a-z]/.test(password);

	// Matches standard special characters and symbols
	const hasSymbol = /[`~!@#$%^&*()_\-+=\[\]{}|\\:;"'<>,.?\/]/.test(password);

	// Critical Security Addition: Ensure no hidden spaces undermine the hash
	const hasNoSpaces = !/\s/.test(password);

	// Basic common sequential pattern check (anti-bot/anti-lazy-user)
	const lowerPassword = password.toLowerCase();
	const isNotCommonSequence = !lowerPassword.includes('12345') &&
		!lowerPassword.includes('qwerty') &&
		!lowerPassword.includes('password');

	const isValid = hasMinLength &&
		hasUppercase &&
		hasLowercase &&
		hasSymbol &&
		hasNoSpaces &&
		isNotCommonSequence;

	return {
		isValid,
		hasMinLength,
		hasUppercase,
		hasLowercase,
		hasSymbol,
		hasNoSpaces,
		isNotCommonSequence,
	};
}

/**
 * A quick, high-performance boolean check for simple gatekeeping (e.g., API route guards).
 */
export function isStrongPassword(password: string): boolean {
	return validatePassword(password).isValid;
}

export interface UsernameValidationResult {
	isValid: boolean;
	hasValidLength: boolean;
	hasValidChars: boolean;
}

/**
 * Validates usernames: 3-15 chars, alphanumeric plus dots, dashes, and underscores.
 */
export function validateUsername(username: string): UsernameValidationResult {
	const trimmed = (username || '').trim();

	// Set typical industry defaults for min (3) and max (15) bounds
	const hasValidLength = trimmed.length >= 3 && trimmed.length <= 15;

	// Only allows letters, numbers, periods, dashes, and underscores
	const hasValidChars = /^[a-zA-Z0-9._-]+$/.test(trimmed);

	return {
		isValid: hasValidLength && hasValidChars,
		hasValidLength,
		hasValidChars,
	};
}

/**
 * Evaluates a birthdate against age floor milestones
 */
export function evaluateAge(dob: DateTime | undefined): { isOver13: boolean; isOver18: boolean } {
	if (!dob) return { isOver13: false, isOver18: false };

	const today = new Date();

	let age = today.getFullYear() - dob.getYear();
	const monthDiff = today.getMonth() - dob.getMonth();

	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
		age--;
	}

	return {
		isOver13: age >= 13,
		isOver18: age >= 18,
	};
}
