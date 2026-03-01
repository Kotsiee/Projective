import { useSignal } from '@preact/signals';
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
	| 'activeStep'
	| 'defaultActiveStep'
	| 'onStepChange'
	| 'onComplete'
	| 'linear'
	| 'beforeStepChange'
>) {
	const currentStep = useSignal(defaultActiveStep);
	const totalSteps = useSignal(0);
	const isLoading = useSignal(false);
	const stepErrors = useSignal<Set<number>>(new Set());

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
		if (isLoading.value) return;

		if (linear && newStep > currentStep.value + 1) {
			return;
		}

		if (beforeStepChange) {
			const result = beforeStepChange(currentStep.value, newStep);

			if (result === false) return;

			if (result instanceof Promise) {
				isLoading.value = true;
				try {
					const allowed = await result;
					if (!allowed) return;
				} catch (e) {
					console.error('Step validation failed', e);
					return;
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
			if (!isLoading.value) onComplete?.();
		}
	};

	const back = () => {
		if (currentStep.value > 0) {
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
