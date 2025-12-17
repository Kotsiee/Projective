import { useEffect, useRef } from 'preact/hooks';
import type { VirtualItem, Virtualizer } from '../../core/virtualizer.ts';

interface RowProps {
	virtualItem: VirtualItem;
	virtualizer: Virtualizer;
	children: preact.ComponentChildren;
	className?: string;
}

export function Row({ virtualItem, virtualizer, children, className }: RowProps) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!ref.current) return;

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				// Report EXACT pixel height to the engine
				// entry.borderBoxSize[0].blockSize is more precise than offsetHeight
				const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
				virtualizer.measure(virtualItem.index, height);
			}
		});

		observer.observe(ref.current);
		return () => observer.disconnect();
	}, [virtualItem.index, virtualizer]);

	return (
		<div
			ref={ref}
			data-index={virtualItem.index}
			className={className}
			style={{
				position: 'absolute',
				top: 0,
				left: 0,
				width: '100%',
				transform: `translateY(${virtualItem.start}px)`,
				// We do NOT set height here (let content dictate it)
				// unless it's strictly fixed mode, but variable mode is safer default
			}}
		>
			{children}
		</div>
	);
}
