import '@styles/components/auth/login-button.css';
import { useCallback, useState } from 'preact/hooks';
import { Signal } from '@preact/signals';

type Props = {
	redirectTo?: string;
	email: Signal<string | undefined>;
	password: Signal<string | undefined>;
};

export default function LoginButton({ redirectTo = '/', email, password }: Props) {
	const [loading, setLoading] = useState(false);

	const handleClick = useCallback(async () => {
		if (loading) return;
		setLoading(true);

		try {
			const response = await fetch('/api/v1/auth/email/login', {
				method: 'POST',
				headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: email, password: password }),
			});

			if (response.ok) {
				const data = await response.json();
				console.log('Login success:', data);
				globalThis.location.href = data.redirectTo;
			} else {
				const c = await response.json();
				console.error('Login failed:', response);
				console.error('Login failed:', c.error.code);
			}
		} finally {
			setLoading(false);
		}
	}, [loading]);

	return (
		<button
			type='button'
			onClick={handleClick}
			disabled={loading}
			class='login-button'
		>
			{loading ? 'Connecting…' : 'Log In'}
		</button>
	);
}
