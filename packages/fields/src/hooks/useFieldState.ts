import { Signal, useSignal } from '@preact/signals';

export interface FieldStateProps<T> {
	value?: T | Signal<T>;
	defaultValue?: T;
	required?: boolean;
	disabled?: boolean | Signal<boolean>;
	error?: string | Signal<string | undefined>;
	onChange?: (value: T) => void;
}

export interface FieldState<T> {
	value: Signal<T>;
	error: Signal<string | undefined>;
	dirty: Signal<boolean>;
	touched: Signal<boolean>;
	setValue: (newValue: T) => void;
	validate: () => boolean;
}

export function useFieldState<T>(props: FieldStateProps<T>): FieldState<T> {
	// Normalize value signal
	const isValueSignal = props.value instanceof Signal;
	const internalValue = useSignal<T>(
		isValueSignal ? (props.value as Signal<T>).peek() : (props.value ?? props.defaultValue) as T,
	);

	// Sync if prop changes and is not a signal
	if (!isValueSignal && props.value !== undefined && props.value !== internalValue.peek()) {
		internalValue.value = props.value as T;
	}

	const valueSignal = isValueSignal ? (props.value as Signal<T>) : internalValue;

	const errorSignal = useSignal<string | undefined>(
		props.error instanceof Signal ? props.error.peek() : props.error,
	);

	// Sync error prop
	if (
		props.error !== undefined && !(props.error instanceof Signal) &&
		props.error !== errorSignal.peek()
	) {
		errorSignal.value = props.error;
	}

	const dirty = useSignal(false);
	const touched = useSignal(false);

	const validate = () => {
		if (props.required) {
			const val = valueSignal.value;
			const isEmpty = val === undefined || val === null || val === '' ||
				(Array.isArray(val) && val.length === 0);
			if (isEmpty) {
				errorSignal.value = 'This field is required';
				return false;
			}
		}
		// Clear error if it was "This field is required" but now has value
		if (errorSignal.value === 'This field is required') {
			errorSignal.value = undefined;
		}
		return true;
	};

	const setValue = (newValue: T) => {
		valueSignal.value = newValue;
		dirty.value = true;
		props.onChange?.(newValue);
		if (touched.value) {
			validate();
		}
	};

	return {
		value: valueSignal,
		error: errorSignal,
		dirty,
		touched,
		setValue,
		validate,
	};
}
