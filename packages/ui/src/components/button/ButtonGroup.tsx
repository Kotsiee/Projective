/* #region Imports */
import { cloneElement, toChildArray, VNode } from 'preact';
import { ButtonGroupProps } from '../../types/components/button.ts';
/* #endregion */

export function ButtonGroup(props: ButtonGroupProps) {
	const {
		children,
		variant,
		size = 'medium',
		orientation = 'horizontal',
		fullWidth = false,
		disabled = false, // New Prop
		className,
		style,
	} = props;

	const classes = [
		'btn-group',
		`btn-group--${orientation}`,
		fullWidth && 'btn-group--full-width',
		className,
	]
		.filter(Boolean)
		.join(' ');

	// Clone children to enforce group props
	const processedChildren = toChildArray(children).map((child) => {
		if (typeof child !== 'object' || child === null) return child;

		// deno-lint-ignore no-explicit-any
		const vnode = child as VNode<any>;

		return cloneElement(vnode, {
			variant: variant || vnode.props.variant,
			size: size || vnode.props.size,
			fullWidth: fullWidth ? true : vnode.props.fullWidth,

			// Group disabled overrides child, OR child can be disabled individually
			disabled: disabled || vnode.props.disabled,
		});
	});

	return (
		<div className={classes} style={style} role='group'>
			{processedChildren}
		</div>
	);
}
