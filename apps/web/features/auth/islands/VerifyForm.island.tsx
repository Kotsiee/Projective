/**
 * @file VerifyForm.island.tsx
 * @description Interactive email-verification form with resend + cooldown. The
 * only hydrated part of the /verify page.
 */

import { Icon, toast } from '@projective/ui';
import { useSignal } from '@preact/signals';
import { IconMail } from '@tabler/icons-preact';
import { useEffect } from 'preact/hooks';
import { TextField } from '@projective/fields';
import { ResendService } from '@features/auth/services/ResendService.ts';

export default function VerifyForm({ initialEmail }: { initialEmail?: string }) {
	const email = useSignal(initialEmail ?? '');
	const countdown = useSignal(0);
	const isLoading = useSignal(false);

	useEffect(() => {
		let timer: number;
		if (countdown.value > 0) {
			timer = setInterval(() => {
				countdown.value--;
			}, 1000);
		}
		return () => clearInterval(timer);
	}, [countdown.value]);

	const handleResend = async () => {
		if (!email.value || countdown.value > 0 || isLoading.value) return;
		isLoading.value = true;
		try {
			await ResendService.resendEmail(email.value);
			toast.success('Verification email sent! Please check your inbox.');
			countdown.value = 60;
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : 'An unexpected error occurred while resending.',
			);
		} finally {
			isLoading.value = false;
		}
	};

	return (
		<>
			<div class='auth-head'>
				<div class='auth-icon'>
					<Icon>
						<IconMail />
					</Icon>
				</div>
				<span class='auth-kicker'>Verify email</span>
				<h1 class='auth-title'>Check your inbox</h1>
				<p class='auth-sub'>
					We sent a confirmation link{email.value
						? (
							<>
								{' '}to <b>{email.value}</b>
							</>
						)
						: ''}. Click it to activate your account — it works from any device.
				</p>
			</div>

			<div class='auth-form'>
				<TextField
					id='verify-email'
					variant='glass'
					label='Email address'
					type='email'
					value={email.value}
					onInput={(e) => (email.value = (e.target as HTMLInputElement).value)}
					floatingRule='auto'
					autoComplete='email'
					disabled={countdown.value > 0 || isLoading.value}
				/>

				<button
					class='auth-cta'
					type='button'
					onClick={handleResend}
					disabled={!email.value || countdown.value > 0 || isLoading.value}
				>
					{isLoading.value
						? 'Sending…'
						: countdown.value > 0
						? `Resend available in ${countdown.value}s`
						: 'Resend verification email'}
				</button>
			</div>
		</>
	);
}
