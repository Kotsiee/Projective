import { AccordionContentProps } from '../../types/components/accordion.ts';
import { useAccordionItemContext } from './AccordionItem.tsx';

export function AccordionContent({
	children,
	className,
	style,
	keepMounted = true,
}: AccordionContentProps) {
	const { isOpen } = useAccordionItemContext();

	// Performance optimization:
	// If keepMounted is false, we unmount the DOM nodes when closed.
	// Note: CSS Grid animations only work if the element exists.
	// Unmounting removes the exit animation.
	if (!keepMounted && !isOpen.value) {
		return null;
	}

	return (
		<div
			className={`accordion__content ${isOpen.value ? 'accordion__content--open' : ''} ${
				className || ''
			}`}
			style={style}
			data-state={isOpen.value ? 'open' : 'closed'}
			role='region'
		>
			<div className='accordion__content-inner'>
				{children}
			</div>
		</div>
	);
}
