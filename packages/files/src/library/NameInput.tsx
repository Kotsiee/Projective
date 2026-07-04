import { useEffect, useRef } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { getNameError } from './fileName.ts';

interface NameInputProps {
	initial: string;
	onCommit: (value: string) => void;
	onCancel: () => void;
	placeholder?: string;
	className?: string;
	/** Select just the base name (before the extension) on focus. */
	selectBaseName?: boolean;
}

/**
 * A focused, self-validating inline text editor for file / directory names.
 * Surfaces the regex-safe naming error inline and blocks commit until the name
 * is valid. Commits on Enter / blur, cancels on Escape.
 */
export function NameInput({
	initial,
	onCommit,
	onCancel,
	placeholder,
	className,
	selectBaseName,
}: NameInputProps) {
	const value = useSignal(initial);
	const inputRef = useRef<HTMLInputElement>(null);
	// Suppresses the blur handler while we programmatically commit/cancel.
	const committing = useRef(false);

	useEffect(() => {
		const el = inputRef.current;
		if (!el) return;
		el.focus();
		if (selectBaseName && initial.includes('.')) {
			el.setSelectionRange(0, initial.lastIndexOf('.'));
		} else {
			el.select();
		}
	}, []);

	const error = getNameError(value.value);

	const commit = () => {
		if (committing.current) return;
		if (error) return; // stay in edit mode; the inline error explains why
		committing.current = true;
		onCommit(value.value.trim());
	};

	const cancel = () => {
		committing.current = true;
		onCancel();
	};

	return (
		<div class={`uf-name-input ${className ?? ''}`}>
			<input
				ref={inputRef}
				type='text'
				class={`uf-name-input__field ${error ? 'uf-name-input__field--error' : ''}`}
				value={value.value}
				placeholder={placeholder}
				onClick={(e) => e.stopPropagation()}
				onInput={(e) => (value.value = e.currentTarget.value)}
				onKeyDown={(e) => {
					e.stopPropagation();
					if (e.key === 'Enter') {
						e.preventDefault();
						commit();
					} else if (e.key === 'Escape') {
						e.preventDefault();
						cancel();
					}
				}}
				onBlur={() => (error ? cancel() : commit())}
			/>
			{error && <span class='uf-name-input__error'>{error}</span>}
		</div>
	);
}
