import { createContext } from 'preact';
import { useContext, useRef } from 'preact/hooks';
import { AccordionContextValue, AccordionProps } from '../../types/components/accordion.ts';
import { useAccordion } from '../../hooks/useAccordion.ts';

const AccordionContext = createContext<AccordionContextValue | null>(null);

export function useAccordionContext() {
	const ctx = useContext(AccordionContext);
	if (!ctx) throw new Error('Accordion components must be used within an <Accordion>');
	return ctx;
}

export function Accordion({
	children,
	type = 'single',
	value,
	defaultValue,
	onValueChange,
	collapsible = false,
	disabled = false,
	variant = 'outlined',
	density = 'normal',
	className,
	style,
}: AccordionProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	const { expandedValues, toggle, expandAll, collapseAll, isDisabled } = useAccordion({
		value,
		defaultValue,
		onValueChange,
		type,
		collapsible,
		disabled,
	});

	// --- Keyboard Navigation ---
	const handleKeyDown = (e: KeyboardEvent) => {
		if (!containerRef.current) return;

		const key = e.key;
		const navKeys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
		if (!navKeys.includes(key)) return;

		// Find all triggers belonging to THIS accordion instance
		// We use scoped selector to try and avoid nested ones,
		// though strict nesting requires stopPropagation on the child.
		const triggers = Array.from(
			containerRef.current.querySelectorAll<HTMLButtonElement>(
				'[data-accordion-trigger]:not([disabled])',
			),
		);

		const activeElement = document.activeElement as HTMLButtonElement;
		const index = triggers.indexOf(activeElement);

		// If focus isn't on a trigger, ignore
		if (index === -1) return;

		e.preventDefault();
		e.stopPropagation(); // Stop parent accordions from handling this

		let nextIndex = index;
		switch (key) {
			case 'ArrowDown':
				nextIndex = (index + 1) % triggers.length;
				break;
			case 'ArrowUp':
				nextIndex = (index - 1 + triggers.length) % triggers.length;
				break;
			case 'Home':
				nextIndex = 0;
				break;
			case 'End':
				nextIndex = triggers.length - 1;
				break;
		}

		triggers[nextIndex]?.focus();
	};

	return (
		<AccordionContext.Provider
			value={{
				expandedValues,
				toggle,
				expandAll,
				collapseAll,
				disabled: isDisabled,
				collapsible,
				type,
				variant,
				density,
			}}
		>
			<div
				ref={containerRef}
				className={`accordion accordion--${variant} accordion--${density} ${className || ''}`}
				style={style}
				onKeyDown={handleKeyDown}
			>
				{children}
			</div>
		</AccordionContext.Provider>
	);
}
