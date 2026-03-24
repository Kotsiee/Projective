import { useEffect, useLayoutEffect, useReducer, useRef, useState } from 'preact/hooks';
import { MasonryVirtualizer, type MasonryVirtualizerOptions } from '../core/masonry-virtualizer.ts';

// #region Interfaces
export interface UseMasonryVirtualOptions
	extends Omit<MasonryVirtualizerOptions, 'containerWidth'> {
	/** If true, attaches scroll listeners to the global window object instead of the parent container */
	useWindowScroll?: boolean;
}

export interface UseMasonryVirtualResult {
	/** Ref to attach to the scrollable parent container */
	parentRef: preact.RefObject<HTMLDivElement>;
	/** Ref to attach to the actual grid container (used to measure available width) */
	gridRef: preact.RefObject<HTMLDivElement>;
	/** The underlying virtualizer instance */
	virtualizer: MasonryVirtualizer;
	/** Function to get currently visible items based on scroll position */
	getItems: () => ReturnType<MasonryVirtualizer['getVirtualItems']>;
	/** Function to get the total calculated height of the masonry grid */
	getTotalSize: () => number;
	/** The current calculated width of the container */
	containerWidth: number;
}
// #endregion

// #region Hook Implementation
/**
 * React/Preact hook wrapper for the MasonryVirtualizer.
 * Handles DOM measuring, scroll event binding, and reactivity.
 */
export function useMasonryVirtual(options: UseMasonryVirtualOptions): UseMasonryVirtualResult {
	const [, forceUpdate] = useReducer((x) => x + 1, 0);
	const parentRef = useRef<HTMLDivElement>(null);
	const gridRef = useRef<HTMLDivElement>(null);

	const [containerWidth, setContainerWidth] = useState<number>(0);
	const virtualizerRef = useRef<MasonryVirtualizer | null>(null);

	if (!virtualizerRef.current) {
		virtualizerRef.current = new MasonryVirtualizer({
			...options,
			containerWidth: containerWidth || 1000, // Fallback until first measure
			onChange: () => forceUpdate(0),
		});
	}

	const virtualizer = virtualizerRef.current;

	// Update virtualizer config when options or containerWidth change
	useEffect(() => {
		virtualizer.setOptions({
			...options,
			containerWidth,
		});
		forceUpdate(0);
	}, [
		containerWidth,
		options.count,
		options.gap,
		options.columns,
		options.columnWidth,
		options.useWindowScroll,
	]);

	// Observe container width
	useLayoutEffect(() => {
		if (!gridRef.current || typeof ResizeObserver === 'undefined') return;

		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (entry) {
				const width = entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
				if (width > 0 && width !== containerWidth) {
					setContainerWidth(width);
				}
			}
		});

		observer.observe(gridRef.current);
		return () => observer.disconnect();
	}, [containerWidth]);

	// Bind Scroll Listeners
	useEffect(() => {
		const handleScroll = () => forceUpdate(0);

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

	const getItems = () => {
		if (containerWidth === 0) return []; // Wait for initial measurement

		let scrollTop = 0;
		let viewportHeight = 0;

		if (options.useWindowScroll) {
			scrollTop = globalThis.scrollY;
			viewportHeight = globalThis.innerHeight;

			if (gridRef.current) {
				const rect = gridRef.current.getBoundingClientRect();
				const absoluteTop = scrollTop + rect.top;
				scrollTop = Math.max(0, scrollTop - absoluteTop);
			}
		} else {
			const element = parentRef.current;
			scrollTop = element?.scrollTop ?? 0;
			viewportHeight = element?.clientHeight ?? 0;
		}

		return virtualizer.getVirtualItems(scrollTop, viewportHeight);
	};

	// Cleanup observers on unmount
	useEffect(() => {
		return () => virtualizer.cleanup();
	}, [virtualizer]);

	return {
		parentRef,
		gridRef,
		virtualizer,
		getItems,
		getTotalSize: () => virtualizer.getTotalSize(),
		containerWidth,
	};
}
// #endregion
