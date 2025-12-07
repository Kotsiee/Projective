import '../styles/fields/text-field.css';
import { JSX } from 'preact';
import { computed, Signal, useSignal } from '@preact/signals';
import { TextFieldProps } from '../types/components/text-field.ts';
import { useFieldState } from '../hooks/useFieldState.ts';
import { useInteraction } from '../hooks/useInteraction.ts';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { EffectWrapper } from '../wrappers/EffectWrapper.tsx';
import { AdornmentWrapper } from '../wrappers/AdornmentWrapper.tsx';

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
		style,
		position,
		floatingRule,
		required,
		floating,
		hint,
		warning,
		info,
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
		onPrefixClick,
		onSuffixClick,
		onInput,
		onFocus,
		onBlur,
	} = props;

	// 1. State Management
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

	// 2. Computed
	const length = computed(() => val.length);
	const isOverLimit = computed(() => maxLength ? length.value > maxLength : false);

	// 3. Handlers
	const handleContainerClick = (e: MouseEvent) => {
		if (isDisabled) return;
		const input = (e.currentTarget as HTMLElement).querySelector<
			HTMLInputElement | HTMLTextAreaElement
		>('.field-text__input');
		input?.focus();
	};

	const handleInput = (e: JSX.TargetedEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const newValue = e.currentTarget.value;
		fieldState.setValue(newValue);
		interaction.handleChange(newValue);
		onInput?.(e);
	};

	// 4. Render Helpers
	const renderInput = () => {
		const commonProps = {
			id,
			className: 'field-text__input',
			value: val,
			onInput: handleInput,
			onFocus: (e: any) => {
				interaction.handleFocus(e);
				onFocus?.(e);
			},
			onBlur: (e: any) => {
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
		<div className={`field-text ${className || ''}`} style={style}>
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
				>
					{prefix}
				</AdornmentWrapper>

				{/* Label Moved Inside Container for Correct Relative Positioning */}
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
				/>

				{renderInput()}

				<AdornmentWrapper
					position='suffix'
					onClick={onSuffixClick}
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
