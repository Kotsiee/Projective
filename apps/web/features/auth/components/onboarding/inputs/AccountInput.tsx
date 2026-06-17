import '../../../styles/components/onboarding/inputs/account-input.css';
import { Button, useWizardContext } from '@projective/ui';
import { TextField } from '@projective/fields';
import { SSOActions } from '../actions/SSOActions.tsx';
import { useOnboardingContext } from '../../../contexts/OnboardingContext.tsx';
import { Signal } from '@preact/signals';
import { isLikelyEmail, validatePassword } from 'packages/backend/src/core/validation/email.ts';

export function AccountInput() {
	const { next } = useWizardContext();
	const { email, password } = useOnboardingContext();

	const psv = validatePassword(password.value || '');
	const isFormValid = isLikelyEmail(email.value || '') && psv.isValid;

	return (
		<div class='account-input'>
			{password.value && !psv.isValid && (
				<div class='account-input__password-requirements'>
					<p>Password requirements:</p>
					<ul>
						<li class={psv.hasMinLength ? 'met' : 'unmet'}>
							{psv.hasMinLength ? '✓' : '•'} At least 8 characters
						</li>
						<li class={psv.hasUppercase ? 'met' : 'unmet'}>
							{psv.hasUppercase ? '✓' : '•'} At least one uppercase letter
						</li>
						<li class={psv.hasLowercase ? 'met' : 'unmet'}>
							{psv.hasLowercase ? '✓' : '•'} At least one lowercase letter
						</li>
						<li class={psv.hasSymbol ? 'met' : 'unmet'}>
							{psv.hasSymbol ? '✓' : '•'} At least one symbol/special character
						</li>
						{!psv.hasNoSpaces && <li class='unmet'>• Cannot contain spaces</li>}
						{!psv.isNotCommonSequence && (
							<li class='unmet'>• Avoid common sequences (e.g., '12345')</li>
						)}
					</ul>
				</div>
			)}

			<div class='account-input__fields'>
				<TextField
					label='Email Address'
					type='email'
					value={email as Signal<string>}
					floatingRule='auto'
				/>

				<TextField
					label='Password'
					type='password'
					value={password as Signal<string>}
					floatingRule='auto'
				/>
			</div>

			<Button
				variant='primary'
				fullWidth
				onClick={next}
				disabled={!isFormValid}
			>
				Continue
			</Button>

			<SSOActions />
		</div>
	);
}
