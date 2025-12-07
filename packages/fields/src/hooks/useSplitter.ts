import { Signal, useSignal } from '@preact/signals';
import { useCallback, useEffect, useRef } from 'preact/hooks';
import { SplitterDirection } from '../types/components/splitter.ts';

interface PaneConfig {
	minSize?: number;
	maxSize?: number;
	collapsible?: boolean;
	defaultCollapsed?: boolean;
}

interface UseSplitterProps {
	count: number;
	direction: SplitterDirection;
	initialSizes?: number[];
	minPaneSize?: number;
	paneConfigs: PaneConfig[];
	onResizeEnd?: (sizes: number[]) => void;
	onCollapse?: (index: number, collapsed: boolean) => void;
}

export function useSplitter({
	count,
	direction,
	initialSizes,
	minPaneSize = 10,
	paneConfigs,
	onResizeEnd,
	onCollapse,
}: UseSplitterProps) {
	const sizes = useSignal<number[]>([]);
	const isResizing = useSignal(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const collapsedState = useRef<Map<number, number>>(new Map());

	// FIX: Use ref for configs to avoid stale closures in event listeners
	const configsRef = useRef(paneConfigs);
	useEffect(() => {
		configsRef.current = paneConfigs;
	}, [paneConfigs]);

	const dragRef = useRef<
		{
			index: number;
			startPos: number;
			startSizes: number[];
		} | null
	>(null);

	// --- Initialization ---
	useEffect(() => {
		let newSizes: number[] = [];
		if (initialSizes && initialSizes.length === count) {
			newSizes = [...initialSizes];
		} else {
			const even = 100 / count;
			newSizes = new Array(count).fill(even);
		}

		// Apply default collapsed states using the CURRENT configs
		paneConfigs.forEach((conf, idx) => {
			if (conf.defaultCollapsed && conf.collapsible) {
				collapsedState.current.set(idx, newSizes[idx]);
				newSizes[idx] = 0;
				if (idx < count - 1) newSizes[idx + 1] += newSizes[idx];
				else if (idx > 0) newSizes[idx - 1] += newSizes[idx];
			}
		});
		sizes.value = newSizes;
	}, [count, initialSizes]); // Intentionally exclude paneConfigs to prevent reset on config change

	// --- Core Calculation Logic ---
	const calculateMove = useCallback((index: number, deltaPercent: number, baseSizes: number[]) => {
		const leftIdx = index;
		const rightIdx = index + 1;

		const newSizes = [...baseSizes];
		let p1 = baseSizes[leftIdx] + deltaPercent;
		let p2 = baseSizes[rightIdx] - deltaPercent;

		// FIX: Read from ref to get fresh configs during drag
		const config1 = configsRef.current[leftIdx] || {};
		const config2 = configsRef.current[rightIdx] || {};

		const min1 = config1.minSize ?? minPaneSize;
		const max1 = config1.maxSize ?? 100;
		const min2 = config2.minSize ?? minPaneSize;
		const max2 = config2.maxSize ?? 100;

		// Constraints
		if (p1 < min1) {
			const diff = min1 - p1;
			p1 = min1;
			p2 -= diff;
		}
		if (p2 < min2) {
			const diff = min2 - p2;
			p2 = min2;
			p1 -= diff;
		}
		if (p1 > max1) {
			const diff = p1 - max1;
			p1 = max1;
			p2 += diff;
		}
		if (p2 > max2) {
			const diff = p2 - max2;
			p2 = max2;
			p1 += diff;
		}

		newSizes[leftIdx] = p1;
		newSizes[rightIdx] = p2;
		return newSizes;
	}, [minPaneSize]);

	// --- Handlers ---
	const processDrag = (currentPos: number) => {
		if (!dragRef.current || !containerRef.current) return;
		const { index, startPos, startSizes } = dragRef.current;
		const rect = containerRef.current.getBoundingClientRect();

		// Handle 0 size container edge case
		const containerSize = direction === 'horizontal' ? rect.width : rect.height;
		if (containerSize === 0) return;

		const deltaPx = currentPos - startPos;
		const deltaPercent = (deltaPx / containerSize) * 100;

		sizes.value = calculateMove(index, deltaPercent, startSizes);
	};

	const moveSplitter = useCallback((index: number, deltaPercent: number) => {
		sizes.value = calculateMove(index, deltaPercent, sizes.value);
		if (onResizeEnd) onResizeEnd(sizes.value);
	}, [calculateMove, onResizeEnd]);

	// Listeners
	const handleMove = useCallback((e: MouseEvent) => {
		if (!dragRef.current) return;
		const clientPos = direction === 'horizontal' ? e.clientX : e.clientY;
		processDrag(clientPos);
	}, [direction]);

	const handleTouchMove = useCallback((e: TouchEvent) => {
		if (!dragRef.current) return;
		e.preventDefault();
		const touch = e.touches[0];
		const clientPos = direction === 'horizontal' ? touch.clientX : touch.clientY;
		processDrag(clientPos);
	}, [direction]);

	const handleEnd = useCallback(() => {
		isResizing.value = false;
		dragRef.current = null;

		document.removeEventListener('mousemove', handleMove);
		document.removeEventListener('mouseup', handleEnd);
		document.removeEventListener('touchmove', handleTouchMove);
		document.removeEventListener('touchend', handleEnd);

		document.body.style.cursor = '';
		document.body.style.userSelect = '';

		if (onResizeEnd) onResizeEnd(sizes.value);
	}, [onResizeEnd, handleMove, handleTouchMove]);

	const startResize = useCallback((index: number, clientX: number, clientY: number) => {
		isResizing.value = true;
		const startPos = direction === 'horizontal' ? clientX : clientY;

		dragRef.current = {
			index,
			startPos,
			startSizes: [...sizes.value],
		};

		document.addEventListener('mousemove', handleMove);
		document.addEventListener('mouseup', handleEnd);
		document.addEventListener('touchmove', handleTouchMove, { passive: false });
		document.addEventListener('touchend', handleEnd);

		document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
		document.body.style.userSelect = 'none';
	}, [sizes, direction, handleMove, handleTouchMove, handleEnd]);

	const toggleCollapse = useCallback((index: number) => {
		const config = configsRef.current[index];
		if (!config?.collapsible) return;

		const currentSizes = [...sizes.value];
		const currentSize = currentSizes[index];
		let isCollapsed = false;

		let neighborIdx = index + 1;
		if (neighborIdx >= count) neighborIdx = index - 1;

		if (currentSize > 0.5) {
			collapsedState.current.set(index, currentSize);
			currentSizes[neighborIdx] += currentSize;
			currentSizes[index] = 0;
			isCollapsed = true;
		} else {
			let restoreSize = collapsedState.current.get(index) || config.minSize || minPaneSize || 10;
			const neighborSize = currentSizes[neighborIdx];
			const neighborMin = configsRef.current[neighborIdx]?.minSize ?? minPaneSize;

			if (neighborSize - restoreSize < neighborMin) {
				restoreSize = Math.max(0, neighborSize - neighborMin);
			}

			if (restoreSize > 0) {
				currentSizes[neighborIdx] -= restoreSize;
				currentSizes[index] = restoreSize;
			}
		}

		sizes.value = currentSizes;
		if (onResizeEnd) onResizeEnd(sizes.value);
		if (onCollapse) onCollapse(index, isCollapsed);
	}, [sizes, count, minPaneSize, onResizeEnd, onCollapse]);

	return { sizes, isResizing, containerRef, startResize, moveSplitter, toggleCollapse };
}
