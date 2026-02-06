/* #region Imports */
import { useSignal } from '@preact/signals';
import { IconChevronDown } from '@tabler/icons-preact';

import { SplitButtonProps } from '../../types/components/button.ts';
import { Button } from './Button.tsx';
import { Popover } from '../Popover.tsx'; // Leveraging existing Popover
/* #endregion */

/**
 * @function SplitButton
 * @description A dual-action component: Left side triggers action, Right side opens menu.
 * Uses the Popover component for the dropdown.
 */
export function SplitButton(props: SplitButtonProps) {
	const {
		children,
		onClick,
		menu,
		menuPosition = 'bottom-right',
		variant = 'primary',
		size = 'medium',
		disabled,
		loading,
		className,
		style,
		...rest
	} = props;

	const isOpen = useSignal(false);

	// Shared logic for disabled/loading
	const isInteractive = !disabled && !loading;

	return (
		<div
			className={`btn-group btn-split ${className || ''}`}
			style={style}
			role='group'
			aria-label='Split button'
		>
			{/* 1. Main Action */}
			<Button
				variant={variant}
				size={size}
				disabled={disabled}
				loading={loading}
				onClick={onClick}
				className='btn-split__main'
				{...rest}
			>
				{children}
			</Button>

			{/* 2. Dropdown Trigger */}
			<Popover
				isOpen={isOpen.value}
				onClose={() => isOpen.value = false}
				position={menuPosition}
				trigger={
					<Button
						variant={variant}
						size={size}
						disabled={disabled}
						// Don't show loading on arrow if main is loading?
						// Usually entire control locks.
						className='btn-split__trigger'
						onClick={(e) => {
							e.stopPropagation();
							if (isInteractive) isOpen.value = !isOpen.value;
						}}
						aria-label='More options'
						aria-haspopup='true'
						aria-expanded={isOpen.value}
					>
						<IconChevronDown size={16} />
					</Button>
				}
				content={
					// Wrapper to close menu when an item is clicked

						<div onClick={() => isOpen.value = false}>
							{menu}
						</div>

				}
			/>
		</div>
	);
}
