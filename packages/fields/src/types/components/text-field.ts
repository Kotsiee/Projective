import { AdornmentProps, ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

/**
 * TextField specific props.
 * Extends BaseFieldProps (via ValueFieldProps) and Wrapper Props.
 */
export interface TextFieldProps
	extends
		ValueFieldProps<string>,
		AdornmentProps,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search';
	multiline?: boolean;
	rows?: number;
	maxRows?: number;
	autoComplete?: string;
	pattern?: string;
	/** Minimum value (for type="number" or "date" etc.) */
	min?: number | string;
	/** Maximum value (for type="number" or "date" etc.) */
	max?: number | string;
	/** Minimum character length */
	minLength?: number;
	/** Maximum character length */
	maxLength?: number;
	showCount?: boolean;
	onInput?: (e: any) => void;
	onBlur?: (e: any) => void;
	onFocus?: (e: any) => void;
}
