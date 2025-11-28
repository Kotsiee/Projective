import { VNode } from 'preact';
import { BaseFieldProps } from './form.ts';

export type InputType =
	| 'text'
	| 'password'
	| 'email'
	| 'number'
	| 'search'
	| 'tel'
	| 'url';

export type InputMode =
	| 'text'
	| 'decimal'
	| 'numeric'
	| 'tel'
	| 'search'
	| 'email'
	| 'url';

export interface TextFieldProps extends BaseFieldProps<string | number> {
	type?: InputType;
	inputMode?: InputMode;

	// --- Variants & Presets ---
	// "default" is standard.
	// "currency" adds onBlur formatting.
	// "credit-card" adds masking + luhn validation.
	variant?: 'default' | 'currency' | 'credit-card' | 'percentage';

	// --- Masking ---
	mask?: string;

	multiline?: boolean;
	rows?: number;
	autoGrow?: boolean;

	maxLength?: number;
	showCount?: boolean;

	clearable?: boolean;
	showPasswordToggle?: boolean;

	prefix?: string | VNode;
	suffix?: string | VNode;

	onFocus?: (e: FocusEvent) => void;
	onBlur?: (e: FocusEvent) => void;
	onKeyDown?: (e: KeyboardEvent) => void;
}
