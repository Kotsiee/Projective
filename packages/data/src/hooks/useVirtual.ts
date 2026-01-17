import { useEffect, useReducer, useRef } from 'preact/hooks';
import { Virtualizer, type VirtualizerOptions } from '../core/virtualizer.ts';

interface UseVirtualOptions extends VirtualizerOptions {
	/**
	 * If true, attaches scroll listeners to the globalThis instead of the parent element.
	 * The virtualizer will calculate offsets relative to the viewport.
	 */
	useWindowScroll?: boolean;

	/**
	 * If true, scrolls to the bottom of the content on initial load.
	 */
	initialScrollToBottom?: boolean;
}

export function useVirtual(options: UseVirtualOptions) {
	const [, forceUpdate] = useReducer((x) => x + 1, 0);
	const parentRef = useRef<HTMLDivElement>(null);
	const virtualizerRef = useRef<Virtualizer | null>(null);
	const hasAutoScrolled = useRef(false);

	if (!virtualizerRef.current) {
		virtualizerRef.current = new Virtualizer(options);
	}

	const virtualizer = virtualizerRef.current;

	// Update options when they change
	useEffect(() => {
		virtualizer.setOptions(options);
		forceUpdate(0);
	}, [options.count, options.estimateSize, options.fixedItemHeight, options.useWindowScroll]);

	// --- Scroll Event Listeners ---
	useEffect(() => {
		const handleScroll = () => {
			forceUpdate(0);
		};

		if (options.useWindowScroll) {
			globalThis.addEventListener('scroll', handleScroll, { passive: true });
			globalThis.addEventListener('resize', handleScroll, { passive: true });

			return () => {
				globalThis.removeEventListener('scroll', handleScroll);
				globalThis.removeEventListener('resize', handleScroll);
			};
		} else {
			const element = parentRef.current;
			if (!element) return;

			element.addEventListener('scroll', handleScroll, { passive: true });
			return () => element.removeEventListener('scroll', handleScroll);
		}
	}, [options.useWindowScroll]);

	// --- Initial Scroll To Bottom Logic ---
	useEffect(() => {
		// Only run once when we have items
		if (options.initialScrollToBottom && !hasAutoScrolled.current && options.count > 0) {
			// We need a small tick to let the layout settle and height to be calculated
			requestAnimationFrame(() => {
				const totalSize = virtualizer.getTotalSize();

				if (options.useWindowScroll) {
					// For globalThis scroll, we scroll the body
					globalThis.scrollTo({
						top: document.body.scrollHeight,
						behavior: 'instant' as ScrollBehavior,
					});
				} else if (parentRef.current) {
					// For container scroll, we scroll the element
					parentRef.current.scrollTop = totalSize;
				}

				hasAutoScrolled.current = true;
			});
		}
	}, [options.count, options.initialScrollToBottom, options.useWindowScroll]);

	const getItems = () => {
		let scrollTop = 0;
		let viewportHeight = 0;
		let offsetAdjustment = 0;

		if (options.useWindowScroll) {
			scrollTop = globalThis.scrollY;
			viewportHeight = globalThis.innerHeight;

			// If the list isn't at the very top of the page, we need to adjust
			if (parentRef.current) {
				const rect = parentRef.current.getBoundingClientRect();
				const elementAbsoluteTop = scrollTop + rect.top;
				offsetAdjustment = elementAbsoluteTop;

				// Virtualizer thinks in 0-based offsets
				scrollTop = Math.max(0, scrollTop - offsetAdjustment);
			}
		} else {
			const element = parentRef.current;
			scrollTop = element?.scrollTop ?? 0;
			viewportHeight = element?.clientHeight ?? 0;
		}

		return virtualizer.getVirtualItems(scrollTop, viewportHeight);
	};

	return {
		parentRef,
		virtualizer,
		getItems,
		getTotalSize: () => virtualizer.getTotalSize(),
	};
}
