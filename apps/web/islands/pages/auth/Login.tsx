import '@styles/pages/auth/login.css';
import LoginButton from '@components/auth/LoginButton.tsx';
import GoogleLoginButton from '@components/auth/GoogleLoginButton.tsx';
import GitHubLoginButton from '@components/auth/GitHubRegisterButton.tsx';
import { signal } from '@preact/signals';
import { TextField } from '@projective/fields';

const email = signal<string | undefined>(undefined);
const password = signal<string | undefined>(undefined);

export default function LoginIsland() {
	return (
		<div class='login'>
			<div class='login__container'>
				<div class='login__container__center'>
					<div class='login__header'>
						<h1>Welcome Back</h1>
						<p>Dive back in, right where you left off</p>
					</div>

					<div class='login__fields__container'>
						<div class='login__fields'>
							<TextField
								id='email'
								placeholder='Email'
								type='email'
								aria-label='Email address'
								aria-required='true'
								aria-describedby='email-error'
								onInput={(e) => {
									email.value = e.currentTarget.value;
								}}
							/>
							<div>
								<TextField
									id='password'
									placeholder='Password'
									type='password'
									aria-label='Password'
									aria-required='true'
									aria-describedby='password-error'
									onInput={(e) => {
										password.value = e.currentTarget.value;
									}}
								/>
								<div class='login__fields__options'>
									<label for='remember-me' class='remember-me'>
										<input type='checkbox' id='remember-me' />
										<span>Remember Me</span>
									</label>
									<a href='/auth/forgot-password'>Forgot Password?</a>
								</div>
							</div>
						</div>

						<div class='login__actions'>
							<LoginButton
								email={email}
								password={password}
							/>
							<GoogleLoginButton />
							<GitHubLoginButton />
						</div>
					</div>
				</div>
			</div>
			<div class='switch-auth'>
				<p class='switch-auth__text'>Don't have an account?</p>
				<a class='switch-auth__link' href='/register'>Register</a>
			</div>
		</div>
	);
}
