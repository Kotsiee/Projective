import { ComponentChildren, JSX } from 'preact';
import { Signal } from '@preact/signals';

export type StepperOrientation = 'horizontal' | 'vertical';
export type StepStatus = 'pending' | 'active' | 'completed' | 'error' | 'disabled';
export type StepperVariant = 'circle' | 'dot';

export interface StepperProps {
	children: ComponentChildren;
	activeStep?: number;
	defaultActiveStep?: number;
	orientation?: StepperOrientation;
	linear?: boolean;

	/**
	 * Visual style of the step indicators.
	 * @default 'circle'
	 */
	variant?: StepperVariant;

	/**
	 * If set, the stepper will switch to vertical layout when
	 * container width is below this pixel value.
	 * Pass `true` for default (600px).
	 */
	responsive?: boolean | number;

	beforeStepChange?: (nextStep: number, currentStep: number) => boolean | Promise<boolean>;
	onStepChange?: (step: number) => void;
	onComplete?: () => void;
	keepMounted?: boolean;

	className?: string;
	style?: JSX.CSSProperties;
}

export interface StepProps {
	id?: string;
	label: string;
	description?: string;
	icon?: ComponentChildren;
	status?: StepStatus;
	optional?: boolean;
	disabled?: boolean;
	error?: boolean;
	className?: string;
	style?: JSX.CSSProperties;
	index?: number;
	isLast?: boolean;
}

export interface StepperPanelProps {
	children: ComponentChildren;
	index?: number;
	className?: string;
	style?: JSX.CSSProperties;
}

export interface StepperContextValue {
	activeStep: Signal<number>;
	orientation: StepperOrientation; // Effectively active orientation
	variant: StepperVariant;
	linear: boolean;
	keepMounted: boolean;

	next: () => void;
	back: () => void;
	goTo: (step: number) => void;

	totalSteps: Signal<number>;
	setTotalSteps: (count: number) => void;

	isLoading: Signal<boolean>;
	stepErrors: Signal<Set<number>>;
	setStepError: (stepIndex: number, hasError: boolean) => void;
}
