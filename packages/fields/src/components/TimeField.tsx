import '../styles/fields/date-field.css';
import { computed, Signal, useSignal } from '@preact/signals';
import { TimeFieldProps, TimeValue } from '../types/components/time-field.ts';
import { useInteraction } from '../hooks/useInteraction.ts';
import { useFieldState } from '../hooks/useFieldState.ts';
import { AdornmentWrapper } from '../wrappers/AdornmentWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { DateTime } from '@projective/types';
import { Popover } from './overlays/Popover.tsx';
import { TimeClock } from './datetime/TimeClock.tsx';
import { TextField } from './TextField.tsx';
import { IconClock } from '@tabler/icons-preact';

export function TimeField(props: TimeFieldProps) {
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
		variant = 'popup',
		selectionMode = 'single',
	} = props;

	// FIX: Explicitly type the field state to allow DateTime arrays
	const fieldState = useFieldState<TimeValue | undefined>({
		value,
		defaultValue,
		required,
		disabled,
		error,
		onChange: onChange as (val: TimeValue | undefined) => void,
	});

	const interaction = useInteraction(fieldState.value.value);
	const isOpen = useSignal(false);

	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const errorMessage = fieldState.error.value;

	const displayValue = computed(() => {
		const val = fieldState.value.value;
		if (!val) return '';

		if (Array.isArray(val)) {
			if (val.length === 0) return '';
			if (val.length === 1) return val[0].toFormat('HH:mm');
			return `${val.length} times selected`;
		}

		return (val as DateTime).toFormat('HH:mm');
	});

	const handleTimeSelect = (date: TimeValue) => {
		fieldState.setValue(date);

		// Auto-close logic
		if (selectionMode === 'single' && !Array.isArray(date)) {
			// Small delay to allow visual feedback
			setTimeout(() => {
				isOpen.value = false;
				interaction.handleBlur();
			}, 100);
		}
	};

	// --- Inline Variant ---
	if (variant === 'inline') {
		return (
			<div className={`field-date field-date--inline ${className || ''}`} style={style}>
				<TimeClock
					value={fieldState.value.value}
					onChange={handleTimeSelect}
					selectionMode={selectionMode}
				/>
				<MessageWrapper error={error} hint={hint} warning={warning} info={info} />
			</div>
		);
	}

	// --- Popup Variant ---
	return (
		<div className={`field-date ${className || ''}`} style={style}>
			<Popover
				isOpen={isOpen.value}
				onClose={() => {
					isOpen.value = false;
					interaction.handleBlur();
				}}
				trigger={
					<div onClick={() => !isDisabled && (isOpen.value = !isOpen.value)}>
						<TextField
							id={id}
							label={label}
							value={displayValue.value}
							placeholder={placeholder || 'HH:MM'}
							error={errorMessage}
							disabled={isDisabled}
							required={required}
							floating={floating}
							position={position}
							floatingRule={floatingRule}
							readonly
							suffix={
								<AdornmentWrapper
									position='suffix'
									onClick={(e) => {
										e.stopPropagation();
										!isDisabled && (isOpen.value = !isOpen.value);
									}}
								>
									<IconClock size={18} />
								</AdornmentWrapper>
							}
							onFocus={interaction.handleFocus}
							onBlur={() => {}}
						/>
					</div>
				}
				content={
					<TimeClock
						value={fieldState.value.value}
						onChange={handleTimeSelect}
						selectionMode={selectionMode}
					/>
				}
			/>
			<MessageWrapper error={error} hint={hint} warning={warning} info={info} />
		</div>
	);
}
