import { TargetedEvent } from 'preact';
import { Signal, useSignal } from '@preact/signals';
import { MoneyFieldProps } from '../types/components/money-field.ts';
import { TextField } from './TextField.tsx';
import { useCurrencyMask } from '../hooks/useCurrencyMask.ts';

export function MoneyField(props: MoneyFieldProps) {
	const {
		value,
		defaultValue,
		onChange,
		onBlur,
		onFocus,
		currency = 'USD',
		locale = 'en-US',
		placeholder = '0.00',
		...rest
	} = props;

	const isValueSignal = value instanceof Signal;
	const internalSignal = useSignal(
		isValueSignal ? value.peek() : (value ?? defaultValue),
	);

	if (!isValueSignal && value !== undefined && value !== internalSignal.peek()) {
		internalSignal.value = value;
	}

	const signalValue = isValueSignal ? value : internalSignal;

	const { displayValue, handleBlur, handleFocus, handleChange, setProgrammaticValue } =
		useCurrencyMask(
			signalValue as Signal<number | undefined>,
			currency,
			locale,
		);

	const lastX = useSignal<number | null>(null);
	const lastTime = useSignal<number | null>(null);

	const handlePointerDown = (e: PointerEvent) => {
		const target = e.currentTarget as HTMLElement;
		target.setPointerCapture(e.pointerId);
		lastX.value = e.clientX;
		lastTime.value = performance.now();
		e.preventDefault();
	};

	const handlePointerMove = (e: PointerEvent) => {
		if (lastX.value === null || lastTime.value === null) return;

		const currentX = e.clientX;
		const currentTime = performance.now();

		const dx = currentX - lastX.value;
		const dt = currentTime - lastTime.value;

		if (dt > 0 && dx !== 0) {
			const velocity = Math.abs(dx / dt);

			const speedMultiplier = 1 + Math.log1p(velocity * 10);

			const delta = dx * 0.2 * speedMultiplier;

			const currentVal = signalValue.peek() ?? 0;
			const newVal = Math.max(0, currentVal + delta);

			setProgrammaticValue(newVal);
			onChange?.(newVal);
		}

		lastX.value = currentX;
		lastTime.value = currentTime;
	};

	const handlePointerUp = (e: PointerEvent) => {
		if (lastX.value !== null) {
			const target = e.currentTarget as HTMLElement;
			target.releasePointerCapture(e.pointerId);
			lastX.value = null;
			lastTime.value = null;
		}
	};

	return (
		<TextField
			{...rest}
			value={displayValue}
			placeholder={placeholder}
			onInput={(e: TargetedEvent<HTMLInputElement>) => {
				handleChange(e.currentTarget.value);
				onChange?.(signalValue.peek() as number);
			}}
			onBlur={(e) => {
				handleBlur();
				onBlur?.(e);
			}}
			onFocus={(e) => {
				handleFocus();
				onFocus?.(e);
			}}
			prefixProps={{
				onPointerDown: handlePointerDown,
				onPointerMove: handlePointerMove,
				onPointerUp: handlePointerUp,
				style: { cursor: 'ew-resize', touchAction: 'none' },
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
