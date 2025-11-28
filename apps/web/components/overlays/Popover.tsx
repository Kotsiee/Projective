import { useEffect, useRef } from 'preact/hooks';
import { ComponentChildren } from 'preact';
import '@styles/components/overlays/Popover.css';

interface PopoverProps {
	isOpen: boolean;
	onClose: () => void;
	trigger: ComponentChildren;
	content: ComponentChildren;
	className?: string;
	position?: 'bottom-left' | 'bottom-right'; // Expandable later
}

export default function Popover({
	isOpen,
	onClose,
	trigger,
	content,
	className,
	position = 'bottom-left',
}: PopoverProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	// Click Outside to Close
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

		// Escape Key to Close
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

	return (
		<div className={`popover-wrapper ${className || ''}`} ref={containerRef}>
			{/* The Input/Button that toggles it */}
			<div className='popover-trigger'>
				{trigger}
			</div>

			{/* The Floating Content */}
			{isOpen && (
				<div className={`popover-content popover-content--${position}`}>
					{content}
				</div>
			)}
		</div>
	);
}
