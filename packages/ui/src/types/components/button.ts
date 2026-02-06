import { ComponentChildren, CSSProperties, JSX } from 'preact';
import { Signal } from '@preact/signals';

// #region 1. Definitions
export type ButtonVariant =
	| 'primary'
	| 'secondary'
	| 'success'
	| 'warning'
	| 'danger'
	| 'info'
	| 'link';

export type ButtonSize = 'small' | 'medium' | 'large';

export type ButtonType = 'button' | 'submit' | 'reset';
// #endregion

// #region 2. Base Button Props
/**
 * Props for the Button component.
 * Supports polymorphism: renders <a> if href is provided, otherwise <button>.
 */
export interface ButtonProps {
	children?: ComponentChildren;

	/**
	 * Visual style variant.
	 * @default 'primary'
	 */
	variant?: ButtonVariant;

	/**
	 * Size of the button.
	 * @default 'medium'
	 */
	size?: ButtonSize;

	/**
	 * If true, shows a loading spinner and prevents interaction.
	 */
	loading?: boolean | Signal<boolean>;

	/**
	 * If true, prevents interaction.
	 */
	disabled?: boolean | Signal<boolean>;

	/**
	 * If true, the button expands to fill its container.
	 */
	fullWidth?: boolean;

	/**
	 * Modifier: Removes background until hover.
	 */
	ghost?: boolean;

	/**
	 * Modifier: Applies pill-shaped border radius.
	 */
	rounded?: boolean;

	/**
	 * Modifier: Applies an outline style (transparent bg, colored border).
	 */
	outlined?: boolean;

	/**
	 * Content to render as a badge.
	 */
	badge?: ComponentChildren;

	startIcon?: JSX.Element;
	endIcon?: JSX.Element;
	id?: string;
	className?: string;
	style?: CSSProperties;

	// #region Polymorphic Props
	href?: string;
	target?: string;
	rel?: string;
	download?: string | boolean;
	htmlType?: ButtonType;
	onClick?: (e: MouseEvent) => void;
	// #endregion
}
// #endregion

// #region 3. Icon Button Props
export interface IconButtonProps
	extends Omit<ButtonProps, 'startIcon' | 'endIcon' | 'fullWidth' | 'children'> {
	children: JSX.Element;
	rounded?: boolean;
	'aria-label': string;
}
// #endregion

// #region 4. Button Group Props
export interface ButtonGroupProps {
	children: ComponentChildren;

	variant?: ButtonVariant;
	size?: ButtonSize;
	orientation?: 'horizontal' | 'vertical';
	fullWidth?: boolean;

	/**
	 * If true, disables all buttons within the group.
	 */
	disabled?: boolean;

	className?: string;
	style?: CSSProperties;
}
// #endregion

// #region 5. Split Button Props
export interface SplitButtonProps extends Omit<ButtonProps, 'onClick'> {
	onClick?: (e: MouseEvent) => void;
	menu: ComponentChildren;
	menuPosition?: 'bottom-left' | 'bottom-right';
}
// #endregion

// #region 6. Toggle Button Props
export interface ToggleButtonProps extends Omit<ButtonProps, 'onClick'> {
	value: string | number;
	selected?: boolean;
	onChange?: (selected: boolean, value: string | number) => void;
	onClick?: (e: MouseEvent) => void;
}
// #endregion

// #region 7. Toggle Button Group Props
export interface ToggleButtonGroupProps {
	children: ComponentChildren;
	value?: string | number | (string | number)[] | Signal<string | number | (string | number)[]>;
	onChange?: (value: any) => void;
	multiple?: boolean;
	optional?: boolean;
	variant?: ButtonVariant;
	size?: ButtonSize;
	orientation?: 'horizontal' | 'vertical';
	fullWidth?: boolean;
	className?: string;
	style?: CSSProperties;
}
// #endregion

export interface ButtonBadgeProps {
	children: ComponentChildren;
	variant?: 'primary' | 'danger' | 'success' | 'warning' | 'neutral';
	className?: string;
}
