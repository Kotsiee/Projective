/* #region Imports */
import { IconButtonProps } from '../../types/components/button.ts';
import { Button } from './Button.tsx';
/* #endregion */

/**
 * @function IconButton
 * @description A wrapper around Button tailored for single icon usage.
 * Automatically enforces square aspect ratio and handles rounding.
 */
export function IconButton(props: IconButtonProps) {
	const {
		children,
		className,
		variant = 'secondary',
		ghost = true,
		size = 'medium',
		rounded = false,
		'aria-label': ariaLabel,
		...rest
	} = props;

	const classes = [
		'btn--icon-only',
		rounded && 'btn--rounded',
		className,
	]
		.filter(Boolean)
		.join(' ');

	return (
		<Button
			variant={variant}
			ghost={ghost}
			size={size}
			className={classes}
			{...rest}
			{...{ 'aria-label': ariaLabel }}
		>
			{children}
		</Button>
	);
}
