import '../../../styles/components/onboarding/inputs/identity-input.css';
import { Button, useWizardContext } from '@projective/ui';
import { DateField, TextField } from '@projective/fields';
import { useOnboardingContext } from '../../../contexts/OnboardingContext.tsx';
import { Signal } from '@preact/signals';
import { evaluateAge, validateUsername } from 'packages/backend/src/core/validation/email.ts';

export function IdentityInput() {
	const { next, back } = useWizardContext();
	const { firstName, lastName, username, dob, isAdult } = useOnboardingContext();

	// Calculate live verification states
	const usernameStatus = validateUsername(username.value || '');
	const ageStatus = evaluateAge(dob.value);

	// Synchronize 'isAdult' signal so other wizards parts can access it later
	isAdult.value = ageStatus.isOver18;

	// Core form submission gate rule logic
	const isFormValid = !!firstName.value?.trim() &&
		!!lastName.value?.trim() &&
		usernameStatus.isValid &&
		ageStatus.isOver13;

	return (
		<div class='identity-input__container'>
			<div class='identity-input__profile-picture'>
				{/* Reserved for future iteration placeholder */}
			</div>

			<div class='identity-input__fields'>
				<div class='identity-input__name-row'>
					<TextField
						label='First Name'
						value={firstName as Signal<string>}
						floatingRule='auto'
					/>

					<TextField
						label='Last Name'
						value={lastName as Signal<string>}
						floatingRule='auto'
					/>
				</div>

				<TextField
					label='Username'
					value={username as Signal<string>}
					floatingRule='auto'
				/>

				{/* Real-time username hint banner */}
				{username.value && !usernameStatus.isValid && (
					<div class='validation-error-bubble'>
						{!usernameStatus.hasValidLength && (
							<p>• Username must be between 3 and 15 characters.</p>
						)}
						{!usernameStatus.hasValidChars && (
							<p>• Only letters, numbers, periods (.), dashes (-), or underscores (_) allowed.</p>
						)}
					</div>
				)}

				<DateField
					label='Date of Birth'
					value={dob.value}
					onChange={(date) => {
						dob.value = date;
					}}
					floatingRule='auto'
				/>
			</div>

			{/* Age Restriction Warnings */}
			{dob.value && !ageStatus.isOver13 && (
				<div class='validation-error-bubble critical'>
					<p>You must be at least 13 years old to register an account.</p>
				</div>
			)}

			{dob.value && ageStatus.isOver13 && !ageStatus.isOver18 && (
				<div class='validation-info-bubble'>
					<p>ℹNote: Certain actions on this platform require you to be 18+.</p>
				</div>
			)}

			<div class='identity-input__actions'>
				<Button
					className='identity-input__back-button'
					variant='secondary'
					onClick={back}
				>
					Back
				</Button>

				<Button
					className='identity-input__continue-button'
					variant='primary'
					fullWidth
					onClick={next}
					disabled={!isFormValid}
				>
					Continue
				</Button>
			</div>
		</div>
	);
}
