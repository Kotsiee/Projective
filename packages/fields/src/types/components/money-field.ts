import { ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

/**
 * MoneyField specific props.
 */
export interface MoneyFieldProps
	extends
		ValueFieldProps<number>,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	currency?: string;
	locale?: string;
}
