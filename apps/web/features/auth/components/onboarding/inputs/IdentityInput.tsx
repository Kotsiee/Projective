import { Button, useWizardContext } from '@projective/ui';
import { DateField, TextField } from '@projective/fields';
import { SSOActions } from '../actions/SSOActions.tsx';
import { useOnboardingContext } from '../../../contexts/OnboardingContext.tsx';
import { Signal } from '@preact/signals';

export function IdentityInput() {
	const { next, back } = useWizardContext();
	const { firstName, lastName, username, dob, profilePicture } = useOnboardingContext();

	return (
		<div>
			<div class='identity-input__profile-picture'>
			</div>

			<div>
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

			<DateField
				label='Last Name'
				value={dob.value}
				onChange={(date) => {
					dob.value = date;
				}}
				floatingRule='auto'
			/>

			<Button
				variant='secondary'
				onClick={back}
			>
				Back
			</Button>

			<Button
				variant='primary'
				fullWidth
				onClick={next}
				disabled={!username.value || !firstName.value || !dob.value}
			>
				Continue
			</Button>
		</div>
	);
}
