import { cloneElement, ComponentChildren, toChildArray, VNode } from 'preact';

interface StepperContentProps {
	children: ComponentChildren;
	className?: string;
}

export function StepperContent({ children, className }: StepperContentProps) {
	const panels = toChildArray(children);

	return (
		<div className={`stepper__content ${className || ''}`}>
			{panels.map((child, index) => {
				if (typeof child !== 'object' || child === null) return child;
				return cloneElement(child as VNode<any>, { index });
			})}
		</div>
	);
}
