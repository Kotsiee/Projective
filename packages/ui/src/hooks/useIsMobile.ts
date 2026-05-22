import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';

/**
 * @function useIsMobile
 * @description A signal-driven hook that tracks viewport width against a specific breakpoint.
 * Uses matchMedia for high-performance, native responsive detection.
 * * @param breakpoint The pixel width threshold (default: 768)
 * @returns A boolean indicating if the viewport is currently below the breakpoint.
 */
export function useIsMobile(breakpoint = 768): boolean {
	const isMobile = useSignal(false);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		// We check for max-width strictly less than the breakpoint
		const mql = globalThis.matchMedia(`(max-width: ${breakpoint - 1}px)`);

		// Initial set
		isMobile.value = mql.matches;

		// Listen for resizes
		const handler = (e: MediaQueryListEvent) => {
			isMobile.value = e.matches;
		};

		// Modern event listener API
		mql.addEventListener('change', handler);
		return () => mql.removeEventListener('change', handler);
	}, [breakpoint]);

	return isMobile.value;
}
