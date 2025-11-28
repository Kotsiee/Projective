import '@styles/components/fields/TextField.css';
import { useComputed, useSignal } from '@preact/signals';
import { useEffect, useLayoutEffect, useRef } from 'preact/hooks';
import {
	IconCreditCard,
	IconCurrencyDollar,
	IconEye,
	IconEyeOff,
	IconX,
} from '@tabler/icons-preact';
import { TextFieldProps } from '@projective/types';
import { useTextMask } from '@hooks/fields/useTextMask.ts';
import { formatCurrency, isValidCreditCard, parseNumber } from '@projective/shared';

export default function TextField(props: TextFieldProps) {
	const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
	const isFocused = useSignal(false);
	const isPasswordVisible = useSignal(false);
	const internalError = useSignal<string>('');

	// --- Variant Logic ---
	const isCurrency = props.variant === 'currency';
	const isCreditCard = props.variant === 'credit-card';

	const activeMask = isCreditCard ? (props.mask || '9999 9999 9999 9999') : props.mask;
	const activeInputMode = isCurrency ? 'decimal' : (isCreditCard ? 'numeric' : props.inputMode);
	const activeIconLeft = isCreditCard && !props.prefix && !props.iconLeft
		? <IconCreditCard size={18} />
		: (isCurrency && !props.prefix && !props.iconLeft
			? <IconCurrencyDollar size={18} />
			: props.iconLeft);

	// --- Value Management ---
	const rawValue = props.value?.toString() || '';
	const displayValue = useSignal(rawValue);

	useEffect(() => {
		if (!isFocused.value) {
			if (isCurrency && rawValue) {
				displayValue.value = formatCurrency(rawValue);
			} else {
				displayValue.value = rawValue;
			}
		}
	}, [rawValue, isCurrency]);

	// --- Hooks ---
	const { handleMaskInput } = useTextMask({
		mask: activeMask,
		value: displayValue.value,
		onChange: (val) => {
			displayValue.value = val;
			props.onChange?.(val);
		},
		ref: inputRef,
	});

	// --- Handlers ---
	const handleInput = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const val = target.value;

		if (activeMask && !props.multiline) {
			handleMaskInput(e);
			return;
		}

		displayValue.value = val;

		if (isCurrency) {
			props.onChange?.(parseNumber(val));
		} else {
			props.onChange?.(val);
		}

		if (props.multiline) handleAutoGrow();
	};

	const handleFocus = (e: FocusEvent) => {
		isFocused.value = true;
		if (isCurrency) displayValue.value = parseNumber(rawValue);
		props.onFocus?.(e);
	};

	const handleBlur = (e: FocusEvent) => {
		isFocused.value = false;
		if (isCurrency) displayValue.value = formatCurrency(rawValue);
		if (isCreditCard) {
			internalError.value = (rawValue.length > 0 && !isValidCreditCard(rawValue))
				? 'Invalid card number'
				: '';
		}
		props.onBlur?.(e);
	};

	const handleAutoGrow = () => {
		if (props.multiline && props.autoGrow && inputRef.current) {
			const el = inputRef.current;
			el.style.height = 'auto';
			el.style.height = `${el.scrollHeight}px`;
		}
	};

	useLayoutEffect(() => {
		if (props.multiline && props.autoGrow) handleAutoGrow();
	}, [displayValue.value, props.multiline, props.autoGrow]);

	// --- Render ---
	const currentType = props.type === 'password' && isPasswordVisible.value
		? 'text'
		: (props.type || 'text');

	const shouldFloat = isFocused.value || displayValue.value.length > 0 || !!props.placeholder;
	const activeError = internalError.value || props.error;

	const containerClasses = [
		'text-field',
		props.className,
		activeError ? 'text-field--error' : '',
		props.success ? 'text-field--success' : '',
		props.disabled ? 'text-field--disabled' : '',
		props.floatingLabel ? 'text-field--floating' : '',
		shouldFloat ? 'text-field--active' : '',
		props.multiline ? 'text-field--multiline' : '',
		props.autoGrow ? 'text-field--auto-grow' : '', // Explicit class for CSS
	].filter(Boolean).join(' ');

	return (
		<div className={containerClasses}>
			{props.label && (
				<label className='text-field__label' htmlFor={props.id}>
					{props.label} {props.required && <span className='text-field__req'>*</span>}
				</label>
			)}

			<div className='text-field__wrapper'>
				{(props.prefix || activeIconLeft) && (
					<div className='text-field__addon text-field__addon--left'>
						{props.prefix || activeIconLeft}
					</div>
				)}

				{props.multiline
					? (
						<textarea
							ref={inputRef as any}
							id={props.id}
							className='text-field__input text-field__input--textarea'
							value={displayValue.value}
							placeholder={props.floatingLabel && !isFocused.value ? '' : props.placeholder}
							disabled={props.disabled}
							readOnly={props.readonly}
							maxLength={props.maxLength}
							rows={props.rows || 3}
							onInput={handleInput}
							onFocus={handleFocus}
							onBlur={handleBlur}
							onKeyDown={props.onKeyDown}
						/>
					)
					: (
						<input
							ref={inputRef as any}
							id={props.id}
							className='text-field__input'
							type={currentType}
							inputMode={activeInputMode}
							value={displayValue.value}
							placeholder={props.floatingLabel && !isFocused.value ? '' : props.placeholder}
							disabled={props.disabled}
							readOnly={props.readonly}
							maxLength={props.maxLength}
							onInput={handleInput}
							onFocus={handleFocus}
							onBlur={handleBlur}
							onKeyDown={props.onKeyDown}
						/>
					)}

				<div className='text-field__actions'>
					{props.clearable && displayValue.value.length > 0 && !props.disabled && !props.readonly &&
						(
							<button
								type='button'
								className='text-field__action-btn'
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									props.onChange?.('');
									displayValue.value = '';
									inputRef.current?.focus();
								}}
								tabIndex={-1}
								aria-label='Clear'
							>
								<IconX size={16} />
							</button>
						)}

					{!props.multiline && props.type === 'password' && props.showPasswordToggle &&
						!props.disabled && (
						<button
							type='button'
							className='text-field__action-btn'
							onClick={() => isPasswordVisible.value = !isPasswordVisible.value}
							tabIndex={-1}
						>
							{isPasswordVisible.value ? <IconEyeOff size={18} /> : <IconEye size={18} />}
						</button>
					)}

					{(props.suffix || props.iconRight) && (
						<div className='text-field__addon text-field__addon--right'>
							{props.suffix || props.iconRight}
						</div>
					)}
				</div>
			</div>

			<div className='text-field__footer'>
				<div className='text-field__messages'>
					{activeError && <span className='text-field__msg-error'>{activeError}</span>}
					{props.hint && !activeError && <span className='text-field__msg-hint'>{props.hint}</span>}
				</div>

				{props.showCount && props.maxLength && (
					<div className='text-field__counter'>
						{displayValue.value.length} / {props.maxLength}
					</div>
				)}
			</div>
		</div>
	);
}
