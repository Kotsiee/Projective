import '../../../styles/components/onboarding/displays/onboarding-stepper.css';
import { Icon, useWizardContext } from '@projective/ui';
import { IconBriefcase, IconMail, IconUser } from '@tabler/icons-preact';

export function OnboardingStepper() {
	const { currentStep } = useWizardContext();

	// Step 4 is just an extension of Step 3 conceptually, so we only display 3 primary dots
	const steps = [
		{ label: 'Account', icon: <IconMail /> },
		{ label: 'Identity', icon: <IconUser /> },
		{ label: 'Objective', icon: <IconBriefcase /> },
	];

	return (
		<div class='onboarding-tracker'>
			{steps.map((step, idx) => {
				const stepNum = idx + 1;
				const isActive = currentStep.value === stepNum ||
					(currentStep.value === 4 && stepNum === 3);
				const isCompleted = currentStep.value > stepNum;

				let stepClass = '';
				if (isActive) stepClass = 'onboarding-tracker__step--active';
				if (isCompleted) stepClass = 'onboarding-tracker__step--completed';

				return (
					<>
						<div class={`onboarding-tracker__step ${stepClass}`} key={step.label}>
							<div class='onboarding-tracker__indicator'>
								<Icon size={24}>{step.icon}</Icon>
							</div>
							<span class='onboarding-tracker__label'>{step.label}</span>
						</div>

						{/* Render connector lines between steps, but not after the last one */}
						{idx < steps.length - 1 && (
							<div
								class={`onboarding-tracker__connector ${
									isCompleted ? 'onboarding-tracker__connector--completed' : ''
								}`}
							/>
						)}
					</>
				);
			})}
		</div>
	);
}
