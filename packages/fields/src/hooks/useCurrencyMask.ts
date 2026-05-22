import { Signal, useSignal } from '@preact/signals';

export function useCurrencyMask(
	value: Signal<number | undefined>,
	currency = 'USD',
	locale = 'en-US',
) {
	const displayValue = useSignal('');

	const formatCurrency = (val: number) => {
		return new Intl.NumberFormat(locale, {
			style: 'decimal',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(val);
	};

	const handleBlur = () => {
		if (value.value !== undefined && !isNaN(value.value)) {
			displayValue.value = formatCurrency(value.value);
		} else {
			value.value = 0;
			displayValue.value = formatCurrency(0);
		}
	};

	const handleFocus = () => {
		if (value.value !== undefined && !isNaN(value.value) && value.value !== 0) {
			displayValue.value = value.value.toString();
		} else {
			displayValue.value = '';
		}
	};

	const handleChange = (val: string) => {
		let sanitized = val.replace(/[^0-9.]/g, '');

		const parts = sanitized.split('.');
		if (parts.length > 2) {
			sanitized = parts[0] + '.' + parts.slice(1).join('');
		}

		displayValue.value = sanitized;

		if (sanitized === '' || sanitized === '.') {
			value.value = undefined;
		} else {
			value.value = parseFloat(sanitized);
		}
	};

	const setProgrammaticValue = (newVal: number) => {
		const rounded = Math.round(newVal * 100) / 100;
		value.value = rounded;
		displayValue.value = formatCurrency(rounded);
	};

	if (value.value !== undefined && !displayValue.value) {
		displayValue.value = formatCurrency(value.value);
	}

	return {
		displayValue,
		handleBlur,
		handleFocus,
		handleChange,
		setProgrammaticValue,
	};
}
