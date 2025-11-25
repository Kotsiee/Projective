import { useEffect, useState } from 'preact/hooks';
import ResendButton from '@components/auth/ResendButton.tsx';

type Props = {
	email: string | undefined;
};

export default function VerifyIsland({ email }: Props) {
	const [status, setStatus] = useState<'parsing' | 'verifying' | 'awaiting' | 'done' | 'error'>(
		'parsing',
	);
	const [err, setErr] = useState<string | null>(null);

	useEffect(() => {
		const params = new URLSearchParams(globalThis.location.hash.replace(/^#/, ''));
		const access_token = params.get('access_token');
		const refresh_token = params.get('refresh_token');

		if (access_token && refresh_token) {
			setStatus('verifying');
			fetch('/api/v1/auth/callback', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ access_token, refresh_token }),
			})
				.then(async (r) => {
					console.log('1 -----', r);
					if (!r.ok) throw new Error((await r.json()).error?.message ?? 'Failed to set session');
					console.log('2 -----', r);
					setStatus('done');
					globalThis.location.href = '/onboarding';
				})
				.catch((e) => {
					console.log('error ------', e.message);
					setErr(e.message);
					setStatus('error');
				});
		} else {
			setStatus('awaiting');
		}
	}, []);

	return (
		<main class='mx-auto max-w-md p-6'>
			<h1 class='text-2xl font-semibold mb-4'>Verify your email</h1>

			{status === 'parsing' && <p>Preparing…</p>}
			{status === 'verifying' && <p>Signing you in…</p>}
			{status === 'done' && <p>Redirecting…</p>}

			{status === 'awaiting' && (
				<section>
					<p class='mb-3'>We’ve sent a verification link to your email. Click it to continue.</p>
					<p>{email}</p>
					<ResendButton email={email} />
				</section>
			)}

			{status === 'error' && (
				<section class='text-red-600'>
					<p class='mb-2'>We couldn’t verify your session.</p>
					<p class='mb-4 text-sm'>{err}</p>
					<a class='underline' href='/verify'>Try again</a>
				</section>
			)}
		</main>
	);
}
