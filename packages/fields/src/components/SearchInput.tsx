import '../styles/fields/search-input.css';
import { Signal, useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { IconSearch, IconX } from '@tabler/icons-preact';
import { SearchInputProps } from '../types/components/search-input.ts';
import { useFieldState } from '../hooks/useFieldState.ts';
import { useInteraction } from '../hooks/useInteraction.ts';

const prefersReducedMotion = () =>
	typeof globalThis !== 'undefined' &&
	typeof globalThis.matchMedia === 'function' &&
	globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * @function SearchInput
 * @description The platform's cinematic search field. Built on the shared field hooks so it honours
 * signal-or-plain `value`, but tuned for discovery: a leading glyph that reacts on focus, an animated
 * gradient sheen, a typewriter placeholder for the hero, and a smooth clear affordance. Submits the
 * trimmed query on Enter via {@link SearchInputProps.onSearch}; `onChange` streams the live value
 * (optionally debounced) so callers can drive live results.
 */
export function SearchInput(props: SearchInputProps) {
	const {
		id,
		name,
		value,
		defaultValue,
		onChange,
		onSearch,
		onClear,
		debounceMs = 0,
		placeholder = 'Search',
		variant = 'default',
		size = 'md',
		disabled,
		icon,
		action,
		rotatingTerms,
		autoFocus,
		hideClear,
		className,
		style,
		'aria-label': ariaLabel,
	} = props;

	const fieldState = useFieldState<string>({
		value,
		defaultValue: defaultValue ?? '',
		disabled,
		// onChange is emitted manually (with debounce) so we control immediate vs. deferred.
	});
	const interaction = useInteraction(fieldState.value.value);

	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const val = fieldState.value.value || '';
	const inputRef = useRef<HTMLInputElement>(null);
	const debounceTimer = useRef<number | undefined>(undefined);

	const typed = useSignal('');

	// #region Debounced value emit
	const emitChange = (next: string) => {
		if (!onChange) return;
		if (!debounceMs) {
			onChange(next);
			return;
		}
		if (debounceTimer.current) clearTimeout(debounceTimer.current);
		debounceTimer.current = setTimeout(() => onChange(next), debounceMs) as unknown as number;
	};
	// #endregion

	// #region Typewriter placeholder (idle, cinematic)
	useEffect(() => {
		if (!rotatingTerms || rotatingTerms.length === 0) return;
		if (typeof globalThis === 'undefined' || !globalThis.document) return;
		if (prefersReducedMotion()) {
			typed.value = rotatingTerms[0];
			return;
		}

		let termIdx = 0;
		let charIdx = 0;
		let deleting = false;
		let timer: number;

		const tick = () => {
			const term = rotatingTerms[termIdx % rotatingTerms.length];
			charIdx += deleting ? -1 : 1;
			typed.value = term.slice(0, Math.max(0, charIdx));

			let delay = deleting ? 45 : 80;
			if (!deleting && charIdx === term.length) {
				delay = 1600; // hold the full phrase
				deleting = true;
			} else if (deleting && charIdx === 0) {
				deleting = false;
				termIdx += 1;
				delay = 350;
			}
			timer = setTimeout(tick, delay) as unknown as number;
		};

		timer = setTimeout(tick, 500) as unknown as number;
		return () => clearTimeout(timer);
	}, [rotatingTerms]);
	// #endregion

	useEffect(() => {
		if (autoFocus) inputRef.current?.focus();
		return () => {
			if (debounceTimer.current) clearTimeout(debounceTimer.current);
		};
	}, []);

	// #region Handlers
	const handleInput = (e: Event) => {
		const next = (e.currentTarget as HTMLInputElement).value;
		fieldState.setValue(next);
		interaction.handleChange(next);
		emitChange(next);
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			if (debounceTimer.current) clearTimeout(debounceTimer.current);
			onSearch?.(val.trim());
		} else if (e.key === 'Escape' && val) {
			e.preventDefault();
			handleClear();
		}
	};

	const handleClear = () => {
		if (debounceTimer.current) clearTimeout(debounceTimer.current);
		fieldState.value.value = '';
		interaction.handleChange('');
		onChange?.('');
		onClear?.();
		inputRef.current?.focus();
	};
	// #endregion

	const showClear = !hideClear && val.length > 0;
	const idlePlaceholder =
		rotatingTerms && rotatingTerms.length > 0 && !val && !interaction.focused.value
			? (typed.value ? `Try “${typed.value}”` : placeholder)
			: placeholder;

	const classes = [
		'field-search',
		`field-search--${variant}`,
		`field-search--${size}`,
		className,
	].filter(Boolean).join(' ');

	const containerClasses = [
		'field-search__container',
		interaction.focused.value && 'field-search__container--focused',
		isDisabled && 'field-search__container--disabled',
		val && 'field-search__container--filled',
	].filter(Boolean).join(' ');

	return (
		<div class={classes} style={style} role='search'>
			<div
				class={containerClasses}
				onMouseEnter={interaction.handleMouseEnter}
				onMouseLeave={interaction.handleMouseLeave}
				onClick={() => inputRef.current?.focus()}
			>
				<span class='field-search__sheen' aria-hidden='true' />
				<span class='field-search__icon'>
					{icon ?? <IconSearch size={variant === 'cinematic' ? 22 : 18} stroke={2} />}
				</span>

				<input
					ref={inputRef}
					id={id}
					name={name}
					type='search'
					class='field-search__input'
					value={val}
					placeholder={idlePlaceholder}
					disabled={!!isDisabled}
					autoComplete='off'
					spellcheck={false}
					aria-label={ariaLabel ?? placeholder}
					onInput={handleInput}
					onKeyDown={handleKeyDown}
					onFocus={interaction.handleFocus}
					onBlur={interaction.handleBlur}
				/>

				{showClear && (
					<button
						type='button'
						class='field-search__clear'
						aria-label='Clear search'
						onClick={(e) => {
							e.stopPropagation();
							handleClear();
						}}
					>
						<IconX size={16} stroke={2.5} />
					</button>
				)}

				{!val && action && <div class='field-search__action'>{action}</div>}
			</div>
		</div>
	);
}

export default SearchInput;
