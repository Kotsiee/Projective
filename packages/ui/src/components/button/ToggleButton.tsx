/* #region Imports */
import { ToggleButtonProps } from '../../types/components/button.ts';
import { Button } from './Button.tsx';
/* #endregion */

/**
 * @function ToggleButton
 * @description A button that can be toggled on/off.
 * Can be used standalone or within a ToggleButtonGroup.
 */
export function ToggleButton(props: ToggleButtonProps) {
	const {
		value,
		selected = false,
		onChange,
		className,
		variant = 'outline',
		...rest
	} = props;

	const handleClick = (e: MouseEvent) => {
		// Toggle state logic
		onChange?.(!selected, value);
		rest.onClick?.(e);
	};

	const classes = [
		'btn-toggle',
		selected && 'btn-toggle--selected',
		className,
	]
		.filter(Boolean)
		.join(' ');

	return (
		<Button
			variant={variant}
			className={classes}
			aria-pressed={selected}
			onClick={handleClick}
			{...rest}
		/>
	);
}
