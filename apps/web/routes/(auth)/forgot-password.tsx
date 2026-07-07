import { Head } from 'fresh/runtime';
import { AuthShell } from '@features/auth/components/shared/AuthShell.tsx';
import ForgotPasswordForm from '@features/auth/islands/ForgotPasswordForm.island.tsx';

export default function ForgotPassword() {
	return (
		<>
			<Head>
				<title>Reset your password · Projective</title>
			</Head>

			<AuthShell
				visual={
					<>
						<div
							class='auth-shard'
							style='width:110px;height:140px;top:118px;right:70px;transform:rotate(-8deg)'
						>
						</div>
						<div
							class='auth-shard'
							style='width:80px;height:80px;top:240px;right:170px;transform:rotate(10deg)'
						>
						</div>
						<div class='auth-visual__body'>
							<span class='auth-eyebrow'>Happens to everyone</span>
							<h1>
								Let's get you<br />
								<span class='auth-grad'>back in.</span>
							</h1>
							<p class='auth-lede'>
								Enter your email and we'll send a reset link. Your projects are exactly where you
								left them.
							</p>
						</div>
					</>
				}
			>
				<ForgotPasswordForm />
			</AuthShell>
		</>
	);
}
