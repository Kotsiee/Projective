import { useLayoutEffect, useRef } from 'preact/hooks';

interface UseTextMaskProps {
	mask?: string;
	value: string;
	onChange?: (val: string) => void;
	ref: any; // HTMLInputElement ref
}

// Mask Definitions
// 9: Numeric (0-9)
// a: Alphabet (a-z, A-Z)
// *: Alphanumeric (0-9, a-z, A-Z)
const DIGIT = /[0-9]/;
const ALPHA = /[a-zA-Z]/;
const ALPHANUM = /[0-9a-zA-Z]/;

export function useTextMask({ mask, value, onChange, ref }: UseTextMaskProps) {
	// We track the cursor position manually to restore it after formatting
	const cursorRef = useRef<number | null>(null);

	// 1. Core Formatting Logic
	const formatValue = (rawValue: string) => {
		if (!mask) return rawValue;

		let formatted = '';
		let rawIndex = 0;
		let maskIndex = 0;

		while (maskIndex < mask.length && rawIndex < rawValue.length) {
			const maskChar = mask[maskIndex];
			const valueChar = rawValue[rawIndex];

			// Defs
			if (maskChar === '9') {
				if (DIGIT.test(valueChar)) {
					formatted += valueChar;
					maskIndex++;
					rawIndex++;
				} else {
					// Invalid char for this slot, skip raw char
					rawIndex++;
				}
			} else if (maskChar === 'a') {
				if (ALPHA.test(valueChar)) {
					formatted += valueChar;
					maskIndex++;
					rawIndex++;
				} else {
					rawIndex++;
				}
			} else if (maskChar === '*') {
				if (ALPHANUM.test(valueChar)) {
					formatted += valueChar;
					maskIndex++;
					rawIndex++;
				} else {
					rawIndex++;
				}
			} else {
				// Fixed char (separator like / - ( ))
				formatted += maskChar;
				maskIndex++;
				// If user typed the separator explicitly, consume it
				if (valueChar === maskChar) {
					rawIndex++;
				}
			}
		}

		return formatted;
	};

	// 2. Input Handler interceptor
	const handleMaskInput = (e: Event) => {
		if (!mask || !onChange) return;

		const target = e.target as HTMLInputElement;
		const prevValue = value || '';
		let newValue = target.value;

		// Detect deletion (Backspacing)
		// If user backspaces a separator, we might need to handle specific logic,
		// but usually simply re-running formatValue on the stripped string works well enough
		// for standard HTML inputs.

		// Strip existing separators from input to get "raw" chars relative to mask
		// This is a naive strip; for complex masks we might need a more robust unmasker.
		// For now, we rely on the loop in formatValue to pick valid chars.

		const nextFormatted = formatValue(newValue);

		// Capture cursor before React/Preact re-renders
		const selectionStart = target.selectionStart || 0;

		// Heuristic: If we added characters (separators), bump cursor
		// If we removed, keep it.
		// This is the "Hard Part" of masking.
		// A simple approach:
		// Calculate how many "valid data" characters are before the cursor in the NEW value
		// and map that to the formatted string.

		cursorRef.current = selectionStart;

		// Optimization: Only update if changed
		if (nextFormatted !== prevValue) {
			onChange(nextFormatted);
		} else {
			// If formatting stripped the char (invalid input), force update ref to revert view
			target.value = prevValue;
			// Restore cursor
			target.setSelectionRange(selectionStart - 1, selectionStart - 1);
		}
	};

	// 3. Restore Cursor Effect
	useLayoutEffect(() => {
		if (mask && ref.current && cursorRef.current !== null) {
			const input = ref.current;
			// This simple restore works for end-of-typing.
			// For middle-of-string editing, you need more math (counting non-mask chars).
			// We'll stick to basic native behavior restoration for now.

			// If the value length grew by more than 1 char (separator added),
			// check if we need to jump the cursor forward.
			// (Simplified for this snippet)

			input.setSelectionRange(cursorRef.current, cursorRef.current);
			cursorRef.current = null;
		}
	}, [value, mask]);

	return {
		handleMaskInput,
		// expose formatter if needed externally
		formatValue,
	};
}
