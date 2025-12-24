import { VNode } from 'preact';

export interface SelectOption<T> {
	label: string;
	value: string | T | number;
	icon?: VNode;
	avatarUrl?: string;
	group?: string;
	disabled?: boolean;
}

export interface SelectIcons {
	arrow?: VNode;
	arrowOpen?: VNode;
	clear?: VNode;
	loading?: VNode;
	valid?: VNode;
	invalid?: VNode;
}

export interface SelectFieldConfig<T> {
	multiple?: boolean;
	clearable?: boolean;
	searchable?: boolean;
	placeholder?: string;
	loading?: boolean; // Async loading state

	// UX Features
	enableSelectAll?: boolean;
	displayMode?: 'chips-inside' | 'chips-below' | 'count' | 'comma';

	// Customization
	icons?: SelectIcons;

	// Optional Renderers
	renderOption?: (option: SelectOption<T>) => VNode;
	renderSelection?: (selected: SelectOption<T>[]) => VNode;
}
