import { useWizardContext } from '@projective/ui';
import { DateField, TextField } from '@projective/fields';
import { useOnboardingContext } from '../../../contexts/OnboardingContext.tsx';
import { AvatarPicker } from './AvatarPicker.tsx';
import { Signal } from '@preact/signals';
import { evaluateAge, validateUsername } from 'packages/backend/src/core/validation/email.ts';

export function IdentityInput() {
	const { next, back } = useWizardContext();
	const { firstName, lastName, username, dob, isAdult, oauthOnboarding } = useOnboardingContext();

	const usernameStatus = validateUsername(username.value || '');
	const ageStatus = evaluateAge(dob.value);

	// Keep isAdult in sync for later wizard steps.
	isAdult.value = ageStatus.isOver18;

	const usernameError = username.value && !usernameStatus.isValid
		? (!usernameStatus.hasValidLength
			? 'Username must be 3–15 characters.'
			: 'Only letters, numbers, and . - _ are allowed.')
		: '';

	const isFormValid = !!firstName.value?.trim() &&
		!!lastName.value?.trim() &&
		usernameStatus.isValid &&
		ageStatus.isOver13;

	return (
		<div class='auth-form'>
			<AvatarPicker />

			<div class='auth-namerow'>
				<TextField
					id='join-firstname'
					variant='glass'
					label='First name'
					value={firstName as Signal<string>}
					floatingRule='auto'
					autoComplete='given-name'
					required
				/>
				<TextField
					id='join-lastname'
					variant='glass'
					label='Last name'
					value={lastName as Signal<string>}
					floatingRule='auto'
					autoComplete='family-name'
					required
				/>
			</div>

			<TextField
				id='join-username'
				variant='glass'
				label='Username'
				value={username as Signal<string>}
				floatingRule='auto'
				autoComplete='username'
				required
				error={usernameError}
			/>

			<DateField
				label='Date of birth'
				value={dob.value}
				onChange={(date) => {
					dob.value = date;
				}}
				floatingRule='auto'
			/>

			{dob.value && !ageStatus.isOver13 && (
				<p class='auth-note auth-note--warn' role='alert'>
					You must be at least 13 years old to create an account.
				</p>
			)}

			{dob.value && ageStatus.isOver13 && !ageStatus.isOver18 && (
				<p class='auth-note auth-note--info'>
					Heads up — some actions on Projective require you to be 18 or older.
				</p>
			)}

			<div class='auth-btnrow'>
				{/* OAuth sign-ups skip the email/password step, so there is nothing to go back to. */}
				{!oauthOnboarding.value && (
					<button type='button' class='auth-btn-secondary' onClick={back}>Back</button>
				)}
				<button
					type='button'
					class='auth-cta'
					onClick={next}
					disabled={!isFormValid}
				>
					Continue
				</button>
			</div>
		</div>
	);
}
