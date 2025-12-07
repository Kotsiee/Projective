import { Signal, useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { AccordionProps } from '../types/components/accordion.ts';

interface UseAccordionProps
	extends
		Pick<
			AccordionProps,
			'value' | 'defaultValue' | 'onValueChange' | 'type' | 'collapsible' | 'disabled'
		> {}

export function useAccordion({
	value,
	defaultValue,
	onValueChange,
	type = 'single',
	collapsible = false,
	disabled = false,
}: UseAccordionProps) {
	// Internal storage for O(1) lookups
	const expandedValues = useSignal<Set<string>>(new Set());
	const isDisabled = useSignal(false);

	// Sync disabled state
	useEffect(() => {
		isDisabled.value = disabled instanceof Signal ? disabled.value : disabled;
	}, [disabled]);

	// Initialize state (Uncontrolled)
	useEffect(() => {
		if (value === undefined && defaultValue !== undefined) {
			const arr = Array.isArray(defaultValue) ? defaultValue : [defaultValue];
			expandedValues.value = new Set(arr);
		}
	}, []);

	// Sync controlled state
	useEffect(() => {
		if (value !== undefined) {
			const arr = Array.isArray(value) ? value : [value];
			const newSet = new Set(arr);
			const current = expandedValues.value;

			const isDifferent = newSet.size !== current.size ||
				[...newSet].some((x) => !current.has(x));

			if (isDifferent) {
				expandedValues.value = newSet;
			}
		}
	}, [value]);

	const emitChange = (nextSet: Set<string>) => {
		expandedValues.value = nextSet;
		if (onValueChange) {
			const out = type === 'single' ? (nextSet.values().next().value ?? '') : Array.from(nextSet);
			onValueChange(out);
		}
	};

	const toggle = (itemValue: string) => {
		if (isDisabled.value) return;

		const next = new Set(expandedValues.value);
		const isOpen = next.has(itemValue);

		if (type === 'single') {
			if (isOpen) {
				if (collapsible) next.clear();
				else return;
			} else {
				next.clear();
				next.add(itemValue);
			}
		} else {
			if (isOpen) next.delete(itemValue);
			else next.add(itemValue);
		}
		emitChange(next);
	};

	const expandAll = (allValues: string[]) => {
		if (isDisabled.value || type === 'single') return;
		emitChange(new Set(allValues));
	};

	const collapseAll = () => {
		if (isDisabled.value) return;
		// If single and not collapsible, we technically shouldn't collapse all,
		// but usually collapseAll implies a reset.
		// For strict compliance:
		if (type === 'single' && !collapsible) return;

		emitChange(new Set());
	};

	return {
		expandedValues,
		toggle,
		expandAll,
		collapseAll,
		isDisabled,
	};
}
