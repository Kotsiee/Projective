import '../styles/fields/text-field.css';
import { TargetedEvent } from 'preact';
import { computed, Signal } from '@preact/signals';
import { TextFieldProps } from '../types/components/text-field.ts';
import { useFieldState } from '../hooks/useFieldState.ts';
import { useInteraction } from '../hooks/useInteraction.ts';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { EffectWrapper } from '../wrappers/EffectWrapper.tsx';
import { AdornmentWrapper } from '../wrappers/AdornmentWrapper.tsx';
import { focusNextElement } from '../hooks/useFocusNext.ts';

export function TextField(props: TextFieldProps) {
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		error,
		disabled,
		placeholder,
		className,
		variant = 'default',
		style,
		position,
		floatingRule,
		required,
		floating,
		hint,
		warning,
		info,
		help,
		helpLink,
		helpPosition,
		type = 'text',
		multiline,
		rows = 3,
		maxRows,
		autoComplete,
		pattern,
		min,
		max,
		minLength,
		maxLength,
		showCount,
		prefix,
		suffix,
		prefixProps,
		suffixProps,
		onPrefixClick,
		onSuffixClick,
		onInput,
		onFocus,
		onBlur,
		nextField,
		onKeyDown,
	} = props;

	const fieldState = useFieldState({
		value,
		defaultValue: defaultValue ?? '',
		required,
		disabled,
		error,
		onChange,
	});

	const interaction = useInteraction(fieldState.value.value);

	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const errorMessage = fieldState.error.value;
	const val = fieldState.value.value || '';

	const length = computed(() => val.length);
	const isOverLimit = computed(() => maxLength ? length.value > maxLength : false);

	const handleContainerClick = (e: MouseEvent) => {
		if (isDisabled) return;
		const input = (e.currentTarget as HTMLElement).querySelector<
			HTMLInputElement | HTMLTextAreaElement
		>('.field-text__input');
		input?.focus();
	};

	const handleInput = (e: TargetedEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const newValue = e.currentTarget.value;
		fieldState.setValue(newValue);
		interaction.handleChange(newValue);
		onInput?.(e);
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !multiline) {
			e.preventDefault();
			focusNextElement(e.currentTarget as HTMLElement, nextField);
		} else if (e.key === 'Tab' && !e.shiftKey && nextField) {
			e.preventDefault();
			focusNextElement(e.currentTarget as HTMLElement, nextField);
		}
		onKeyDown?.(e);
	};

	const renderInput = () => {
		const commonProps = {
			id,
			className: 'field-text__input',
			value: val,
			onInput: handleInput,
			onKeyDown: handleKeyDown,
			onFocus: (e: FocusEvent) => {
				interaction.handleFocus(e);
				onFocus?.(e);
			},
			onBlur: (e: FocusEvent) => {
				interaction.handleBlur(e);
				fieldState.validate();
				onBlur?.(e);
			},
			disabled: !!isDisabled,
			placeholder: placeholder,
			autoComplete,
			maxLength,
			minLength,
			min,
			max,
			'aria-invalid': errorMessage ? true : undefined,
			'aria-required': required ? true : undefined,
		};

		if (multiline) {
			return (
				<textarea
					{...commonProps}
					rows={rows}
					style={maxRows ? { maxHeight: `${maxRows * 1.5}em` } : undefined}
				/>
			);
		}

		return (
			<input
				{...commonProps}
				type={type}
				pattern={pattern}
			/>
		);
	};

	return (
		<div
			className={[
				'field-text',
				variant === 'glass' && 'field-text--glass',
				className,
			].filter(Boolean).join(' ')}
			style={style}
		>
			<div
				className={[
					'field-text__container',
					interaction.focused.value && 'field-text__container--focused',
					errorMessage && 'field-text__container--error',
					isDisabled && 'field-text__container--disabled',
				].filter(Boolean).join(' ')}
				onClick={handleContainerClick}
			>
				<EffectWrapper
					focused={interaction.focused}
					disabled={isDisabled}
				/>

				<AdornmentWrapper
					position='prefix'
					onClick={onPrefixClick}
					{...prefixProps}
				>
					{prefix}
				</AdornmentWrapper>

				<LabelWrapper
					id={id}
					label={label}
					active={interaction.focused.value || !!val || !!placeholder}
					error={!!errorMessage}
					disabled={isDisabled}
					required={required}
					floating={floating}
					position={position}
					floatingRule={floatingRule}
					multiline={multiline}
					help={help}
					helpLink={helpLink}
					helpPosition={helpPosition} // Passed down
				/>

				{renderInput()}

				<AdornmentWrapper
					position='suffix'
					onClick={onSuffixClick}
					{...suffixProps}
				>
					{suffix}
				</AdornmentWrapper>
			</div>

			<div style={{ display: 'flex', justifyContent: 'space-between' }}>
				<div style={{ flex: 1 }}>
					<MessageWrapper
						error={fieldState.error}
						hint={hint}
						warning={warning}
						info={info}
					/>
				</div>

				{showCount && maxLength && (
					<div
						className={`field-text__count ${isOverLimit.value ? 'field-text__count--limit' : ''}`}
					>
						{length}/{maxLength}
					</div>
				)}
			</div>
		</div>
	);
}
