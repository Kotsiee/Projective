import { useComputed, useSignal } from '@preact/signals';
import { useCallback } from 'preact/hooks';
import { SelectOption } from '../types/fields/select.ts';

interface UseSelectStateProps {
	options: SelectOption[];
	value?: string | string[] | number | number[];
	// deno-lint-ignore no-explicit-any
	onChange?: (val: any) => void;
	multiple?: boolean;
	disabled?: boolean;
}

export function useSelectState({
	options,
	value,
	onChange,
	multiple,
	disabled,
}: UseSelectStateProps) {
	const isOpen = useSignal(false);
	const highlightedIndex = useSignal(-1);
	const searchQuery = useSignal('');

	const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);

	const filteredOptions = useComputed(() =>
		options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.value.toLowerCase()))
	);

	const toggleOpen = (forceState?: boolean) => {
		if (disabled) return;
		const newState = forceState !== undefined ? forceState : !isOpen.value;
		isOpen.value = newState;

		if (newState) {
			const firstSelected = filteredOptions.value.findIndex((o) =>
				selectedValues.includes(o.value)
			);
			highlightedIndex.value = firstSelected >= 0 ? firstSelected : 0;
		} else {
			setSearchQuery('');
			highlightedIndex.value = -1;
		}
	};

	const setSearchQuery = (q: string) => {
		searchQuery.value = q;
		if (isOpen.value) highlightedIndex.value = 0;
	};

	const selectOption = useCallback((option: SelectOption) => {
		if (option.disabled) return;

		let newValue;
		if (multiple) {
			const exists = selectedValues.includes(option.value);
			if (exists) {
				newValue = selectedValues.filter((v) => v !== option.value);
			} else {
				newValue = [...selectedValues, option.value];
			}
			setSearchQuery('');
		} else {
			newValue = option.value;
			toggleOpen(false);
		}

		onChange?.(newValue);
	}, [multiple, selectedValues, onChange]);

	const removeValue = (val: string | number) => {
		if (!multiple) {
			onChange?.(null);
			return;
		}
		onChange?.(selectedValues.filter((v) => v !== val));
	};

	// --- FIX: Exclude disabled items from "Select All" ---
	const toggleSelectAll = () => {
		if (!multiple) return;

		// 1. Get only the enabled options currently visible
		const enabledOptions = filteredOptions.value.filter((o) => !o.disabled);
		const enabledValues = enabledOptions.map((o) => o.value);

		// 2. Check if all *enabled* options are currently selected
		const areAllSelected = enabledValues.every((v) => selectedValues.includes(v));

		if (areAllSelected) {
			// Deselect: Remove only the visible enabled values
			const remaining = selectedValues.filter((v) => !enabledValues.includes(v));
			onChange?.(remaining);
		} else {
			// Select: Add missing enabled values
			const uniqueValues = Array.from(new Set([...selectedValues, ...enabledValues]));
			onChange?.(uniqueValues);
		}
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (disabled) return;

		if (!isOpen.value && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
			e.preventDefault();
			toggleOpen(true);
			return;
		}

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				highlightedIndex.value = highlightedIndex.value < filteredOptions.value.length - 1
					? highlightedIndex.value + 1
					: highlightedIndex.value;
				break;
			case 'ArrowUp':
				e.preventDefault();
				highlightedIndex.value = highlightedIndex.value > 0 ? highlightedIndex.value - 1 : 0;
				break;
			case 'Enter':
				e.preventDefault();
				if (isOpen.value && highlightedIndex.value >= 0) {
					selectOption(filteredOptions.value[highlightedIndex.value]);
				}
				break;
			case 'Escape':
				e.preventDefault();
				toggleOpen(false);
				break;
			case 'Backspace':
				if (searchQuery.value === '' && multiple && selectedValues.length > 0) {
					removeValue(selectedValues[selectedValues.length - 1]);
				}
				break;
			case 'Tab':
				if (isOpen.value) toggleOpen(false);
				break;
		}
	};

	return {
		isOpen,
		highlightedIndex,
		searchQuery,
		setSearchQuery,
		filteredOptions,
		selectedValues,
		toggleOpen,
		selectOption,
		removeValue,
		toggleSelectAll,
		handleKeyDown,
	};
}
