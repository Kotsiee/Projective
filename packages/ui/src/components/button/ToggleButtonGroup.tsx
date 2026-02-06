/* #region Imports */
// deno-lint-ignore-file no-explicit-any
import { cloneElement, toChildArray, VNode } from 'preact';
import { Signal } from '@preact/signals';
import { ToggleButtonGroupProps } from '../../types/components/button.ts';
import { ButtonGroup } from './ButtonGroup.tsx';
/* #endregion */

/**
 * @function ToggleButtonGroup
 * @description Manages selection state for a group of ToggleButtons.
 * Supports exclusive (radio) and multiple (checkbox) selection modes.
 */
export function ToggleButtonGroup(props: ToggleButtonGroupProps) {
	const {
		children,
		value,
		onChange,
		multiple = false,
		optional = true, // Default allow deselecting everything
		variant = 'outline',
		size = 'medium',
		orientation = 'horizontal',
		fullWidth = false,
		className,
		style,
	} = props;

	// Normalize value to simple type
	const currentValue = value instanceof Signal ? value.value : value;

	const handleChildChange = (selected: boolean, childValue: string | number) => {
		if (!onChange) return;

		let newValue: any;

		if (multiple) {
			// Array Logic
			const currentArray = Array.isArray(currentValue) ? [...currentValue] : [];

			if (selected) {
				// Add
				if (!currentArray.includes(childValue)) {
					newValue = [...currentArray, childValue];
				} else {
					newValue = currentArray;
				}
			} else {
				// Remove
				newValue = currentArray.filter((v) => v !== childValue);
				// If not optional, prevent removing last item?
				// Usually 'optional' constraint is for exclusive mode,
				// but for multiple, empty array is usually valid unless strictly enforced.
				if (!optional && newValue.length === 0) return;
			}
		} else {
			// Exclusive Logic
			if (selected) {
				// Selecting a new one
				newValue = childValue;
			} else {
				// Deselecting the current one
				if (!optional) return; // Cannot deselect if not optional
				newValue = null; // Or undefined
			}
		}

		if (value instanceof Signal) {
			value.value = newValue;
		}
		onChange(newValue);
	};

	// Process children to inject selected state and handler
	const processedChildren = toChildArray(children).map((child) => {
		if (typeof child !== 'object' || child === null) return child;
		const vnode = child as VNode<any>;

		const childValue = vnode.props.value;
		let isSelected = false;

		if (multiple) {
			isSelected = Array.isArray(currentValue) && currentValue.includes(childValue);
		} else {
			isSelected = currentValue === childValue;
		}

		return cloneElement(vnode, {
			selected: isSelected,
			onChange: handleChildChange,
			// Inherit visual props
			variant: vnode.props.variant || variant,
			size: vnode.props.size || size,
		});
	});

	return (
		<ButtonGroup
			variant={variant}
			size={size}
			orientation={orientation}
			fullWidth={fullWidth}
			className={className}
			style={style}
		>
			{processedChildren}
		</ButtonGroup>
	);
}
