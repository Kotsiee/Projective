import { useEffect } from 'preact/hooks';

// #region State
// Global counter to handle multiple nested overlays preventing premature unlocking.
let lockCount = 0;
// #endregion

// #region Hook
/**
 * @function useScrollLock
 * @description A global utility hook that toggles `overflow: hidden` on the document body.
 * Prevents the background page from scrolling while an overlay is active.
 * * @param {boolean} lock - Whether the scroll should be locked.
 */
export function useScrollLock(lock: boolean) {
	useEffect(() => {
		// Prevent execution during Server-Side Rendering (SSR)
		if (!lock || typeof document === 'undefined') return;

		lockCount++;
		if (lockCount === 1) {
			document.body.style.overflow = 'hidden';
		}

		return () => {
			lockCount--;
			if (lockCount === 0) {
				document.body.style.overflow = '';
			}
		};
	}, [lock]);
}
// #endregion
