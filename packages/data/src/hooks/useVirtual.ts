import { useEffect, useReducer, useRef } from 'preact/hooks';
import { Virtualizer, type VirtualizerOptions } from '../core/virtualizer.ts';

export function useVirtual(options: VirtualizerOptions) {
	// Force update reducer
	const [, forceUpdate] = useReducer((x) => x + 1, 0);

	// The scroll container element
	const parentRef = useRef<HTMLDivElement>(null);

	// Persist the engine instance
	const virtualizerRef = useRef<Virtualizer | null>(null);

	if (!virtualizerRef.current) {
		virtualizerRef.current = new Virtualizer(options);
	}

	const virtualizer = virtualizerRef.current;

	// Sync options if they change (e.g., data count changes)
	useEffect(() => {
		virtualizer.setOptions(options);
		forceUpdate(0);
	}, [options.count, options.estimateSize, options.fixedItemHeight]);

	// Bind scroll event
	useEffect(() => {
		const element = parentRef.current;
		if (!element) return;

		const handleScroll = () => {
			// We only care about scrollTop changes
			// The virtualizer calculates what is visible based on this
			forceUpdate(0);
		};

		element.addEventListener('scroll', handleScroll, { passive: true });
		return () => element.removeEventListener('scroll', handleScroll);
	}, []);

	return {
		parentRef,
		virtualizer,
		// Helper to get current slice based on DOM state
		getItems: () => {
			const element = parentRef.current;
			const scrollTop = element?.scrollTop ?? 0;
			const height = element?.clientHeight ?? 0;
			return virtualizer.getVirtualItems(scrollTop, height);
		},
		getTotalSize: () => virtualizer.getTotalSize(),
	};
}
