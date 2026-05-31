import '../../../styles/components/onboarding/inputs/input-orchestrator.css';
import { useWizardContext } from '@projective/ui';
import { AccountInput } from './AccountInput.tsx';
import { useComputed } from '@preact/signals';
import { IdentityInput } from './IdentityInput.tsx';

export function InputOrchestrator() {
	const { currentStep } = useWizardContext();

	const currentStepTitle = useComputed(() => {
		switch (currentStep.value) {
			case 1:
				return 'Account';
			case 2:
				return 'Identity';
			case 3:
				return 'Objective';
		}
	});

	return (
		<div class='onboarding__input-orchestrator'>
			<h1 class='onboarding__input-orchestrator__title'>{currentStepTitle}</h1>

			{currentStep.value === 1 && <AccountInput />}
			{currentStep.value === 2 && <IdentityInput />}
			{currentStep.value === 3 && (
				<div style={{ animation: 'fadeIn 0.3s ease' }}>
					<h2>Objective Input Pending...</h2>
				</div>
			)}

			<p class='onboarding__input-orchestrator__login'>
				Already have an account?
				<a href='/login'>Log in</a>
			</p>
		</div>
	);
}
