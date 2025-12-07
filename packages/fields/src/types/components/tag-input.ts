import { ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

/**
 * TagInput specific props.
 */
export interface TagInputProps
	extends
		ValueFieldProps<string[]>,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	// Tag specific props can be added here
}
