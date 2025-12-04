import { VNode } from 'preact';

export interface SelectOption {
	label: string;
	value: string | number;
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

export interface SelectFieldConfig {
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
	renderOption?: (option: SelectOption) => VNode;
	renderSelection?: (selected: SelectOption[]) => VNode;
}
