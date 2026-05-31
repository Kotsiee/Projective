import '../../../styles/components/onboarding/displays/display-orchestrator.css';
import { OnboardingStepper } from './OnboardingStepper.tsx';
import { GlassDisplayCard } from './GlassDisplayCard.tsx';

export function DisplayOrchestrator() {
	return (
		<div class='onboarding__display-orchestrator'>
			<h1 class='onboarding__display-orchestrator__title'>Join Projective</h1>
			<div class='onboarding__display-orchestrator__card'>
				<GlassDisplayCard />
			</div>
			<OnboardingStepper />
		</div>
	);
}
