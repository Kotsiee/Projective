// #region Imports
import { createPortal } from 'preact/compat';
import { useScrollLock } from '../../hooks/useScrollLock.ts';
import { OverlayPortalProps } from '../../types/components/overlay.ts';
import '../../styles/components/overlay.css';
// #endregion

/**
 * @function OverlayPortal
 * @description The base structural wrapper for all overlays.
 * Manages the z-index layering, semi-transparent backdrop, and scroll locking.
 */
export function OverlayPortal({
	isOpen,
	onClose,
	isSticky = false,
	children,
	className,
}: OverlayPortalProps) {
	// 1. Enforce Scroll Lock when active
	useScrollLock(isOpen);

	// 2. Do not render if closed or executing on the server (SSR)
	if (!isOpen || typeof document === 'undefined') return null;

	// 3. Handlers
	const handleBackdropClick = (e: MouseEvent) => {
		// Only close if the actual backdrop was clicked, not the children
		if (!isSticky && onClose && e.target === e.currentTarget) {
			onClose();
		}
	};

	// 4. Render into Body
	return createPortal(
		<div
			className={`overlay-backdrop ${className || ''}`}
			onClick={handleBackdropClick}
			role='presentation'
		>
			{children}
		</div>,
		document.body,
	);
}
