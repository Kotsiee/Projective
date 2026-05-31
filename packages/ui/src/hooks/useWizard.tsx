import { useSignal } from '@preact/signals';
import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import {
	WizardConfig,
	WizardContextValue,
	WizardProviderProps,
} from '../types/components/wizard.ts';

/**
 * The Wizard Context serves as the headless state machine.
 */
const WizardContext = createContext<WizardContextValue | null>(null);

export function useWizardContext() {
	const ctx = useContext(WizardContext);
	if (!ctx) throw new Error('useWizardContext must be used within a <WizardProvider>');
	return ctx;
}

/**
 * Initializes the wizard engine. Used internally by the WizardProvider.
 */
export function useWizardEngine(
	{ defaultStep = 1, totalSteps, linear = true }: WizardConfig,
): WizardContextValue {
	const currentStep = useSignal(defaultStep);
	const previousStep = useSignal(defaultStep);
	const totalStepsSignal = useSignal(totalSteps);
	const isNextDisabled = useSignal(false);

	const changeStep = (newStep: number) => {
		if (newStep < 1 || newStep > totalStepsSignal.value) return;
		if (linear && newStep > currentStep.value + 1) return;

		previousStep.value = currentStep.value;
		currentStep.value = newStep;
	};

	const next = () => {
		if (!isNextDisabled.value) changeStep(currentStep.value + 1);
	};

	const back = () => changeStep(currentStep.value - 1);
	const goTo = (step: number) => changeStep(step);
	const setNextDisabled = (disabled: boolean) => (isNextDisabled.value = disabled);

	return {
		currentStep,
		previousStep,
		totalSteps: totalStepsSignal,
		isNextDisabled,
		next,
		back,
		goTo,
		setNextDisabled,
	};
}

/**
 * Headless Provider component to wrap around disjointed UI panes.
 */
export function WizardProvider({ children, ...config }: WizardProviderProps) {
	const engine = useWizardEngine(config);

	return (
		<WizardContext.Provider value={engine}>
			{children}
		</WizardContext.Provider>
	);
}
