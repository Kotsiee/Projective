export function normaliseSupabaseError(error: unknown): {
	code: string;
	message: string;
	status?: number;
} {
	const e = error as { code?: string; message?: string; status?: number };
	const raw = (e.code ?? '').toLowerCase();

	if (raw.includes('rate') || e.status === 429) {
		return {
			code: 'rate_limit',
			message: e.message ?? 'Too many attempts. Please try later.',
			status: 429,
		};
	}
	if (raw.includes('user') && raw.includes('exists')) {
		return { code: 'user_exists', message: e.message ?? 'User already exists.', status: 409 };
	}
	if ((raw.includes('invalid') && raw.includes('credentials')) || e.status === 401) {
		return {
			code: 'invalid_credentials',
			message: e.message ?? 'Invalid email or password.',
			status: 401,
		};
	}
	if (raw === 'signup_failed' || raw === 'invalid_signup' || e.status === 400) {
		return {
			code: 'signup_failed',
			message: e.message ?? 'Sign up failed.',
			status: e.status ?? 400,
		};
	}

	return { code: raw || 'auth_error', message: e.message ?? 'Authentication error.' };
}

export function normaliseUnknownError(err: unknown): {
	code: string;
	message: string;
} {
	if (err && typeof err === 'object') {
		const anyErr = err as { name?: string; message?: string };
		const name = (anyErr.name ?? '').toLowerCase();
		const message = anyErr.message ?? 'Unknown error';
		if (name === '' || name === 'error') {
			return { code: 'unknown_error', message };
		}
		return { code: name, message };
	}
	return { code: 'unknown_error', message: 'Unknown error' };
}
