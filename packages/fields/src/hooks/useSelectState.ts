import { computed, Signal, useSignal } from '@preact/signals';
import { SelectOption } from '../types/components/select-field.ts';

interface UseSelectStateProps<T> {
	options: SelectOption<T>[];
	value?: T | T[] | Signal<T | T[]>;
	onChange?: (val: T | T[]) => void;
	multiple?: boolean;
	disabled?: boolean;
	groupSelectMode?: 'value' | 'members';
}

// Internal Interface for the flattened list
export interface FlatOption<T> extends SelectOption<T> {
	depth: number;
	isGroup: boolean;
	// Cache all descendant values for quick "select all members" logic
	descendantValues: T[];
}

export function useSelectState<T>({
	options,
	value,
	onChange,
	multiple,
	disabled,
	groupSelectMode = 'value',
}: UseSelectStateProps<T>) {
	const isOpen = useSignal(false);
	const highlightedIndex = useSignal(-1);
	const searchQuery = useSignal('');

	// Helper: Flatten tree to list
	const flattenOptions = (
		opts: SelectOption<T>[],
		depth = 0,
		accum: FlatOption<T>[] = [],
	): FlatOption<T>[] => {
		for (const opt of opts) {
			const isGroup = !!(opt.options && opt.options.length > 0);

			// Recursively get descendants if it's a group
			let descendantValues: T[] = [];
			let childrenFlat: FlatOption<T>[] = [];

			if (isGroup && opt.options) {
				childrenFlat = flattenOptions(opt.options, depth + 1);
				// Collect leaf values from children
				descendantValues = childrenFlat
					.filter((c) => !c.isGroup || groupSelectMode === 'value') // If mode is value, groups are valid values too
					.map((c) => c.value);

				// Also include children's descendants
				childrenFlat.forEach((c) => {
					if (c.isGroup) descendantValues.push(...c.descendantValues);
				});

				// Dedup
				descendantValues = Array.from(new Set(descendantValues));
			}

			accum.push({
				...opt,
				depth,
				isGroup,
				descendantValues,
			});

			if (isGroup) {
				accum.push(...childrenFlat);
			}
		}
		return accum;
	};

	// Flatten once (memoized by computed if options change)
	const flatOptions = computed(() => flattenOptions(options));

	const selectedValues = computed(() => {
		const val = value instanceof Signal ? value.value : (value ?? []);
		return Array.isArray(val) ? val : (val ? [val] : []);
	});

	const filteredOptions = computed(() => {
		const query = searchQuery.value.toLowerCase();
		if (!query) return flatOptions.value;
		return flatOptions.value.filter((opt) => opt.label.toLowerCase().includes(query));
	});

	const toggleOpen = (forceState?: boolean) => {
		if (disabled) return;
		const newState = forceState !== undefined ? forceState : !isOpen.value;
		isOpen.value = newState;

		if (newState) {
			// Find first selected index to highlight
			const firstSelected = filteredOptions.value.findIndex((o) =>
				selectedValues.value.includes(o.value)
			);
			highlightedIndex.value = firstSelected >= 0 ? firstSelected : 0;
		} else {
			searchQuery.value = '';
			highlightedIndex.value = -1;
		}
	};

	const selectOption = (option: FlatOption<T>) => {
		if (option.disabled) return;

		let newValue: T | T[];

		if (multiple) {
			const current = selectedValues.value as T[];

			// Logic for Group Members Selection
			if (option.isGroup && groupSelectMode === 'members') {
				const targets = option.descendantValues;
				const allSelected = targets.every((v) => current.includes(v));

				if (allSelected) {
					// Deselect all members
					newValue = current.filter((v) => !targets.includes(v));
				} else {
					// Select all members (union)
					const toAdd = targets.filter((v) => !current.includes(v));
					newValue = [...current, ...toAdd];
				}
			} else {
				// Standard Toggle
				const exists = current.includes(option.value);
				if (exists) {
					newValue = current.filter((v) => v !== option.value);
				} else {
					newValue = [...current, option.value];
				}
			}

			searchQuery.value = '';
			if (value instanceof Signal) value.value = newValue;
		} else {
			// Single Select
			// If clicking a group in 'members' mode, do nothing or expand?
			// Usually single select can't select multiple members, so we treat group as unselectable label
			// or we treat it as selecting the group value itself if allowGroupSelection is true.

			if (option.isGroup && groupSelectMode === 'members') {
				// In single mode, 'members' doesn't make sense for assignment.
				// We assume clicking it does nothing or perhaps expands (if we had collapsible).
				return;
			}

			newValue = option.value;
			if (value instanceof Signal) value.value = newValue;
			toggleOpen(false);
		}

		onChange?.(newValue);
	};

	const removeValue = (valToRemove: T) => {
		if (!multiple) {
			if (value instanceof Signal) value.value = undefined as any;
			onChange?.(undefined as any);
			return;
		}

		const current = selectedValues.value as T[];
		const newValue = current.filter((v) => v !== valToRemove);

		if (value instanceof Signal) value.value = newValue;
		onChange?.(newValue);
	};

	const toggleSelectAll = () => {
		if (!multiple) return;

		// Filter out groups if we are only selecting leaf nodes, OR select everything if mode is value
		const candidateOptions = filteredOptions.value.filter((o) =>
			!o.disabled && (!o.isGroup || groupSelectMode === 'value')
		);

		const enabledValues = candidateOptions.map((o) => o.value);
		const current = selectedValues.value as T[];

		const allSelected = enabledValues.every((v) => current.includes(v));

		let newValue: T[];
		if (allSelected) {
			newValue = current.filter((v) => !enabledValues.includes(v));
		} else {
			const toAdd = enabledValues.filter((v) => !current.includes(v));
			newValue = [...current, ...toAdd];
		}

		if (value instanceof Signal) value.value = newValue;
		onChange?.(newValue);
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
				if (highlightedIndex.value < filteredOptions.value.length - 1) {
					highlightedIndex.value++;
				}
				break;
			case 'ArrowUp':
				e.preventDefault();
				if (highlightedIndex.value > 0) {
					highlightedIndex.value--;
				}
				break;
			case 'Enter':
				e.preventDefault();
				if (isOpen.value && highlightedIndex.value >= 0) {
					const opt = filteredOptions.value[highlightedIndex.value];
					if (opt) selectOption(opt);
				}
				break;
			case 'Escape':
				e.preventDefault();
				toggleOpen(false);
				break;
			case 'Backspace':
				if (searchQuery.value === '' && multiple && selectedValues.value.length > 0) {
					const last = selectedValues.value[selectedValues.value.length - 1];
					removeValue(last);
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
		filteredOptions,
		selectedValues,
		toggleOpen,
		selectOption,
		removeValue,
		toggleSelectAll,
		handleKeyDown,
	};
}
