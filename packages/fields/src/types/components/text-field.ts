// deno-lint-ignore-file no-explicit-any
import { HTMLAttributes } from 'preact';
import { AdornmentProps, ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

export interface TextFieldProps
	extends
		ValueFieldProps<string>,
		AdornmentProps,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search';
	/**
	 * Visual variant. `glass` applies the frosted aurora-glass styling used by the
	 * auth flow (taller control, softer fill, focus glow) and is self-contained —
	 * no ancestor scope required. Defaults to `default`.
	 */
	variant?: 'default' | 'glass';
	multiline?: boolean;
	rows?: number;
	maxRows?: number;
	autoComplete?: string;
	pattern?: string;
	min?: number | string;
	max?: number | string;
	minLength?: number;
	maxLength?: number;
	showCount?: boolean;
	prefixProps?: HTMLAttributes<HTMLDivElement>;
	suffixProps?: HTMLAttributes<HTMLDivElement>;
	onInput?: (e: any) => void;
	onBlur?: (e: any) => void;
	onFocus?: (e: any) => void;
}
