import { ComponentChildren } from 'preact';
import { IconLoader2 } from '@tabler/icons-preact';
import { useStepperContext } from './Stepper.tsx';

interface StepperFooterProps {
	children?: ComponentChildren;
	className?: string;
}

export function StepperFooter({ children, className }: StepperFooterProps) {
	const { next, back, activeStep, totalSteps, isLoading } = useStepperContext();
	const isFirst = activeStep.value === 0;
	const isLast = activeStep.value === totalSteps.value - 1;

	if (children) {
		return <div className={`stepper__footer ${className || ''}`}>{children}</div>;
	}

	return (
		<div className={`stepper__footer ${className || ''}`}>
			<button
				className='btn btn--secondary'
				onClick={back}
				disabled={isFirst || isLoading.value}
			>
				Back
			</button>
			<button
				className='btn btn--primary'
				onClick={next}
				disabled={isLoading.value}
				style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
			>
				{isLoading.value && <IconLoader2 className='stepper__spin' size={16} />}
				{isLast ? 'Finish' : 'Next'}
			</button>
		</div>
	);
}
