import { Signal, useSignal } from '@preact/signals';

export interface InteractionState {
	focused: Signal<boolean>;
	hovered: Signal<boolean>;
	active: Signal<boolean>;
	dirty: Signal<boolean>;
	touched: Signal<boolean>;
	handleFocus: (e?: FocusEvent | MouseEvent) => void;
	handleBlur: (e?: FocusEvent | MouseEvent) => void;
	handleMouseEnter: (e: MouseEvent) => void;
	handleMouseLeave: (e: MouseEvent) => void;
	handleMouseDown: (e: MouseEvent) => void;
	handleMouseUp: (e: MouseEvent) => void;
	handleChange: (value: unknown) => void;
}

export function useInteraction(initialValue?: unknown): InteractionState {
	const focused = useSignal(false);
	const hovered = useSignal(false);
	const active = useSignal(false);
	const dirty = useSignal(false);
	const touched = useSignal(false);

	// Track initial value to determine dirty state
	const _initialValue = initialValue;

	const handleFocus = (_e?: FocusEvent | MouseEvent) => {
		focused.value = true;
		touched.value = true;
	};

	const handleBlur = (_e?: FocusEvent | MouseEvent) => {
		focused.value = false;
	};

	const handleMouseEnter = (_e: MouseEvent) => {
		hovered.value = true;
	};

	const handleMouseLeave = (_e: MouseEvent) => {
		hovered.value = false;
		active.value = false; // Ensure active is cleared
	};

	const handleMouseDown = (_e: MouseEvent) => {
		active.value = true;
	};

	const handleMouseUp = (_e: MouseEvent) => {
		active.value = false;
	};

	const handleChange = (value: unknown) => {
		dirty.value = value !== _initialValue;
	};

	return {
		focused,
		hovered,
		active,
		dirty,
		touched,
		handleFocus,
		handleBlur,
		handleMouseEnter,
		handleMouseLeave,
		handleMouseDown,
		handleMouseUp,
		handleChange,
	};
}
