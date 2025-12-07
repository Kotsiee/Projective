import { AdornmentProps, ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';
import { DateTime } from '@projective/types';

/**
 * DateTimeField specific props.
 */
export interface DateTimeFieldProps
	extends
		ValueFieldProps<DateTime>,
		AdornmentProps,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	min?: DateTime;
	max?: DateTime;
	clearable?: boolean;
}
