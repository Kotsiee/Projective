import { Signal, useSignal } from "@preact/signals";

export function useCurrencyMask(
    value: Signal<number | undefined>,
    currency = "USD",
    locale = "en-US",
) {
    const displayValue = useSignal("");

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat(locale, {
            style: "currency",
            currency: currency,
        }).format(val);
    };

    const parseCurrency = (val: string): number => {
        // Remove non-numeric characters except decimal point
        const clean = val.replace(/[^0-9.-]+/g, "");
        return parseFloat(clean);
    };

    const handleBlur = () => {
        if (value.value !== undefined && !isNaN(value.value)) {
            displayValue.value = formatCurrency(value.value);
        } else {
            displayValue.value = "";
        }
    };

    const handleFocus = () => {
        if (value.value !== undefined && !isNaN(value.value)) {
            displayValue.value = value.value.toString();
        } else {
            displayValue.value = "";
        }
    };

    const handleChange = (val: string) => {
        displayValue.value = val;
        const parsed = parseCurrency(val);
        if (!isNaN(parsed)) {
            value.value = parsed;
        } else {
            value.value = undefined;
        }
    };

    // Initialize display value
    if (value.value !== undefined && !displayValue.value) {
        displayValue.value = formatCurrency(value.value);
    }

    return {
        displayValue,
        handleBlur,
        handleFocus,
        handleChange,
    };
}
