import { useEffect, useRef, useState } from 'preact/hooks';
import { ComponentChildren } from 'preact';
import '../../styles/overlays/popover.css';

interface PopoverProps {
	isOpen: boolean;
	onClose: () => void;
	trigger: ComponentChildren;
	content: ComponentChildren;
	className?: string;
	/** Force a position or leave auto */
	position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

export function Popover({
	isOpen,
	onClose,
	trigger,
	content,
	className,
	position,
}: PopoverProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const [calculatedPos, setCalculatedPos] = useState<'top' | 'bottom'>('bottom');

	// Auto-Flip Logic
	useEffect(() => {
		if (isOpen && containerRef.current && contentRef.current) {
			const rect = containerRef.current.getBoundingClientRect();
			const contentHeight = 350; // Approx max height of calendar
			const spaceBelow = window.innerHeight - rect.bottom;

			// If explicit override is not set, calculate
			if (!position) {
				if (spaceBelow < contentHeight && rect.top > contentHeight) {
					setCalculatedPos('top');
				} else {
					setCalculatedPos('bottom');
				}
			}
		}
	}, [isOpen, position]);

	// Click Outside & Escape
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				isOpen &&
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				onClose();
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (isOpen && event.key === 'Escape') {
				onClose();
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [isOpen, onClose]);

	// Resolve final classes
	const align = position?.includes('right') ? 'right' : 'left';
	const vert = position?.includes('top')
		? 'top'
		: (position?.includes('bottom') ? 'bottom' : calculatedPos);

	return (
		<div className={`popover-wrapper ${className || ''}`} ref={containerRef}>
			<div className='popover-trigger'>
				{trigger}
			</div>

			<div
				ref={contentRef}
				className={`popover-content popover-content--${vert} popover-content--${align} ${
					isOpen ? 'popover-content--open' : ''
				}`}
			>
				{content}
			</div>
		</div>
	);
}
