import { cloneElement, ComponentChildren, toChildArray, VNode } from 'preact';
import { useEffect } from 'preact/hooks';
import { useStepperContext } from './Stepper.tsx';

// #region Interfaces
interface StepperHeaderProps {
	children: ComponentChildren;
	className?: string;
}
// #endregion

export function StepperHeader({ children, className }: StepperHeaderProps) {
	const { setTotalSteps } = useStepperContext();
	const steps = toChildArray(children);

	useEffect(() => {
		setTotalSteps(steps.length);
	}, [steps.length]);

	return (
		// Changed from <div> to <nav> for accessibility
		<div
			className={`stepper__header ${className || ''}`}
			aria-label='Progress'
		>
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
