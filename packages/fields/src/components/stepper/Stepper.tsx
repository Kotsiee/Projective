import { createContext } from 'preact';
import { useContext, useEffect, useRef, useState } from 'preact/hooks';
import { StepperContextValue, StepperProps } from '../../types/components/stepper.ts';
import { useStepper } from '../../hooks/useStepper.ts';

const StepperContext = createContext<StepperContextValue | null>(null);

export function useStepperContext() {
	const ctx = useContext(StepperContext);
	if (!ctx) throw new Error('Stepper components must be within <Stepper>');
	return ctx;
}

export function Stepper({
	children,
	activeStep,
	defaultActiveStep,
	orientation = 'horizontal',
	variant = 'circle',
	responsive, // New prop
	linear = true,
	keepMounted = true,
	onStepChange,
	onComplete,
	beforeStepChange,
	className,
	style,
}: StepperProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [isCompact, setCompact] = useState(false);

	const {
		activeStep: currentStep,
		totalSteps,
		isLoading,
		stepErrors,
		next,
		back,
		goTo,
		setTotalSteps,
		setStepError,
	} = useStepper({
		activeStep,
		defaultActiveStep,
		linear,
		onStepChange,
		onComplete,
		beforeStepChange,
	});

	// --- Responsive Logic ---
	useEffect(() => {
		if (!responsive || !containerRef.current) return;

		const breakpoint = typeof responsive === 'number' ? responsive : 600;

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				setCompact(entry.contentRect.width < breakpoint);
			}
		});

		observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, [responsive]);

	// Calculate final orientation based on props + responsive state
	const activeOrientation = isCompact ? 'vertical' : orientation;

	return (
		<StepperContext.Provider
			value={{
				activeStep: currentStep,
				orientation: activeOrientation,
				variant,
				linear,
				keepMounted,
				next,
				back,
				goTo,
				totalSteps,
				setTotalSteps,
				isLoading,
				stepErrors,
				setStepError,
			}}
		>
			<div
				ref={containerRef}
				className={`stepper stepper--${activeOrientation} stepper--${variant} ${className || ''}`}
				style={style}
			>
				{children}
			</div>
		</StepperContext.Provider>
	);
}
