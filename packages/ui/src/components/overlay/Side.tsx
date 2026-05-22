// #region Imports
import { useRef } from 'preact/hooks';
import { IconX } from '@tabler/icons-preact';
import { OverlayProps } from '../../types/components/overlay.ts';
import { OverlayPortal } from './OverlayPortal.tsx';
import { IconButton } from '../button/IconButton.tsx';
import { useOverlayA11y } from '../../hooks/useOverlayA11y.ts';
// #endregion

/**
 * @function Side
 * @description A vertical panel drawer (Side Panel) used for persistent filters, navigation, or deep-dive details.
 * Slides in from the left or right edge of the viewport.
 */
export function Side(props: OverlayProps) {
	const {
		isOpen,
		onClose,
		title,
		side = 'right',
		isSticky,
		children,
		className,
		style,
	} = props;

	const containerRef = useRef<HTMLDivElement>(null);

	// Apply Accessibility (Focus Trap & ESC to close)
	useOverlayA11y(containerRef, isOpen, onClose);

	return (
		<OverlayPortal isOpen={isOpen} onClose={onClose} isSticky={isSticky}>
			<div
				ref={containerRef}
				className={`overlay-side overlay-side--${side} ${className || ''}`}
				style={style}
				role='dialog'
				aria-modal='true'
				aria-labelledby={title ? 'side-title' : undefined}
				tabIndex={-1}
			>
				{/* Header */}
				{title && (
					<div className='overlay-side__header'>
						<h2 id='side-title' className='overlay-side__title'>
							{title}
						</h2>
						{onClose && (
							<IconButton
								variant='secondary'
								ghost
								rounded
								aria-label='Close panel'
								onClick={onClose}
							>
								<IconX size={20} />
							</IconButton>
						)}
					</div>
				)}

				{/* Body */}
				<div className='overlay-side__body'>
					{children}
				</div>
			</div>
		</OverlayPortal>
	);
}
