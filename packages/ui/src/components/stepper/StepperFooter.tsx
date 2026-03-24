import { ComponentChildren } from 'preact';
import { useStepperContext } from './Stepper.tsx';
import { Button } from '../button/Button.tsx';

// #region Interfaces
interface StepperFooterProps {
	children?: ComponentChildren;
	className?: string;
	/**
	 * Optional custom text for the final step button (Defaults to "Finish")
	 */
	finishLabel?: string;
}
// #endregion

export function StepperFooter({ children, className, finishLabel = 'Finish' }: StepperFooterProps) {
	const { next, back, activeStep, totalSteps, isLoading } = useStepperContext();
	const isFirst = activeStep.value === 0;
	const isLast = activeStep.value === totalSteps.value - 1;

	// If the user provides custom children, render them instead of the default buttons.
	if (children) {
		return <div className={`stepper__footer ${className || ''}`}>{children}</div>;
	}

	return (
		<div className={`stepper__footer ${className || ''}`}>
			{/* Using the official Button component instead of raw HTML tags */}
			<Button
				variant='secondary'
				onClick={back}
				disabled={isFirst || isLoading.value}
			>
				Back
			</Button>

			<Button
				variant='primary'
				onClick={next}
				loading={isLoading.value}
			>
				{isLast ? finishLabel : 'Next Step'}
			</Button>
		</div>
	);
}
