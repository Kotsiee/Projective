import '@styles/components/auth/login-button.css';
import { useCallback, useState } from 'preact/hooks';

type Props = {
	email: string | undefined;
};

export default function ResendButton({ email }: Props) {
	const [loading, setLoading] = useState(false);

	const handleClick = useCallback(async () => {
		if (loading) return;
		setLoading(true);

		try {
			const response = await fetch('/api/v1/auth/resend', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email }),
			});

			if (response.ok) {
				const data = await response.json();
			} else {
				const c = await response.json();
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
			class='verify-button'
		>
			Resend verification email
		</button>
	);
}
