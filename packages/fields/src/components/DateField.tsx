import '../styles/fields/date-field.css';
import { computed, Signal, useSignal } from '@preact/signals';
import { DateFieldProps, DateValue } from '../types/components/date-field.ts';
import { useInteraction } from '../hooks/useInteraction.ts';
import { useFieldState } from '../hooks/useFieldState.ts';
import { AdornmentWrapper } from '../wrappers/AdornmentWrapper.tsx';
import { MessageWrapper } from '../wrappers/MessageWrapper.tsx';
import { DateTime } from '@projective/types';
import { Popover } from './overlays/Popover.tsx';
import { Calendar } from './datetime/Calendar.tsx';
import { TextField } from './TextField.tsx';
import { IconCalendar } from '@tabler/icons-preact';

export function DateField(props: DateFieldProps) {
	const {
		id,
		label,
		value,
		defaultValue,
		onChange,
		minDate,
		maxDate,
		format = 'yyyy-MM-dd',
		error,
		disabled,
		prefix,
		suffix,
		onPrefixClick,
		onSuffixClick,
		className,
		style,
		position,
		floatingRule,
		required,
		floating,
		hint,
		warning,
		info,
		variant = 'popup', // Default to existing behavior
		selectionMode = 'single',
		modifiers,
	} = props;

	const fieldState = useFieldState({
		value,
		defaultValue,
		required,
		disabled,
		error,
		onChange,
	});

	const interaction = useInteraction(fieldState.value.value);
	const isOpen = useSignal(false);

	const isDisabled = disabled instanceof Signal ? disabled.value : disabled;
	const errorMessage = fieldState.error.value;

	// Computed string value for the input display
	const displayValue = computed(() => {
		const val = fieldState.value.value;
		if (!val) return '';

		if (Array.isArray(val)) {
			// Range
			if (selectionMode === 'range' && val.length === 2) {
				const start = val[0] ? val[0].toFormat(format) : '...';
				const end = val[1] ? val[1].toFormat(format) : '...';
				return `${start} - ${end}`;
			}
			// Multiple
			if (selectionMode === 'multiple') {
				return `${val.length} dates selected`;
			}
		}
		// Single
		if (val instanceof DateTime) return val.toFormat(format);

		return '';
	});

	const handleDateSelect = (date: DateValue) => {
		fieldState.setValue(date);

		// Auto-close popover rules:
		// Single: Close on select
		// Range: Close if both start/end selected? Maybe keep open for adjustments.
		// Multiple: Keep open.
		if (selectionMode === 'single') {
			isOpen.value = false;
			interaction.handleBlur();
		}
	};

	// --- Render Logic Based on Variant ---

	if (variant === 'inline') {
		return (
			<div className={`field-date field-date--inline ${className || ''}`} style={style}>
				<Calendar
					value={fieldState.value.value}
					onChange={handleDateSelect}
					min={minDate}
					max={maxDate}
					selectionMode={selectionMode}
					modifiers={modifiers}
					className='field-date__calendar--inline'
				/>
				<MessageWrapper error={error} hint={hint} warning={warning} info={info} />
			</div>
		);
	}

	// Default: Popup Mode
	return (
		<div className={`field-date ${className || ''}`} style={style}>
			<Popover
				isOpen={isOpen.value}
				onClose={() => {
					isOpen.value = false;
					interaction.handleBlur();
				}}
				// Forward position prop if we want manual control, otherwise let Popover auto-flip
				trigger={
					<div onClick={() => !isDisabled && (isOpen.value = !isOpen.value)}>
						<TextField
							id={id}
							label={label}
							value={displayValue.value}
							placeholder={format.toUpperCase()}
							error={errorMessage}
							disabled={isDisabled}
							required={required}
							floating={floating}
							position={position}
							floatingRule={floatingRule}
							readonly // Prevent manual typing for complex modes for now
							suffix={
								<AdornmentWrapper
									position='suffix'
									onClick={(e) => {
										e.stopPropagation();
										!isDisabled && (isOpen.value = !isOpen.value);
									}}
								>
									{suffix || <IconCalendar size={18} />}
								</AdornmentWrapper>
							}
							prefix={prefix}
							onPrefixClick={onPrefixClick}
							onFocus={interaction.handleFocus}
							onBlur={() => {}}
						/>
					</div>
				}
				content={
					<Calendar
						value={fieldState.value.value}
						onChange={handleDateSelect}
						min={minDate}
						max={maxDate}
						selectionMode={selectionMode}
						modifiers={modifiers}
					/>
				}
			/>
			<MessageWrapper error={error} hint={hint} warning={warning} info={info} />
		</div>
	);
}
