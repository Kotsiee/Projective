import { Button, useWizardContext } from '@projective/ui';
import { TextField } from '@projective/fields';
import { SSOActions } from '../actions/SSOActions.tsx';
import { useOnboardingContext } from '../../../contexts/OnboardingContext.tsx';
import { Signal } from '@preact/signals';

export function AccountInput() {
	const { next } = useWizardContext();
	const { email, password } = useOnboardingContext();

	return (
		<div>
			<div>
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
				disabled={!email.value || !password.value}
			>
				Continue
			</Button>

			<SSOActions />
		</div>
	);
}
