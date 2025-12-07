import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { useComputed } from '@preact/signals';
import { AccordionItemContextValue, AccordionItemProps } from '../../types/components/accordion.ts';
import { useAccordionContext } from './Accordion.tsx';

const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

export function useAccordionItemContext() {
	const ctx = useContext(AccordionItemContext);
	if (!ctx) throw new Error('Accordion Sub-components must be within an AccordionItem');
	return ctx;
}

export function AccordionItem({
	value,
	children,
	disabled,
	className,
	style,
}: AccordionItemProps) {
	const { expandedValues, disabled: rootDisabled } = useAccordionContext();

	const isOpen = useComputed(() => expandedValues.value.has(value));

	const isDisabled = useComputed(() => {
		const localDisabled = disabled instanceof Object && 'value' in disabled
			? disabled.value
			: disabled;
		return rootDisabled.value || !!localDisabled;
	});

	return (
		<AccordionItemContext.Provider value={{ value, isOpen, disabled: isDisabled }}>
			<div
				className={`accordion__item ${isOpen.value ? 'accordion__item--open' : ''} ${
					isDisabled.value ? 'accordion__item--disabled' : ''
				} ${className || ''}`}
				data-state={isOpen.value ? 'open' : 'closed'}
				style={style}
			>
				{children}
			</div>
		</AccordionItemContext.Provider>
	);
}
