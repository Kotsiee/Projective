import { ComponentChildren } from 'preact';
import { Button } from '../../button/Button.tsx';
import { ButtonGroup } from '../../button/ButtonGroup.tsx';
import { useStepperContext } from '../../stepper/Stepper.tsx';

interface WizardFooterProps {
	/**
	 * The button to show on the final step (e.g. "Create Team", "Publish")
	 */
	finalAction: ComponentChildren;

	/**
	 * Optional button to show on the left (e.g. "Save Draft")
	 */
	secondaryAction?: ComponentChildren;
}

export function WizardFooter({ finalAction, secondaryAction }: WizardFooterProps) {
	const { next, back, activeStep, totalSteps, isLoading } = useStepperContext();
	const isFirst = activeStep.value === 0;
	const isLast = activeStep.value === totalSteps.value - 1;

	return (
		<div className='wizard__footer'>
			<div className='wizard__secondary-actions'>
				{secondaryAction}
			</div>

			<div className='wizard__nav-buttons'>
				<ButtonGroup>
					<Button
						variant='secondary'
						onClick={back}
						disabled={isFirst || isLoading.value}
					>
						Back
					</Button>

					{!isLast
						? (
							<Button
								variant='primary'
								onClick={next}
								loading={isLoading.value}
							>
								Next Step
							</Button>
						)
						: finalAction}
				</ButtonGroup>
			</div>
		</div>
	);
}
