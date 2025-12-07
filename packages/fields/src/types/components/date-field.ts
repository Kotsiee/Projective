import { ComponentChildren } from 'preact';
import { AdornmentProps, ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';
import { DateTime } from '@projective/types';

export type DateSelectionMode = 'single' | 'multiple' | 'range';
export type DateFieldVariant = 'popup' | 'inline' | 'input';

// The value type changes based on mode
export type SingleDateValue = DateTime | null;
export type MultipleDateValue = DateTime[];
export type RangeDateValue = [DateTime | null, DateTime | null];

export type DateValue = SingleDateValue | MultipleDateValue | RangeDateValue;

/**
 * Modifiers allow external logic to style specific dates.
 * e.g. { disabled: (d) => d.isWeekend(), highlighted: (d) => d.day === 1 }
 */
export type DateModifiers = {
	disabled?: (date: DateTime) => boolean;
	highlighted?: (date: DateTime) => boolean;
	hidden?: (date: DateTime) => boolean;
	[key: string]: ((date: DateTime) => boolean) | undefined;
};

export interface DateFieldProps extends
	// We override ValueFieldProps because 'value' is dynamic here
	Omit<ValueFieldProps<any>, 'value' | 'onChange'>,
	AdornmentProps,
	Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
	Omit<MessageWrapperProps, 'error' | 'hint'> {
	value?: DateValue;
	onChange?: (value: any) => void; // Typed loosely here, narrowed in component

	/**
	 * How the component behaves.
	 * - popup: Standard input with dropdown (Default)
	 * - inline: Calendar rendered directly in page
	 * - input: Text input only (validation only)
	 */
	variant?: DateFieldVariant;

	/**
	 * Selection logic.
	 * - single: One date
	 * - multiple: Array of dates
	 * - range: [Start, End]
	 */
	selectionMode?: DateSelectionMode;

	/**
	 * External logic to style/disable dates.
	 * Use this for "Every Monday" or "Blocked Dates" logic.
	 */
	modifiers?: DateModifiers;

	minDate?: DateTime;
	maxDate?: DateTime;
	format?: string;
}
