import '../styles/fields/combobox-field.css';
import { JSX } from 'preact';
import { computed, Signal, useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { ComboboxFieldProps } from '../types/components/combobox-field.ts';
import { SelectOption } from '../types/components/select-field.ts';
import { useInteraction } from '../hooks/useInteraction.ts';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { EffectWrapper } from '../wrappers/EffectWrapper.tsx';

export function ComboboxField<T = string>(props: ComboboxFieldProps<T>) {
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		options,
		error,
		disabled,
		placeholder,
		className,
		style,
		position,
		floatingRule,
		required,
		floating,
		hint,
		warning,
		info,
	} = props;

	const containerRef = useRef<HTMLDivElement>(null);
	const menuPosition = useSignal<'down' | 'up'>('down');
	const interaction = useInteraction(
		value instanceof Signal ? value.value : value,
	);
	const isOpen = useSignal(false);
	const inputValue = useSignal('');

	const isValueSignal = value instanceof Signal;
	const internalSignal = useSignal(
		isValueSignal ? value.peek() : (value ?? defaultValue),
	);

	if (!isValueSignal && value !== undefined && value !== internalSignal.peek()) {
		internalSignal.value = value;
	}

	const signalValue = isValueSignal ? value : internalSignal;
	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const errorMessage = error instanceof Signal ? error.value : error;

	if (signalValue.value && !inputValue.value) {
		const selected = options.find((opt) => opt.value === signalValue.value);
		if (selected) {
			inputValue.value = selected.label;
		}
	}

	const filteredOptions = computed(() => {
		const term = inputValue.value.toLowerCase();
		return options.filter((opt) => opt.label.toLowerCase().includes(term));
	});

	// --- Positioning Logic ---
	useEffect(() => {
		if (isOpen.value && containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect();
			const spaceBelow = window.innerHeight - rect.bottom;
			menuPosition.value = spaceBelow < 250 ? 'up' : 'down';
		}
	}, [isOpen.value]);

	const handleInput = (e: JSX.TargetedEvent<HTMLInputElement>) => {
		inputValue.value = e.currentTarget.value;
		isOpen.value = true;
	};

	const handleOptionClick = (option: SelectOption<T>) => {
		if (option.disabled) return;

		if (isValueSignal) {
			(value as Signal<T>).value = option.value;
		} else {
			internalSignal.value = option.value;
		}
		inputValue.value = option.label;
		onChange?.(option.value);
		isOpen.value = false;
	};

	return (
		<div
			className={`field-combobox ${className || ''} ${
				menuPosition.value === 'up' ? 'field-combobox--up' : ''
			}`}
			style={style}
			ref={containerRef}
		>
			<div
				className={[
					'field-combobox__container',
					interaction.focused.value &&
					'field-combobox__container--focused',
					errorMessage && 'field-combobox__container--error',
					isDisabled && 'field-combobox__container--disabled',
				].filter(Boolean).join(' ')}
			>
				<EffectWrapper
					focused={interaction.focused}
					disabled={isDisabled}
				/>

				<input
					id={id}
					className='field-combobox__input'
					value={inputValue.value}
					onInput={handleInput}
					onFocus={(e) => {
						interaction.handleFocus(e);
						isOpen.value = true;
					}}
					onBlur={(e) => {
						setTimeout(() => {
							isOpen.value = false;
							interaction.handleBlur(e);
						}, 200);
					}}
					disabled={!!isDisabled}
					placeholder={placeholder}
				/>

				<div
					className={`field-combobox__menu ${
						isOpen.value && filteredOptions.value.length > 0 ? 'field-combobox__menu--open' : ''
					}`}
				>
					{filteredOptions.value.map((option) => (
						<div
							key={String(option.value)}
							className={[
								'field-combobox__option',
								option.value === signalValue.value &&
								'field-combobox__option--selected',
								option.disabled &&
								'field-combobox__option--disabled',
							].filter(Boolean).join(' ')}
							onMouseDown={(e) => {
								e.preventDefault();
								handleOptionClick(option);
							}}
						>
							{option.label}
						</div>
					))}
					{filteredOptions.value.length === 0 && (
						<div
							className='field-combobox__option'
							style={{
								cursor: 'default',
								color: 'var(--field-text-disabled)',
							}}
						>
							No options found
						</div>
					)}
				</div>
			</div>

			<LabelWrapper
				id={id}
				label={label}
				active={interaction.focused.value || !!inputValue.value ||
					!!placeholder}
				error={!!errorMessage}
				disabled={isDisabled}
				required={required}
				floating={floating}
				position={position}
				floatingRule={floatingRule}
			/>

			<MessageWrapper error={error} hint={hint} warning={warning} info={info} />
		</div>
	);
}
