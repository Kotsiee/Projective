import { ComponentChildren, CSSProperties } from 'preact';
import { Signal } from '@preact/signals';

export type AccordionType = 'single' | 'multiple';
export type AccordionVariant = 'outlined' | 'filled' | 'ghost';
export type AccordionDensity = 'compact' | 'normal' | 'spacious';

/**
 * Props for the Root Accordion Component
 */
export interface AccordionProps {
	children: ComponentChildren;
	type?: AccordionType;
	value?: string | string[];
	defaultValue?: string | string[];
	onValueChange?: (value: string | string[]) => void;
	collapsible?: boolean;
	disabled?: boolean | Signal<boolean>;

	/**
	 * Visual style variant.
	 * @default 'outlined'
	 */
	variant?: AccordionVariant;

	/**
	 * Vertical spacing density.
	 * @default 'normal'
	 */
	density?: AccordionDensity;

	className?: string;
	style?: CSSProperties;
}

export interface AccordionItemProps {
	value: string;
	children: ComponentChildren;
	disabled?: boolean | Signal<boolean>;
	className?: string;
	style?: CSSProperties;
}

/**
 * Props for the Accordion Trigger (Header)
 */
export interface AccordionTriggerProps {
	children: ComponentChildren;
	className?: string;
	style?: CSSProperties;

	/**
	 * Secondary text displayed below the main title.
	 */
	subtitle?: ComponentChildren;

	/**
	 * Icon displayed before the title.
	 */
	startIcon?: ComponentChildren;

	/**
	 * Interactive elements to display on the right side (e.g. Buttons).
	 * Events will not propagate to the accordion toggle.
	 */
	actions?: ComponentChildren;

	/**
	 * Custom icon to replace the default chevron. Pass null to hide.
	 */
	icon?: ComponentChildren;

	/**
	 * Whether to rotate the icon when expanded.
	 * @default true
	 */
	rotateIcon?: boolean;
}

/**
 * Props for the Accordion Content (Body)
 */
export interface AccordionContentProps {
	children: ComponentChildren;
	className?: string;
	style?: CSSProperties;

	/**
	 * If true, the content remains in the DOM when closed.
	 * @default true
	 */
	keepMounted?: boolean;
}

export interface AccordionContextValue {
	expandedValues: Signal<Set<string>>;
	toggle: (value: string) => void;
	expandAll: (values: string[]) => void; // New
	collapseAll: () => void; // New
	disabled: Signal<boolean>;
	collapsible: boolean;
	type: AccordionType;
	variant: AccordionVariant;
	density: AccordionDensity;
}

export interface AccordionItemContextValue {
	value: string;
	isOpen: Signal<boolean>;
	disabled: Signal<boolean>;
}
