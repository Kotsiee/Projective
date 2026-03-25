/* #region Imports */

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
		optional = true,
		variant = 'outline',
		size = 'medium',
		orientation = 'horizontal',
		fullWidth = false,
		className,
		style,
	} = props;

	const currentValue = value instanceof Signal ? value.value : value;

	const handleChildChange = (selected: boolean, childValue: string | number) => {
		if (!onChange) return;

		let newValue: any;

		if (multiple) {
			const currentArray = Array.isArray(currentValue) ? [...currentValue] : [];

			if (selected) {
				if (!currentArray.includes(childValue)) {
					newValue = [...currentArray, childValue];
				} else {
					newValue = currentArray;
				}
			} else {
				newValue = currentArray.filter((v) => v !== childValue);

				if (!optional && newValue.length === 0) return;
			}
		} else {
			if (selected) {
				newValue = childValue;
			} else {
				if (!optional) return;
				newValue = null;
			}
		}

		if (value instanceof Signal) {
			value.value = newValue;
		}
		onChange(newValue);
	};

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

			variant: vnode.props.variant || variant,
			size: vnode.props.size || size,
		});
	});

	return (
		<ButtonGroup
			variant={variant as any}
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
