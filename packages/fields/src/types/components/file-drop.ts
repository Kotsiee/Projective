import { BaseFieldProps, ValueFieldProps } from '../core.ts';
import { Signal } from '@preact/signals';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

/**
 * FileDrop specific props.
 */
export interface FileDropProps
	extends
		ValueFieldProps<File[]>,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	accept?: string;
	multiple?: boolean;
	maxSize?: number;
	maxFiles?: number;
}
