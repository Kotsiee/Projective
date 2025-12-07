import { Signal } from '@preact/signals';
import { JSX } from 'preact';

/**
 * Props for the LabelWrapper component.
 */
export interface LabelWrapperProps {
	id?: string;
	label?: string;
	required?: boolean;
	floating?: boolean;
	active?: boolean | Signal<boolean>;
	error?: boolean | Signal<boolean>;
	disabled?: boolean | Signal<boolean>;
	className?: string;
	/** Inline styles for precise control */
	style?: JSX.CSSProperties;
	/**
	 * Position of the label relative to the field.
	 * @default "top"
	 */
	position?: 'top' | 'left' | 'right' | 'bottom';
	/**
	 * Floating behavior rules.
	 * - auto: Floats when focused or has value (default)
	 * - always: Always floating (static top)
	 * - never: Never floats (placeholder style)
	 */
	floatingRule?: 'auto' | 'always' | 'never';
	/**
	 * Origin point for floating animation.
	 * - top-left: Standard Material (default)
	 * - center: Starts as placeholder, moves up
	 */
	floatingOrigin?: 'top-left' | 'center';
	/**
	 * If true, adjusts start position for textareas (top aligned vs center aligned)
	 */
	multiline?: boolean;
}

/**
 * Props for the AdornmentWrapper component.
 */
export interface AdornmentWrapperProps {
	children?: JSX.Element | string;
	position?: 'prefix' | 'suffix';
	onClick?: (e: MouseEvent) => void;
	className?: string;
}

/**
 * Props for the MessageWrapper component.
 */
export interface MessageWrapperProps {
	error?: string | Signal<string | undefined>;
	warning?: string | Signal<string | undefined>;
	info?: string | Signal<string | undefined>;
	hint?: string;
}

/**
 * Props for the SkeletonWrapper component.
 */
export interface SkeletonWrapperProps {
	loading?: boolean | Signal<boolean>;
	variant?: 'rect' | 'circle' | 'pill';
	width?: string | number;
	height?: string | number;
	className?: string;
}

/**
 * Props for the EffectWrapper component.
 */
export interface EffectWrapperProps {
	focused?: boolean | Signal<boolean>;
	disabled?: boolean | Signal<boolean>;
	children?: JSX.Element | JSX.Element[];
}

/**
 * Props for the FieldArrayWrapper component.
 */
export interface FieldArrayWrapperProps<T> {
	items: T[] | Signal<T[]>;
	onAdd?: () => void;
	onRemove?: (index: number) => void;
	renderItem: (item: T, index: number) => JSX.Element;
	renderAddButton?: (onClick: () => void) => JSX.Element;
	renderRemoveButton?: (onClick: () => void) => JSX.Element;
	className?: string;
	maxItems?: number;
}
