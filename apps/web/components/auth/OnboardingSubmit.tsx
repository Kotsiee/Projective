// apps/web/islands/auth/OnboardingSubmit.tsx
import { useCallback, useState } from 'preact/hooks';
import { OnboardingRequest } from '@contracts/auth/onboading.ts';
import { getCsrfToken } from '@shared';

export default function OnboardingSubmit({
	firstName,
	lastName,
	username,
	type,
}: OnboardingRequest) {
	const [loading, setLoading] = useState(false);

	const handleClick = useCallback(async () => {
		if (loading) return;
		setLoading(true);

		try {
			const csrf = getCsrfToken();

			if (!csrf) {
				setLoading(false);
				return;
			}

			const response = await fetch('/api/v1/auth/onboarding', {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					'X-CSRF': csrf,
				},
				body: JSON.stringify({ firstName, lastName, username, type }),
			});

			if (!response.ok) {
				const errorBody = await response.json().catch(() => null);
				console.error('Onboarding failed:', errorBody ?? response.statusText);
				return;
			}

			const data = await response.json();
			console.log('Onboarding success:', data);
			// globalThis.location.href = '/dashboard';
		} catch (err) {
			console.error('Onboarding error:', err);
		} finally {
			setLoading(false);
		}
	}, [loading, firstName, lastName, username, type]);

	return (
		<button
			type='button'
			class='onboarding-submit'
			onClick={handleClick}
			disabled={loading}
			aria-busy={loading}
			aria-label='Create Profile'
		>
			{loading ? 'Saving…' : 'Continue'}
		</button>
	);
}
