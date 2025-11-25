import '@styles/components/auth/provider-login-button.css';
import { useCallback, useState } from 'preact/hooks';
import { IconBrandGoogle } from '@tabler/icons-preact';

type Props = { redirectTo?: string };

export default function GoogleRegisterButton({ redirectTo = '/verify' }: Props) {
	const [loading, setLoading] = useState(false);
	const [err, setErr] = useState<string | null>(null);

	const handleClick = useCallback(() => {
		if (loading) return;
		setErr(null);
		setLoading(true);

		try {
			const params = new URLSearchParams({
				next: redirectTo || '/',
			});
			const startUrl = `/api/v1/auth/google/google-register?${params.toString()}`;

			globalThis.location.assign(startUrl);
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Unknown error starting OAuth';
			setErr(msg);
			console.error('OAuth start exception', e);
			globalThis.dispatchEvent(
				new CustomEvent('auth:error', { detail: { stage: 'oauth_start', error: String(msg) } }),
			);
			setLoading(false);
		}
	}, [loading, redirectTo]);

	return (
		<div class='w-full'>
			<button
				type='button'
				onClick={handleClick}
				disabled={loading}
				class='provider-login-button'
				aria-busy={loading}
				aria-label='Continue with Google'
			>
				<IconBrandGoogle />
				{loading ? 'Connecting…' : 'Continue with Google'}
			</button>
			{err && (
				<p role='alert' aria-live='polite' class='mt-2 text-sm text-red-600'>
					{err}
				</p>
			)}
		</div>
	);
}
