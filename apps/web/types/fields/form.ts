import { VNode } from 'preact';

// deno-lint-ignore no-explicit-any
export interface BaseFieldProps<T = any> {
	// Core Binding
	name: string;
	value?: T;
	onChange?: (value: T) => void;

	// Identifiers
	id?: string;
	label?: string;

	// State
	disabled?: boolean;
	required?: boolean;
	readonly?: boolean;

	// Validation
	error?: string;
	success?: boolean;

	// Visuals
	placeholder?: string;
	hint?: string; // Bottom helper text (neutral)
	helperText?: string; // Bottom helper text (can be semantic)
	className?: string;

	// Layout
	floatingLabel?: boolean;

	// Slots (Generic icons for consistency)
	iconLeft?: VNode;
	iconRight?: VNode;
}
