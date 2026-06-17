import '../../styles/components/verify/verify-email.css';
import { Button, Icon, toast } from '@projective/ui';
import { useSignal } from '@preact/signals';
import { IconMail } from '@tabler/icons-preact';
import { useEffect } from 'preact/hooks';
import { TextField } from '@projective/fields';
import { ResendService } from '@features/auth/services/ResendService.ts';

export default function VerifyEmail({ initialEmail }: { initialEmail?: string }) {
	// #region State
	const email = useSignal(initialEmail);
	const countdown = useSignal(0);
	const isLoading = useSignal(false);
	// #endregion

	// #region Lifecycle
	useEffect(() => {
		let timer: number;
		if (countdown.value > 0) {
			timer = setInterval(() => {
				countdown.value--;
			}, 1000);
		}
		return () => clearInterval(timer);
	}, [countdown.value]);
	// #endregion

	// #region Handlers
	const handleResend = async () => {
		if (!email.value || countdown.value > 0 || isLoading.value) return;

		isLoading.value = true;

		try {
			await ResendService.resendEmail(email.value);
			toast.success('Verification email sent! Please check your inbox.');
			countdown.value = 60;
		} catch (err: any) {
			toast.error(err.message || 'An unexpected error occurred while resending.');
		} finally {
			isLoading.value = false;
		}
	};
	// #endregion

	return (
		<div class='verify-email'>
			<div class='verify__content'>
				<div class='verify__icon-container'>
					<Icon size={48}>
						<IconMail />
					</Icon>
				</div>

				<h1 class='verify__title'>Verify your email</h1>
				<p class='verify__subtitle'>
					We need to verify your email address before you can access Projective. Please check your
					inbox for a verification link.
				</p>

				<div class='verify__form'>
					<TextField
						label='Email Address'
						type='email'
						value={email.value}
						onInput={(e) => (email.value = (e.target as HTMLInputElement).value)}
						floatingRule='auto'
						disabled={countdown.value > 0 || isLoading.value}
					/>

					<Button
						variant='primary'
						fullWidth
						onClick={handleResend}
						disabled={!email.value || countdown.value > 0 || isLoading.value}
						loading={isLoading.value}
					>
						{countdown.value > 0
							? `Resend available in ${countdown.value}s`
							: 'Resend Verification Email'}
					</Button>
				</div>
			</div>
		</div>
	);
}
