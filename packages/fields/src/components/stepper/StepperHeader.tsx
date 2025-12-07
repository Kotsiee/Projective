import { cloneElement, ComponentChildren, toChildArray, VNode } from 'preact';
import { useEffect } from 'preact/hooks';
import { useStepperContext } from './Stepper.tsx';

interface StepperHeaderProps {
	children: ComponentChildren;
	className?: string;
}

export function StepperHeader({ children, className }: StepperHeaderProps) {
	const { setTotalSteps } = useStepperContext();
	const steps = toChildArray(children);

	useEffect(() => {
		setTotalSteps(steps.length);
	}, [steps.length]);

	return (
		<div className={`stepper__header ${className || ''}`}>
			{steps.map((child, index) => {
				if (typeof child !== 'object' || child === null) return child;
				return cloneElement(child as VNode<any>, {
					index,
					isLast: index === steps.length - 1,
				});
			})}
		</div>
	);
}
