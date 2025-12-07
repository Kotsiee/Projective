import { Signal } from '@preact/signals';
import { CSSProperties, JSX } from 'preact';

/**
 * Base properties shared by all form fields.
 */
export interface BaseFieldProps {
	id?: string;
	name?: string;
	label?: string;
	placeholder?: string;
	disabled?: boolean | Signal<boolean>;
	readonly?: boolean | Signal<boolean>;
	loading?: boolean | Signal<boolean>;
	required?: boolean;
	floating?: boolean;
	className?: string;
	style?: CSSProperties;
}

/**
 * Visual variants for fields.
 */
export type FieldVariant = 'outlined' | 'filled' | 'standard';

/**
 * Density/Size variants.
 */
export type FieldDensity = 'compact' | 'normal' | 'comfortable';

/**
 * Validation status.
 */
export type ValidationStatus =
	| 'success'
	| 'warning'
	| 'error'
	| 'info'
	| 'neutral';

/**
 * Generic interface for fields that hold a value.
 */
export interface ValueFieldProps<T> extends BaseFieldProps {
	value?: T | Signal<T>;
	defaultValue?: T;
	onChange?: (value: T) => void;
	error?: string | Signal<string | undefined>;
	hint?: string;
}

/**
 * Interface for fields that support adornments (icons/text).
 */
export interface AdornmentProps {
	prefix?: JSX.Element | string;
	suffix?: JSX.Element | string;
	onPrefixClick?: (e: MouseEvent) => void;
	onSuffixClick?: (e: MouseEvent) => void;
}
