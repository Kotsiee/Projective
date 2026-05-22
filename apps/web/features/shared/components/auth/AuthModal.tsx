import { useSignal } from '@preact/signals';
import { Button, Icon, Modal, ModalLayout } from '@projective/ui';
import { TextField } from '@projective/fields';
import { IconBrandGoogle } from '@tabler/icons-preact';
import '../../styles/components/auth/auth-modal.css';

/**
 * AuthModal
 * * Manages the Log In trigger button and the interstitial Login Modal.
 * * Uses the newly implemented ModalLayout and Icon components.
 */
export default function AuthModal() {
	const isOpen = useSignal(false);
	const isLoading = useSignal(false);
	const email = useSignal('');
	const password = useSignal('');

	const handleOpen = () => (isOpen.value = true);
	const handleClose = () => (isOpen.value = false);

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
		<>
			{/* #region Trigger Actions */}
			<Button ghost onClick={handleOpen}>
				Log In
			</Button>
			<Button variant='primary' href='/register'>
				Sign Up
			</Button>
			{/* #endregion */}

			<Modal isOpen={isOpen.value} onClose={handleClose} title='Welcome Back'>
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
							Don't have an account?{' '}
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

					<div class='auth-modal__divider'>OR</div>

					<div class='auth-modal__sso'>
						<Button
							variant='secondary'
							onClick={() => globalThis.location.href = '/api/v1/auth/google'}
							fullWidth
						>
							<Icon>
								<IconBrandGoogle />
							</Icon>{' '}
							Continue with Google
						</Button>
					</div>
				</ModalLayout>
			</Modal>
		</>
	);
}
