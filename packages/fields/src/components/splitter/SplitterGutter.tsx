import { JSX } from 'preact';
import { useSplitterContext } from './Splitter.tsx';
import { SplitterGutterProps } from '../../types/components/splitter.ts';

export function SplitterGutter({ index, direction }: SplitterGutterProps) {
	const { startResize, moveSplitter, toggleCollapse } = useSplitterContext();

	// Mouse
	const handleMouseDown = (e: JSX.TargetedMouseEvent<HTMLDivElement>) => {
		if (e.button !== 0) return;
		e.preventDefault();
		startResize(index, e.clientX, e.clientY);
	};

	// Touch
	const handleTouchStart = (e: JSX.TargetedTouchEvent<HTMLDivElement>) => {
		// Prevent default to stop scrolling/selection
		// e.preventDefault();
		// Actually, we preventDefault on move, usually okay on start unless it blocks scrolling
		// If we want to allow scrolling if they miss the handle, we don't preventDefault here.
		// BUT for a splitter, grabbing it usually means intent to resize.
		if (e.touches.length === 1) {
			const touch = e.touches[0];
			startResize(index, touch.clientX, touch.clientY);
		}
	};

	const handleDblClick = (e: MouseEvent) => {
		e.preventDefault();
		toggleCollapse(index);
	};

	// Keyboard
	const handleKeyDown = (e: JSX.TargetedKeyboardEvent<HTMLDivElement>) => {
		let delta = 0;
		const step = 2; // 2% per keypress
		const largeStep = 10; // Shift key

		const val = e.shiftKey ? largeStep : step;

		if (direction === 'horizontal') {
			if (e.key === 'ArrowLeft') delta = -val;
			if (e.key === 'ArrowRight') delta = val;
		} else {
			if (e.key === 'ArrowUp') delta = -val;
			if (e.key === 'ArrowDown') delta = val;
		}

		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			toggleCollapse(index);
			return;
		}

		if (delta !== 0) {
			e.preventDefault();
			moveSplitter(index, delta);
		}
	};

	return (
		<div
			className={`splitter__gutter splitter__gutter--${direction}`}
			onMouseDown={handleMouseDown}
			onTouchStart={handleTouchStart}
			onDblClick={handleDblClick}
			onKeyDown={handleKeyDown}
			// Accessibility
			role='separator'
			aria-orientation={direction}
			aria-label='Resize Splitter'
			aria-controls={`pane-${index} pane-${index + 1}`}
			tabIndex={0}
		>
			<div className='splitter__gutter-handle' />
			{/* Invisible Hit Area for easier touch/mouse grabbing */}
			<div className='splitter__gutter-hitbox' />
		</div>
	);
}
