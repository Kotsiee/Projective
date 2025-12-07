import { TargetedMouseEvent } from 'preact';
import { IconChevronDown } from '@tabler/icons-preact';
import { AccordionTriggerProps } from '../../types/components/accordion.ts';
import { useAccordionContext } from './Accordion.tsx';
import { useAccordionItemContext } from './AccordionItem.tsx';

export function AccordionTrigger({
	children,
	className,
	style,
	subtitle,
	startIcon,
	actions,
	icon,
	rotateIcon = true,
}: AccordionTriggerProps) {
	const { toggle } = useAccordionContext();
	const { value, isOpen, disabled } = useAccordionItemContext();

	const handleClick = (_e: TargetedMouseEvent<HTMLButtonElement>) => {
		if (disabled.value) return;
		toggle(value);
	};

	const handleActionClick = (e: TargetedMouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
	};

	const chevron = icon === undefined ? <IconChevronDown size={18} /> : icon;

	return (
		<h3 className='accordion__header'>
			<button
				type='button'
				className={`accordion__trigger ${className || ''}`}
				style={style}
				onClick={handleClick}
				aria-expanded={isOpen.value}
				disabled={disabled.value}
				data-state={isOpen.value ? 'open' : 'closed'}
				data-accordion-trigger='' // Hook for keyboard nav
			>
				{/* 1. Start Icon */}
				{startIcon && (
					<span className='accordion__start-icon'>
						{startIcon}
					</span>
				)}

				{/* 2. Main Content */}
				<div className='accordion__trigger-text'>
					<span className='accordion__title'>{children}</span>
					{subtitle && <span className='accordion__subtitle'>{subtitle}</span>}
				</div>

				{/* 3. Actions & Chevron */}
				<div className='accordion__end-section'>
					{actions && (
						<div
							className='accordion__actions'
							onClick={handleActionClick}
							onKeyDown={(e) => e.stopPropagation()} // Stop Enter/Space from toggling accordion
						>
							{actions}
						</div>
					)}

					{chevron && (
						<span
							className={`accordion__icon ${
								rotateIcon && isOpen.value ? 'accordion__icon--rotated' : ''
							}`}
							aria-hidden='true'
						>
							{chevron}
						</span>
					)}
				</div>
			</button>
		</h3>
	);
}
