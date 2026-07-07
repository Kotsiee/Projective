/**
 * @file useElementSize.ts
 * @description Observe an element's content box and report its pixel size reactively. SSR-safe
 * (no ResizeObserver on the server → stays at 0×0 until hydration). Used by the responsive
 * Canvas/SVG chart layers so they can rescale D3 domains to the live container width.
 */

import { useEffect, useRef, useState } from 'preact/hooks';
import type { RefObject } from 'preact';

export interface ElementSize {
	width: number;
	height: number;
}

export function useElementSize<T extends HTMLElement>(): {
	ref: RefObject<T>;
	size: ElementSize;
} {
	const ref = useRef<T>(null);
	const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

	useEffect(() => {
		const el = ref.current;
		if (!el || typeof ResizeObserver === 'undefined') return;

		const ro = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const cr = entry.contentRect;
				setSize({ width: Math.round(cr.width), height: Math.round(cr.height) });
			}
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	return { ref, size };
}
