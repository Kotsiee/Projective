// import { useSignal } from '@preact/signals';
// import { Button, Icon } from '@projective/ui';
// import { TextField } from '@projective/fields';
// import { IconBrandGithub, IconBrandGoogle } from '@tabler/icons-preact';
// import '../styles/pages/login.css';
// import { useCallback } from 'preact/hooks';

// export default function LoginCanvas() {
// 	const email = useSignal('');
// 	const password = useSignal('');
// 	const isLoading = useSignal(false);

// 	const handleLogin = async (e: Event) => {
// 		e.preventDefault();
// 		isLoading.value = true;
// 		try {
// 			const res = await fetch('/api/v1/auth/login', {
// 				method: 'POST',
// 				headers: { 'Content-Type': 'application/json' },
// 				body: JSON.stringify({ email: email.value, password: password.value }),
// 			});
// 			if (res.ok) window.location.href = '/dashboard';
// 		} finally {
// 			isLoading.value = false;
// 		}
// 	};

// 	const handleLoginWithGoogle = useCallback(() => {
// 		// if (loading) return;
// 		// setErr(null);
// 		// setLoading(true);

// 		try {
// 			const params = new URLSearchParams({
// 				next: '/',
// 			});
// 			const startUrl = `/api/v1/auth/google/google-login?${params.toString()}`;

// 			globalThis.location.assign(startUrl);
// 		} catch (e) {
// 			const msg = e instanceof Error ? e.message : 'Unknown error starting OAuth';
// 			console.error('OAuth start exception', e);
// 			globalThis.dispatchEvent(
// 				new CustomEvent('auth:error', { detail: { stage: 'oauth_start', error: String(msg) } }),
// 			);
// 		}
// 	}, []);

// 	const anchorGraphic = (
// 		<>
// 			<div class='login-graphic'>
// 				<div class='login-graphic__pipeline'>
// 					<div class='login-graphic__block' />
// 				</div>
// 			</div>
// 			<div style={{ position: 'absolute', bottom: '3rem', left: '3rem' }}>
// 				<h2 style={{ fontSize: '1.5rem', fontWeight: 500, margin: '0 0 0.5rem 0' }}>
// 					High-Trust Workflows.
// 				</h2>
// 				<p style={{ color: 'var(--text-muted)', margin: 0 }}>
// 					Log in to access your escrow timelines and team pipelines.
// 				</p>
// 			</div>
// 		</>
// 	);

// 	return (
// 		<AuthLayout anchorContent={anchorGraphic} anchorRatio='50'>
// 			<div style={{ textAlign: 'center', marginBottom: '1rem' }}>
// 				<h1 style={{ fontSize: '1.75rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
// 					Welcome Back
// 				</h1>
// 				<p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem' }}>
// 					Don't have an account?{' '}
// 					<a href='/register' style={{ color: 'var(--primary)', textDecoration: 'none' }}>
// 						Sign up
// 					</a>
// 				</p>
// 			</div>

// 			<form
// 				onSubmit={handleLogin}
// 				style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
// 			>
// 				<TextField label='Email Address' type='email' value={email} required floatingRule='auto' />
// 				<TextField label='Password' type='password' value={password} required floatingRule='auto' />

// 				<a
// 					href='/reset'
// 					style={{
// 						textAlign: 'right',
// 						fontSize: '0.75rem',
// 						color: 'var(--primary)',
// 						textDecoration: 'none',
// 						marginTop: '-0.75rem',
// 						fontWeight: 500,
// 					}}
// 				>
// 					Forgot password?
// 				</a>

// 				<Button variant='primary' loading={isLoading.value} fullWidth>
// 					Log In
// 				</Button>
// 			</form>

// 			<div
// 				style={{
// 					display: 'flex',
// 					alignItems: 'center',
// 					margin: '1.5rem 0',
// 					color: 'var(--text-muted)',
// 					fontSize: '0.75rem',
// 				}}
// 			>
// 				<div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
// 				<span style={{ padding: '0 1rem', fontWeight: 500 }}>OR</span>
// 				<div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
// 			</div>

// 			<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
// 				<Button
// 					variant='secondary'
// 					fullWidth
// 					onClick={() => handleLoginWithGoogle()}
// 				>
// 					<Icon>
// 						<IconBrandGoogle />
// 					</Icon>
// 					Continue with Google
// 				</Button>
// 				<Button
// 					variant='secondary'
// 					fullWidth
// 					onClick={() => window.location.href = '/api/v1/auth/github'}
// 				>
// 					<Icon>
// 						<IconBrandGithub />
// 					</Icon>
// 					Continue with GitHub
// 				</Button>
// 			</div>
// 		</AuthLayout>
// 	);
// }
