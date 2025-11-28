import '@styles/pages/auth/register.css';
import TextField from '@components/fields/TextField.tsx';
import PasswordField from '@components/fields/PasswordField.tsx';
import RegisterButton from '@components/auth/RegisterButton.tsx';
import GoogleRegisterButton from '@components/auth/GoogleRegisterButton.tsx';
import GitHubRegisterButton from '@components/auth/GitHubRegisterButton.tsx';
import { signal } from '@preact/signals';
import { AuthValidator, RegisterErrors } from '@projective/shared';

const email = signal<string | undefined>(undefined);
const password = signal<string | undefined>(undefined);
const confirmPassword = signal<string | undefined>(undefined);

const emailError = signal<string | null>(null);
const passwordError = signal<string | null>(null);
const confirmPasswordError = signal<string | null>(null);

const errors = signal<RegisterErrors>({});

export default function RegisterIsland() {
	return (
		<div class='register'>
			<div class='register__container'>
				<div class='register__container__center'>
					<div class='register__header'>
						<h1>Create an account</h1>
						<p>Begin Your Journey Here</p>
					</div>

					<form class='register__fields__container'>
						<div class='register__fields'>
							<div class='register__field'>
								<TextField
									id='email'
									onFocus={() => {
										emailError.value = '';
									}}
									onBlur={() => {
										emailError.value = AuthValidator
											.validateEmail(email.value || '');
									}}
									placeholder='Email'
									type='email'
									aria-label='Email address'
									aria-required='true'
									aria-invalid={!!emailError.value}
									aria-describedby='email-error'
									onInput={(e) => {
										email.value = e.currentTarget.value;
									}}
								/>
								{emailError.value && (
									<p
										id='email-error'
										class='register__field-error'
										role='alert'
									>
										{emailError.value ||
											errors.value?.email}
									</p>
								)}
							</div>

							<div class='register__field'>
								<PasswordField
									id='password'
									onFocus={() => {
										passwordError.value = '';
										confirmPasswordError.value = '';
									}}
									onBlur={() => {
										passwordError.value = AuthValidator
											.validateConfirmPassword(
												password.value || '',
												confirmPassword.value || '',
											);
										confirmPasswordError.value = AuthValidator
											.validateConfirmPassword(
												password.value || '',
												confirmPassword.value || '',
											);
									}}
									placeholder='Password'
									autocomplete='new-password'
									aria-label='Password'
									aria-required='true'
									aria-invalid={!!passwordError.value}
									aria-describedby='password-error'
									onInput={(e) => {
										password.value = e.currentTarget.value;
									}}
								/>
								{passwordError.value && (
									<p
										id='password-error'
										class='register__field-error'
										role='alert'
									>
										{passwordError.value ||
											errors.value?.password}
									</p>
								)}
							</div>

							<div class='register__field'>
								<PasswordField
									id='confirmPassword'
									onFocus={() => {
										passwordError.value = '';
										confirmPasswordError.value = '';
									}}
									onBlur={() => {
										passwordError.value = AuthValidator
											.validateConfirmPassword(
												password.value || '',
												confirmPassword.value || '',
											);
										confirmPasswordError.value = AuthValidator
											.validateConfirmPassword(
												password.value || '',
												confirmPassword.value || '',
											);
									}}
									placeholder='Re-enter Password'
									autocomplete='new-password'
									aria-label='Confirm password'
									aria-required='true'
									aria-invalid={!!confirmPasswordError.value}
									aria-describedby='confirmPassword-error'
									onInput={(e) => {
										confirmPassword.value = e.currentTarget.value;
									}}
								/>
								{confirmPasswordError.value && (
									<p
										id='confirmPassword-error'
										class='register__field-error'
										role='alert'
									>
										{confirmPasswordError.value ||
											errors.value?.confirmPassword}
									</p>
								)}
							</div>
						</div>

						<div class='register__actions'>
							<RegisterButton
								email={email}
								password={password}
								confirmPassword={confirmPassword}
							/>
							<GoogleRegisterButton />
							<GitHubRegisterButton />
						</div>
					</form>
				</div>
			</div>

			<div class='switch-auth'>
				<p class='switch-auth__text'>Already have an account?</p>
				<a class='switch-auth__link' href='/login'>Log In</a>
			</div>
		</div>
	);
}
