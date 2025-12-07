import { JSX } from 'preact';
import { Signal, useSignal } from '@preact/signals';
import { MoneyFieldProps } from '../types/components/money-field.ts';
import { TextField } from './TextField.tsx';
import { useCurrencyMask } from '../hooks/useCurrencyMask.ts';

export function MoneyField(props: MoneyFieldProps) {
	const {
		value,
		defaultValue,
		onChange,
		currency = 'USD',
		locale = 'en-US',
		...rest
	} = props;

	// Normalize signal
	const isValueSignal = value instanceof Signal;
	const internalSignal = useSignal(
		isValueSignal ? value.peek() : (value ?? defaultValue),
	);

	if (!isValueSignal && value !== undefined && value !== internalSignal.peek()) {
		internalSignal.value = value;
	}

	const signalValue = isValueSignal ? value : internalSignal;

	const { displayValue, handleBlur, handleFocus, handleChange } = useCurrencyMask(
		signalValue as Signal<number | undefined>,
		currency,
		locale,
	);

	return (
		<TextField
			{...rest}
			value={displayValue}
			onInput={(e: JSX.TargetedEvent<HTMLInputElement>) => {
				handleChange(e.currentTarget.value);
				const val = signalValue.peek();
				if (val !== undefined) {
					onChange?.(val);
				}
			}}
			onBlur={() => {
				handleBlur();
			}}
			onFocus={() => {
				handleFocus();
			}}
			prefix={
				<span style={{ fontSize: '0.9em', fontWeight: 'bold' }}>
					{new Intl.NumberFormat(locale, {
						style: 'currency',
						currency,
					}).formatToParts(0).find((p) => p.type === 'currency')
						?.value}
				</span>
			}
		/>
	);
}
