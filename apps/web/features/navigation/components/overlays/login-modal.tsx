import { signal, useSignal } from '@preact/signals';
import { Button, Modal, ModalLayout } from '@projective/ui';
import { TextField } from '@projective/fields';
import '@features/shared/styles/components/auth/auth-modal.css';
import { SSOActions } from '@features/auth/components/onboarding/actions/SSOActions.tsx';

// 1. Export a global signal so we can open this modal from anywhere in the app!
export const isLoginModalOpen = signal(false);

/**
 * AuthModal
 * * Interstitial Login Modal triggered by global signal.
 * * Uses the ModalLayout and Icon components.
 */
export default function LoginModal() {
	const isLoading = useSignal(false);
	const email = useSignal('');
	const password = useSignal('');

	const handleClose = () => {
		isLoginModalOpen.value = false;
		email.value = '';
		password.value = '';
	};

	const handleLoginSubmit = async (e: Event) => {
		e.preventDefault();
		isLoading.value = true;

		try {
			const res = await fetch('/api/v1/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: email.value, password: password.value }),
			});

			if (res.ok) {
				globalThis.location.reload();
			} else {
				console.error('Login failed');
			}
		} catch (err) {
			console.error(err);
		} finally {
			isLoading.value = false;
		}
	};

	return (
		<Modal isOpen={isLoginModalOpen.value} onClose={handleClose} title='Welcome Back'>
			<ModalLayout
				footer={
					<div
						style={{
							width: '100%',
							textAlign: 'center',
							fontSize: '0.875rem',
							color: 'var(--text-muted)',
						}}
					>
						Don't have an account?
						<a
							href='/register'
							style={{ color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}
						>
							Sign up here
						</a>
					</div>
				}
			>
				<form class='auth-modal__form' onSubmit={handleLoginSubmit}>
					<TextField
						label='Email Address'
						type='email'
						value={email}
						required
						placeholder='name@example.com'
					/>

					<TextField
						label='Password'
						type='password'
						value={password}
						required
						placeholder='••••••••'
					/>

					<a href='/reset' class='auth-modal__forgot-password'>
						Forgot Password?
					</a>

					<Button variant='primary' loading={isLoading.value} fullWidth>
						Log In
					</Button>
				</form>

				<SSOActions />
			</ModalLayout>
		</Modal>
	);
}
