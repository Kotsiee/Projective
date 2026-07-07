import { Head } from 'fresh/runtime';
import { AuthShell } from '@features/auth/components/shared/AuthShell.tsx';
import LoginForm from '@features/auth/islands/LoginForm.island.tsx';

export default function Login() {
	return (
		<>
			<Head>
				<title>Log in · Projective</title>
			</Head>

			<AuthShell
				visual={
					<>
						<div
							class='auth-shard'
							style='width:120px;height:150px;top:96px;right:52px;transform:rotate(9deg)'
						>
						</div>
						<div
							class='auth-shard'
							style='width:90px;height:90px;top:210px;right:150px;transform:rotate(-12deg)'
						>
						</div>
						<div class='auth-visual__body'>
							<span class='auth-eyebrow'>Welcome back</span>
							<h1>
								Build together.<br />
								<span class='auth-grad'>Deliver better.</span>
							</h1>
							<p class='auth-lede'>
								Pick up where your team left off — proposals, milestones, and payments, all in one
								calm workspace.
							</p>
							<div class='auth-chips'>
								<span class='auth-chip'>
									<span class='dot'></span> Escrow-protected pay
								</span>
								<span class='auth-chip'>Milestones &amp; chat</span>
							</div>
						</div>
					</>
				}
			>
				<LoginForm />
			</AuthShell>
		</>
	);
}
