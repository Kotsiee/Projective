import '../styles/pages/onboarding.css';
import { Icon, IconButton, WizardProvider } from '@projective/ui';
import { IconArrowLeft } from '@tabler/icons-preact';
import { OnboardingProvider } from '../contexts/OnboardingContext.tsx';
import { InputOrchestrator } from '../components/onboarding/inputs/InputOrchestrator.tsx';
import { DisplayOrchestrator } from '../components/onboarding/displays/DisplayOrchestrator.tsx';

export default function OnboardingIsland() {
	return (
		<WizardProvider totalSteps={4}>
			<OnboardingProvider>
				<div class='onboarding-canvas'>
					<div class='onboarding-canvas__left'>
						<div class='onboarding-canvas__header'>
							<IconButton href='/' aria-label='Back' ghost>
								<Icon>
									<IconArrowLeft />
								</Icon>
							</IconButton>
							<div class='onboarding-canvas__logo'>Logo</div>
						</div>

						<DisplayOrchestrator />
					</div>

					<div class='onboarding-canvas__right'>
						<InputOrchestrator />
					</div>
				</div>
			</OnboardingProvider>
		</WizardProvider>
	);
}
