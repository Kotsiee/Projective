import '../styles/fields/tag-input.css';
import { Signal, useSignal } from '@preact/signals';
import { TagInputProps } from '../types/components/tag-input.ts';
import { useInteraction } from '../hooks/useInteraction.ts';
import { LabelWrapper } from '../wrappers/LabelWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { EffectWrapper } from '../wrappers/EffectWrapper.tsx';

export function TagInput(props: TagInputProps) {
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
	} = props;

	const interaction = useInteraction(
		value instanceof Signal ? value.value : value,
	);
	const inputValue = useSignal('');

	const isValueSignal = value instanceof Signal;
	const internalSignal = useSignal(
		isValueSignal ? value.peek() : (value ?? defaultValue ?? []),
	);

	if (!isValueSignal && value !== undefined && value !== internalSignal.peek()) {
		internalSignal.value = value;
	}

	const signalValue = isValueSignal ? value : internalSignal;
	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const errorMessage = error instanceof Signal ? error.value : error;

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			const val = inputValue.value.trim();
			if (val) {
				const currentTags = signalValue.value || [];
				if (!currentTags.includes(val)) {
					const newTags = [...currentTags, val];
					if (isValueSignal) {
						(value as Signal<string[]>).value = newTags;
					} else {
						internalSignal.value = newTags;
					}
					onChange?.(newTags);
				}
				inputValue.value = '';
			}
		} else if (
			e.key === 'Backspace' && !inputValue.value &&
			signalValue.value?.length
		) {
			const newTags = signalValue.value.slice(0, -1);
			if (isValueSignal) {
				(value as Signal<string[]>).value = newTags;
			} else {
				internalSignal.value = newTags;
			}
			onChange?.(newTags);
		}
	};

	const removeTag = (tagToRemove: string) => {
		const currentTags = signalValue.value || [];
		const newTags = currentTags.filter((tag) => tag !== tagToRemove);
		if (isValueSignal) {
			(value as Signal<string[]>).value = newTags;
		} else {
			internalSignal.value = newTags;
		}
		onChange?.(newTags);
	};

	const handleContainerClick = (e: MouseEvent) => {
		if (isDisabled) return;
		const input = (e.currentTarget as HTMLElement).querySelector('input');
		input?.focus();
	};

	return (
		<div className={`field-tag ${className || ''}`} style={style}>
			<div
				className={[
					'field-tag__container',
					interaction.focused.value &&
					'field-tag__container--focused',
					errorMessage && 'field-tag__container--error',
					isDisabled && 'field-tag__container--disabled',
				].filter(Boolean).join(' ')}
				onClick={handleContainerClick}
			>
				<EffectWrapper
					focused={interaction.focused}
					disabled={isDisabled}
				/>

				{signalValue.value?.map((tag) => (
					<div key={tag} className='field-tag__chip'>
						<span>{tag}</span>
						<span
							className='field-tag__chip-remove'
							onClick={(e) => {
								e.stopPropagation();
								removeTag(tag);
							}}
						>
							&times;
						</span>
					</div>
				))}

				<input
					id={id}
					className='field-tag__input'
					value={inputValue.value}
					onInput={(e) => inputValue.value = e.currentTarget.value}
					onKeyDown={handleKeyDown}
					onFocus={interaction.handleFocus}
					onBlur={interaction.handleBlur}
					disabled={!!isDisabled}
					placeholder={signalValue.value?.length ? '' : placeholder}
				/>
			</div>

			{/* FIX: LabelWrapper moved to end */}
			<LabelWrapper
				id={id}
				label={label}
				active={interaction.focused.value ||
					(signalValue.value && signalValue.value.length > 0) ||
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
