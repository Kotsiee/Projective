import '@styles/components/auth/login-button.css';
import { useCallback, useState } from 'preact/hooks';
import { computed, Signal } from '@preact/signals';
import { AuthValidator } from '@projective/shared';

type Props = {
	email: Signal<string | undefined>;
	password: Signal<string | undefined>;
	confirmPassword: Signal<string | undefined>;
};

export default function RegisterButton({
	email,
	password,
	confirmPassword,
}: Props) {
	const [loading, setLoading] = useState(false);

	const hasErrors = computed(() => {
		const e = (email.value || '').trim();
		const p = (password.value || '').trim();
		const c = (confirmPassword.value || '').trim();

		const v = AuthValidator.validate({
			email: e,
			password: p,
			confirmPassword: c,
		}).ok;

		return !v;
	});

	const handleClick = useCallback(async () => {
		if (loading) return;
		setLoading(true);

		try {
			const e = (email.value || '').trim();
			const p = (password.value || '').trim();
			const c = (confirmPassword.value || '').trim();

			const { ok } = AuthValidator.validate({
				email: e,
				password: p,
				confirmPassword: c,
			});

			if (!ok) return;

			const response = await fetch('/api/v1/auth/email/register', {
				method: 'POST',
				headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: e, password: p }),
			});

			if (response.ok) {
				const data = await response.json();
				console.log('Registration success:', data);
				globalThis.location.href = '/verify';
			} else {
				console.error('Registration failed:', response);
			}
		} finally {
			setLoading(false);
		}
	}, [loading, email, password, confirmPassword]);

	return (
		<button
			type='button'
			class='login-button'
			onClick={handleClick}
			disabled={hasErrors.value}
			aria-busy={loading}
			aria-label='Create account'
		>
			{loading ? 'Connecting…' : 'Create Account'}
		</button>
	);
}
