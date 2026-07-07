/**
 * @file ForgotPasswordForm.island.tsx
 * @description Interactive password-recovery request form. On success it shows a
 * neutral "check your inbox" confirmation (no account-existence disclosure).
 */

import { Icon, toast } from '@projective/ui';
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { IconMailForward } from '@tabler/icons-preact';
import { TextField } from '@projective/fields';
import { isLikelyEmail } from 'packages/backend/src/core/validation/email.ts';
import { ForgotPasswordService } from '@features/auth/services/ForgotPasswordService.ts';

export default function ForgotPasswordForm() {
	const email = useSignal('');
	const emailError = useSignal('');
	const isLoading = useSignal(false);
	const sent = useSignal(false);

	// Surface any ?error= forwarded here by the confirm route (expired link, etc.).
	useEffect(() => {
		const params = new URLSearchParams(globalThis.location?.search ?? '');
		const err = params.get('error');
		if (err) toast.error(err);
	}, []);

	const handleSubmit = async () => {
		if (isLoading.value) return;
		if (!isLikelyEmail(email.value)) {
			emailError.value = 'Enter a valid email address.';
			return;
		}
		isLoading.value = true;
		try {
			await ForgotPasswordService.requestReset(email.value.trim().toLowerCase());
			sent.value = true;
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
		} finally {
			isLoading.value = false;
		}
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter') handleSubmit();
	};

	return (
		<>
			<a class='auth-backlink' href='/login'>
				<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'>
					<path d='m15 18-6-6 6-6' />
				</svg>
				Back to log in
			</a>

			{sent.value
				? (
					<div class='auth-head'>
						<div class='auth-icon'>
							<Icon>
								<IconMailForward />
							</Icon>
						</div>
						<span class='auth-kicker'>Reset password</span>
						<h1 class='auth-title'>Check your inbox</h1>
						<p class='auth-sub' role='status' aria-live='polite'>
							If an account exists for{' '}
							<b>{email.value}</b>, we've sent a link to reset your password. The link expires in
							one hour.
						</p>
					</div>
				)
				: (
					<>
						<div class='auth-head'>
							<span class='auth-kicker'>Reset password</span>
							<h1 class='auth-title'>Forgot password?</h1>
							<p class='auth-sub'>
								No worries — enter your email and we'll send a reset link.
							</p>
						</div>

						<div class='auth-form'>
							<TextField
								id='forgot-email'
								variant='glass'
								label='Email address'
								type='email'
								value={email}
								floatingRule='auto'
								autoComplete='email'
								required
								error={emailError.value}
								disabled={isLoading.value}
								onInput={() => {
									if (emailError.value) emailError.value = '';
								}}
								onKeyDown={handleKeyDown}
							/>

							<button
								class='auth-cta'
								type='button'
								onClick={handleSubmit}
								disabled={!email.value || isLoading.value}
							>
								{isLoading.value ? 'Sending…' : 'Send reset link'}
							</button>
						</div>
					</>
				)}

			<p class='auth-foot'>
				Remembered it? <a href='/login'>Log in</a>
			</p>
		</>
	);
}
