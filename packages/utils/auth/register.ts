import { escape } from '@std/regexp/escape';

export type RegisterFields = {
	email: string;
	password: string;
	confirmPassword: string;
};

export type RegisterErrors = {
	email?: string;
	password?: string;
	confirmPassword?: string;
};

export default class RegisterWithEmail {
	// --- email validation ---
	static validateEmail(email: string): string | null {
		const trimmed = email.trim();

		if (!trimmed) {
			return 'Email is required.';
		}

		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if (!emailPattern.test(trimmed)) {
			return 'Enter a valid email address.';
		}

		return null;
	}

	// --- password validation ---
	static validatePassword(password: string, email?: string): string | null {
		if (!password) {
			return 'Password is required.';
		}

		if (!/[a-z]/.test(password)) {
			return 'Password must contain at least one lowercase letter.';
		}

		if (!/[A-Z]/.test(password)) {
			return 'Password must contain at least one uppercase letter.';
		}

		if (!/[0-9]/.test(password)) {
			return 'Password must contain at least one digit.';
		}

		if (!/[^A-Za-z0-9]/.test(password)) {
			return 'Password must contain at least one symbol.';
		}

		if (/\s/.test(password)) {
			return 'Password must not contain spaces.';
		}

		if (password.length < 8) {
			return 'Password must be at least 8 characters long.';
		}

		if (email) {
			const trimmedEmail = email.trim();
			if (trimmedEmail) {
				const escapedEmail = escape(trimmedEmail);
				const emailInPassword = new RegExp(escapedEmail, 'i');

				if (emailInPassword.test(password)) {
					return 'Password must not contain your email.';
				}
			}
		}

		return null;
	}

	// --- confirm password validation ---
	static validateConfirmPassword(
		password: string,
		confirmPassword: string,
	): string | null {
		if (!confirmPassword) {
			return 'Please confirm your password.';
		}

		if (password !== confirmPassword) {
			return 'Passwords do not match.';
		}

		return null;
	}

	// --- full validation entrypoint ---
	static validate(
		fields: RegisterFields,
	): { ok: boolean; errors: RegisterErrors } {
		const errors: RegisterErrors = {};

		const emailError = this.validateEmail(fields.email);
		if (emailError) errors.email = emailError;

		const passwordError = this.validatePassword(
			fields.password,
			fields.email,
		);
		if (passwordError) errors.password = passwordError;

		const confirmError = this.validateConfirmPassword(
			fields.password,
			fields.confirmPassword,
		);
		if (confirmError) errors.confirmPassword = confirmError;

		const ok = Object.keys(errors).length === 0;

		return { ok, errors };
	}
}
