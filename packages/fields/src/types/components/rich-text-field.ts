import { JSX } from 'preact';
import { Signal } from '@preact/signals';
import { ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

export type RichTextFormat = 'delta' | 'html' | 'markdown';
export type RichTextVariant = 'framed' | 'inline';

export interface RichTextFieldProps
	extends
		ValueFieldProps<string>,
		Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
		Omit<MessageWrapperProps, 'error' | 'hint'> {
	outputFormat?: RichTextFormat;

	toolbar?: 'basic' | 'full' | any[];
	variant?: RichTextVariant;
	secureLinks?: boolean;

	onImageUpload?: (file: File) => Promise<string>;

	placeholder?: string;
	readOnly?: boolean;

	/** Minimum height of the editor area (e.g. "150px") */
	minHeight?: string | number;

	/** Maximum height before scrolling occurs (e.g. "300px") */
	maxHeight?: string | number;

	/** Soft limit for character count. Shows red counter if exceeded. */
	maxLength?: number;

	/** Whether to show the character counter */
	showCount?: boolean;
}
