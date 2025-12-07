import { Signal, useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { StepperProps } from '../types/components/stepper.ts';

export function useStepper({
	activeStep,
	defaultActiveStep = 0,
	onStepChange,
	onComplete,
	beforeStepChange,
	linear = true,
}: Pick<
	StepperProps,
	'activeStep' | 'defaultActiveStep' | 'onStepChange' | 'onComplete' | 'linear' | 'beforeStepChange'
>) {
	const currentStep = useSignal(defaultActiveStep);
	const totalSteps = useSignal(0);
	const isLoading = useSignal(false);
	const stepErrors = useSignal<Set<number>>(new Set());

	// Sync controlled prop
	useEffect(() => {
		if (activeStep !== undefined) {
			currentStep.value = activeStep;
		}
	}, [activeStep]);

	const setStepError = (index: number, hasError: boolean) => {
		const next = new Set(stepErrors.value);
		if (hasError) next.add(index);
		else next.delete(index);
		stepErrors.value = next;
	};

	const changeStep = async (newStep: number) => {
		if (newStep < 0 || newStep >= totalSteps.value) return;
		if (isLoading.value) return; // Prevent double clicks

		// Linear constraints
		if (linear && newStep > currentStep.value + 1) {
			return;
		}

		// Guard Clause (Async Validation)
		if (beforeStepChange) {
			const result = beforeStepChange(newStep, currentStep.value);

			if (result === false) return; // Blocked synchronously

			if (result instanceof Promise) {
				isLoading.value = true;
				try {
					const allowed = await result;
					if (!allowed) return; // Blocked asynchronously
				} catch (e) {
					console.error('Step validation failed', e);
					return; // Block on error
				} finally {
					isLoading.value = false;
				}
			}
		}

		currentStep.value = newStep;
		onStepChange?.(newStep);
	};

	const next = () => {
		if (currentStep.value < totalSteps.value - 1) {
			changeStep(currentStep.value + 1);
		} else {
			// Validate final step before completing?
			// Usually onComplete handles final submission
			if (!isLoading.value) onComplete?.();
		}
	};

	const back = () => {
		// Usually we don't validate going back, but we can if needed.
		// For now, allow free back travel without async guard unless strictly required.
		if (currentStep.value > 0) {
			// Bypass async guard for back? Usually yes for UX.
			// If we want guard on back, call changeStep.
			// Here we just set logic directly to avoid 'saving' when cancelling.
			currentStep.value = currentStep.value - 1;
			onStepChange?.(currentStep.value);
		}
	};

	const goTo = (step: number) => {
		changeStep(step);
	};

	return {
		activeStep: currentStep,
		totalSteps,
		isLoading,
		stepErrors,
		next,
		back,
		goTo,
		setTotalSteps: (count: number) => {
			totalSteps.value = count;
		},
		setStepError,
	};
}
