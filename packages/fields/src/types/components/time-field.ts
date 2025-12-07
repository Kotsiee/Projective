import { DateTime } from '@projective/types';
import { AdornmentProps, ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

export type TimeSelectionMode = 'single' | 'multiple';
export type TimeValue = DateTime | DateTime[];

/**
 * TimeField specific props.
 */
export interface TimeFieldProps extends
	// Override generic ValueFieldProps to support arrays
	Omit<ValueFieldProps<any>, 'value' | 'onChange'>,
	AdornmentProps,
	Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
	Omit<MessageWrapperProps, 'error' | 'hint'> {
	value?: TimeValue;
	onChange?: (value: TimeValue) => void;

	/**
	 * Visual variant
	 * @default 'popup'
	 */
	variant?: 'popup' | 'inline' | 'input';

	/**
	 * Selection mode
	 * @default 'single'
	 */
	selectionMode?: TimeSelectionMode;
}
