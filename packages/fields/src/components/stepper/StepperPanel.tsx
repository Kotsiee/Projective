import { useStepperContext } from './Stepper.tsx';
import { StepperPanelProps } from '../../types/components/stepper.ts';

export function StepperPanel({ children, index, className, style }: StepperPanelProps) {
	const { activeStep, keepMounted } = useStepperContext();
	const isActive = activeStep.value === index;

	if (!keepMounted && !isActive) return null;

	return (
		<div
			className={`stepper__panel ${isActive ? 'stepper__panel--active' : ''} ${className || ''}`}
			style={{
				display: isActive ? 'block' : 'none',
				...style,
			}}
			role='tabpanel'
			aria-hidden={!isActive}
		>
			{children}
		</div>
	);
}
