import { Head } from 'fresh/runtime';
import { AuthShell } from '@features/auth/components/shared/AuthShell.tsx';
import ResetPasswordForm from '@features/auth/islands/ResetPasswordForm.island.tsx';

export default function Reset() {
	return (
		<>
			<Head>
				<title>Choose a new password · Projective</title>
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
							<span class='auth-eyebrow'>Fresh start</span>
							<h1>
								A new key<br />
								<span class='auth-grad'>for your work.</span>
							</h1>
							<p class='auth-lede'>
								Pick a strong password and you'll be back to your projects in seconds.
							</p>
						</div>
					</>
				}
			>
				<ResetPasswordForm />
			</AuthShell>
		</>
	);
}
