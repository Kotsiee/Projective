// #region Imports
import { useRef } from 'preact/hooks';
import { IconX } from '@tabler/icons-preact';
import { OverlayProps } from '../../types/components/overlay.ts';
import { OverlayPortal } from './OverlayPortal.tsx';
import { IconButton } from '../button/IconButton.tsx';
import { useOverlayA11y } from '../../hooks/useOverlayA11y.ts';
// #endregion

/**
 * @function Modal
 * @description A centered dialog box intended for focused tasks.
 * Renders inside the OverlayPortal to manage z-index and background scroll.
 */
export function Modal(props: OverlayProps) {
	const {
		isOpen,
		onClose,
		title,
		width,
		height,
		fullScreen = false,
		isSticky,
		children,
		className,
		style,
	} = props;

	const containerRef = useRef<HTMLDivElement>(null);

	// Apply Accessibility (Focus Trap & ESC to close)
	useOverlayA11y(containerRef, isOpen, onClose);

	// #region Dimensional Formatting
	const parseDimension = (val?: string | number) => typeof val === 'number' ? `${val}px` : val;

	const dynamicStyles = {
		...(width ? { width: parseDimension(width), maxWidth: '100vw' } : {}),
		...(height ? { height: parseDimension(height), maxHeight: '100vh' } : {}),
		...(fullScreen
			? {
				width: '100vw',
				height: '100vh',
				maxWidth: '100vw',
				maxHeight: '100vh',
				margin: 0,
				borderRadius: 0,
			}
			: {}),
		...style,
	};

	const classes = [
		'overlay-modal',
		fullScreen && 'overlay-modal--fullscreen',
		className,
	].filter(Boolean).join(' ');
	// #endregion

	return (
		<OverlayPortal isOpen={isOpen} onClose={onClose} isSticky={isSticky}>
			<div
				ref={containerRef}
				className={classes}
				style={dynamicStyles}
				role='dialog'
				aria-modal='true'
				aria-labelledby={title ? 'modal-title' : undefined}
				tabIndex={-1} // Makes the container itself focusable for initial focus routing
			>
				{/* Header */}
				{title && (
					<div className='overlay-modal__header'>
						<h2 id='modal-title' className='overlay-modal__title'>
							{title}
						</h2>
						{onClose && (
							<IconButton
								variant='secondary'
								ghost
								rounded
								aria-label='Close modal'
								onClick={onClose}
							>
								<IconX size={20} />
							</IconButton>
						)}
					</div>
				)}

				{/* Body */}
				<div className='overlay-modal__body'>
					{children}
				</div>
			</div>
		</OverlayPortal>
	);
}
