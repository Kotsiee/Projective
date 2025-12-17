import { useRef, useState } from 'preact/hooks';
import type { Dataset, NormalizedItem } from '../core/dataset.ts';

interface UseSelectionProps<T> {
	dataset: Dataset<T>;
	setDataset: (d: Dataset<T>) => void;
	selectionMode?: 'none' | 'single' | 'multi';
	onSelectionChange?: (selectedKeys: Set<string>) => void;
}

export function useSelection<T>({
	dataset,
	setDataset,
	selectionMode = 'single',
	onSelectionChange,
}: UseSelectionProps<T>) {
	// Track the last clicked item for Shift+Click ranges
	const lastKeyRef = useRef<string | null>(null);

	const handleItemClick = (key: string, event: MouseEvent) => {
		if (selectionMode === 'none') return;

		const isShift = event.shiftKey && selectionMode === 'multi';
		const isCtrl = (event.ctrlKey || event.metaKey) && selectionMode === 'multi';

		// Immutable update preparation
		const nextItems = new Map(dataset.items);
		let newSelectedKeys = new Set<string>();

		// Helper to set state
		const setSelect = (k: string, val: boolean) => {
			const item = nextItems.get(k);
			if (item) {
				nextItems.set(k, { ...item, selected: val });
				if (val) newSelectedKeys.add(k);
			}
		};

		if (isShift && lastKeyRef.current) {
			// --- Range Selection ---
			const start = dataset.order.indexOf(lastKeyRef.current);
			const end = dataset.order.indexOf(key);

			if (start !== -1 && end !== -1) {
				const [low, high] = start < end ? [start, end] : [end, start];
				// Select everything in between
				for (let i = low; i <= high; i++) {
					const k = dataset.order[i];
					if (k) setSelect(k, true);
				}
			}
		} else if (isCtrl) {
			// --- Toggle Selection ---
			// Keep existing
			for (const [k, item] of dataset.items) {
				if (item.selected) newSelectedKeys.add(k);
			}
			// Toggle target
			const target = nextItems.get(key);
			if (target) {
				if (target.selected) {
					setSelect(key, false);
					newSelectedKeys.delete(key);
				} else {
					setSelect(key, true);
				}
			}
			lastKeyRef.current = key;
		} else {
			// --- Simple Selection (Reset others) ---
			// Deselect all current
			for (const [k, item] of dataset.items) {
				if (item.selected) nextItems.set(k, { ...item, selected: false });
			}
			// Select new
			setSelect(key, true);
			lastKeyRef.current = key;
		}

		// Commit State
		setDataset({ ...dataset, items: nextItems });

		// Fire callback
		onSelectionChange?.(newSelectedKeys);
	};

	return { handleItemClick };
}
