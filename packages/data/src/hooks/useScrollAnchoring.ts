import { useEffect, useLayoutEffect, useRef } from 'preact/hooks';

/**
 * Maintains the user's scroll position relative to the bottom of the content.
 */
export function useScrollAnchoring(
	ref: preact.RefObject<HTMLElement | null>,
	isWindowMode: boolean,
	deps: any[] = [],
) {
	const prevScrollHeight = useRef(0);
	const prevScrollTop = useRef(0);
	const wasAtBottom = useRef(true);

	useLayoutEffect(() => {
		const el = isWindowMode ? document.scrollingElement : ref.current;
		if (!el) return;

		const currentScrollHeight = el.scrollHeight;
		// @ts-ignore - fallback to innerHeight
		const clientHeight = isWindowMode
			? (globalThis.visualViewport?.height ?? globalThis.innerHeight)
			: el.clientHeight;
		const currentScrollTop = isWindowMode ? globalThis.scrollY : el.scrollTop;

		const heightDelta = currentScrollHeight - prevScrollHeight.current;

		if (heightDelta !== 0 && prevScrollHeight.current > 0) {
			// CASE 1: STRICT BOTTOM LOCK
			// If we were at the bottom previously, we MUST stay at the bottom,
			// regardless of whether content grew or shrank.
			if (wasAtBottom.current) {
				if (isWindowMode) {
					globalThis.scrollTo({ top: currentScrollHeight, behavior: 'instant' });
				} else if (el instanceof HTMLElement) {
					el.scrollTop = currentScrollHeight;
				}
			} // CASE 2: RELATIVE ADJUSTMENT (History Load)
			// We weren't at the bottom, so we are likely reading history.
			// Adjust position by the delta to prevent visual jumping.
			else {
				if (isWindowMode) {
					globalThis.scrollBy({ top: heightDelta, behavior: 'instant' });
				} else if (el instanceof HTMLElement) {
					el.scrollTop += heightDelta;
				}
			}
		}

		// Snapshot
		prevScrollHeight.current = currentScrollHeight;
		prevScrollTop.current = isWindowMode ? globalThis.scrollY : el.scrollTop;

		// Re-calculate "Am I at the bottom?" for the NEXT run
		// We use a looser threshold (100px) to make it "sticky"
		const dist = currentScrollHeight - (prevScrollTop.current + clientHeight);
		wasAtBottom.current = dist < 100;
	}, [...deps, isWindowMode]);

	// Listen to real-time scrolling
	useEffect(() => {
		const handleScroll = () => {
			const el = isWindowMode ? document.scrollingElement : ref.current;
			if (!el) return;

			const scrollH = el.scrollHeight;
			const scrollT = isWindowMode ? globalThis.scrollY : el.scrollTop;
			// @ts-ignore
			const clientH = isWindowMode
				? (globalThis.visualViewport?.height ?? globalThis.innerHeight)
				: el.clientHeight;

			wasAtBottom.current = (scrollH - (scrollT + clientH)) < 100;
		};

		const target = isWindowMode ? globalThis : ref.current;
		target?.addEventListener('scroll', handleScroll, { passive: true });
		return () => target?.removeEventListener('scroll', handleScroll);
	}, [isWindowMode]);
}
