/**
 * @file DisplayOrchestrator.tsx
 * @description Content of the onboarding visual pane: the live "Projective ID"
 * identity card, brand copy, and the step tracker. Rendered inside AuthShell's
 * visual slot (within the onboarding island, so the card reads wizard context).
 */

import { OnboardingStepper } from './OnboardingStepper.tsx';
import { GlassDisplayCard } from './GlassDisplayCard.tsx';

export function DisplayOrchestrator() {
	return (
		<>
			<GlassDisplayCard />
			<div class='auth-visual__body'>
				<span class='auth-eyebrow'>Your pass, live</span>
				<p class='auth-lede'>Watch your profile come together as you type.</p>
				<OnboardingStepper />
			</div>
		</>
	);
}
