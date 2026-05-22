import { ComponentChildren } from 'preact';

export interface ModalLayoutProps {
	/** Usually a string or typography element */
	header?: ComponentChildren;

	/** Main scrollable content */
	children: ComponentChildren;

	/** Action buttons (e.g., Submit, Cancel) pinned to the bottom */
	footer?: ComponentChildren;

	className?: string;
}

/**
 * @function ModalLayout
 * @description Provides a rigid, standardized internal structure for Modals.
 * Ensures the header and footer stay pinned while the body scrolls.
 */
export function ModalLayout({ header, children, footer, className }: ModalLayoutProps) {
	return (
		<div
			className={`modal-layout-wrapper ${className || ''}`}
			style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 'inherit' }}
		>
			{header && (
				<div className='overlay-modal__header'>
					<div className='overlay-modal__title-wrapper'>
						{header}
					</div>
				</div>
			)}

			<div className='overlay-modal__body'>
				{children}
			</div>

			{footer && (
				<div className='overlay-modal__footer'>
					{footer}
				</div>
			)}
		</div>
	);
}
