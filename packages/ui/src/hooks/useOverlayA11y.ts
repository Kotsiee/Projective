import { RefObject } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

/**
 * @function useOverlayA11y
 * @description Manages accessibility requirements for overlays:
 * 1. Traps Tab focus within the container.
 * 2. Listens for the Escape key to close the overlay.
 * 3. Restores focus to the triggering element upon closing.
 */
export function useOverlayA11y(
	containerRef: RefObject<HTMLElement>,
	isOpen: boolean,
	onClose?: () => void,
) {
	const previousFocusRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		if (!isOpen || typeof document === 'undefined') return;

		// 1. Store the currently focused element to restore it later
		previousFocusRef.current = document.activeElement as HTMLElement;

		// 2. Focus Trap Logic
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!containerRef.current) return;

			// Handle ESC
			if (e.key === 'Escape') {
				e.preventDefault();
				e.stopPropagation();
				if (onClose) onClose();
				return;
			}

			// Handle Focus Trapping (Tab)
			if (e.key === 'Tab') {
				const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
					'a[href], button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
				);

				const firstElement = focusableElements[0];
				const lastElement = focusableElements[focusableElements.length - 1];

				// If there are no focusable elements, prevent tabbing away
				if (!firstElement) {
					e.preventDefault();
					return;
				}

				if (e.shiftKey) {
					// Shift + Tab
					if (
						document.activeElement === firstElement ||
						document.activeElement === containerRef.current
					) {
						e.preventDefault();
						lastElement.focus();
					}
				} else {
					// Tab
					if (document.activeElement === lastElement) {
						e.preventDefault();
						firstElement.focus();
					}
				}
			}
		};

		document.addEventListener('keydown', handleKeyDown);

		// 3. Auto-focus the container or first element when opened
		// Using a slight delay to ensure DOM is fully painted, especially for animated entry
		requestAnimationFrame(() => {
			if (containerRef.current) {
				containerRef.current.focus();
			}
		});

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			// 4. Restore focus on cleanup
			if (previousFocusRef.current) {
				previousFocusRef.current.focus();
			}
		};
	}, [isOpen, containerRef, onClose]);
}
