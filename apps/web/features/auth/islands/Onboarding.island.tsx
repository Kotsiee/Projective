import { WizardProvider } from '@projective/ui';
import { OnboardingProvider } from '../contexts/OnboardingContext.tsx';
import { AuthShell } from '../components/shared/AuthShell.tsx';
import { InputOrchestrator } from '../components/onboarding/inputs/InputOrchestrator.tsx';
import { DisplayOrchestrator } from '../components/onboarding/displays/DisplayOrchestrator.tsx';

export default function OnboardingIsland() {
	return (
		<WizardProvider totalSteps={4}>
			<OnboardingProvider>
				<AuthShell visual={<DisplayOrchestrator />}>
					<InputOrchestrator />
				</AuthShell>
			</OnboardingProvider>
		</WizardProvider>
	);
}
