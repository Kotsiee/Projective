import { JSX } from 'preact';
import { AdornmentProps, ValueFieldProps } from '../core.ts';
import { LabelWrapperProps, MessageWrapperProps } from '../wrappers.ts';

/**
 * Select option interface.
 */
export interface SelectOption<T = string> {
	label: string;
	value: T;
	disabled?: boolean;
	icon?: JSX.Element;
	avatarUrl?: string;
	/**
	 * Nested options for groups.
	 */
	options?: SelectOption<T>[];
	/**
	 * Legacy flat grouping (deprecated in favor of options nesting)
	 */
	group?: string;
}

export type SelectDisplayMode = 'chips-inside' | 'chips-below' | 'count' | 'text';

/**
 * SelectField specific props.
 */
export interface SelectFieldProps<T = string> extends
	// We allow T | T[] for value
	Omit<ValueFieldProps<T | T[]>, 'value' | 'onChange'>,
	AdornmentProps,
	Omit<LabelWrapperProps, 'id' | 'label' | 'error' | 'disabled' | 'className'>,
	Omit<MessageWrapperProps, 'error' | 'hint'> {
	// Value & Change override for generics
	value?: T | T[] | any;
	onChange?: (value: T | T[]) => void;

	options: SelectOption<T>[];
	multiple?: boolean;
	searchable?: boolean;
	clearable?: boolean;
	loading?: boolean;

	// Multi-select config
	displayMode?: SelectDisplayMode;
	enableSelectAll?: boolean;

	/**
	 * Defines behavior when a group option is clicked.
	 * - 'value': Selects the group's own value (treated as a selectable item).
	 * - 'members': Selects/Deselects all descendant leaf options (only valid if multiple=true).
	 * @default 'value'
	 */
	groupSelectMode?: 'value' | 'members';

	// Custom Icons
	icons?: {
		arrow?: JSX.Element;
		arrowOpen?: JSX.Element;
		check?: JSX.Element;
		remove?: JSX.Element;
		loading?: JSX.Element;
		invalid?: JSX.Element;
		valid?: JSX.Element;
	};
}
