import { Signal } from '@preact/signals';
import { ComponentChildren } from 'preact';

export interface WizardConfig {
	defaultStep?: number;
	totalSteps: number;
	linear?: boolean;
}

export interface WizardContextValue {
	currentStep: Signal<number>;
	previousStep: Signal<number>;
	totalSteps: Signal<number>;
	isNextDisabled: Signal<boolean>;
	next: () => void;
	back: () => void;
	goTo: (step: number) => void;
	setNextDisabled: (disabled: boolean) => void;
}

export interface WizardProviderProps extends WizardConfig {
	children: ComponentChildren;
}
