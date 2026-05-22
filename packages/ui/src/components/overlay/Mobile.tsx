// #region 1. Imports
import { useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { JSX } from 'preact';
import { OverlayProps } from '../../types/components/overlay.ts';
import { OverlayPortal } from './OverlayPortal.tsx';
import { useOverlayA11y } from '../../hooks/useOverlayA11y.ts';
// #endregion

/**
 * @function Mobile
 * @description A Bottom Sheet (iOS Style) drawer optimized for mobile interactions.
 * Features a high-performance, signal-driven pointer tracking engine for height adjustment.
 */
export function Mobile(props: OverlayProps) {
	const {
		isOpen,
		onClose,
		title,
		isSticky,
		snapPoints = [0.5, 0.95],
		children,
		className,
		style,
	} = props;

	// #region 2. State & Refs
	const containerRef = useRef<HTMLDivElement>(null);
	const heightPx = useSignal(0);
	const isDragging = useSignal(false);
	const isAnimating = useSignal(false);

	// Physics and tracking refs
	const startY = useRef(0);
	const startHeight = useRef(0);
	const lastY = useRef(0);
	const lastTime = useRef(0);
	const velocity = useRef(0);
	// #endregion

	// Apply Accessibility (Focus Trap & ESC to close)
	useOverlayA11y(containerRef, isOpen, onClose);

	// #region 3. Lifecycle & Initialization
	useEffect(() => {
		if (isOpen && typeof window !== 'undefined') {
			isAnimating.value = true;
			requestAnimationFrame(() => {
				heightPx.value = window.innerHeight * snapPoints[0];
				setTimeout(() => {
					isAnimating.value = false;
				}, 300);
			});
		} else {
			heightPx.value = 0;
			velocity.current = 0;
		}
	}, [isOpen, snapPoints]);
	// #endregion

	// #region 4. Pointer Interaction Engine
	const handlePointerDown = (e: JSX.TargetedPointerEvent<HTMLDivElement>) => {
		isDragging.value = true;
		isAnimating.value = false;

		startY.current = e.clientY;
		startHeight.current = heightPx.value;
		lastY.current = e.clientY;
		lastTime.current = Date.now();

		e.currentTarget.setPointerCapture(e.pointerId);
	};

	const handlePointerMove = (e: JSX.TargetedPointerEvent<HTMLDivElement>) => {
		if (!isDragging.value) return;

		const deltaY = startY.current - e.clientY;
		const newHeight = Math.max(0, startHeight.current + deltaY);

		const maxHeight = window.innerHeight * snapPoints[snapPoints.length - 1];
		heightPx.value = newHeight > maxHeight ? maxHeight + (newHeight - maxHeight) * 0.2 : newHeight;

		const now = Date.now();
		const dt = now - lastTime.current;
		if (dt > 0) {
			velocity.current = (e.clientY - lastY.current) / dt;
			lastY.current = e.clientY;
			lastTime.current = now;
		}
	};

	const handlePointerUp = (e: JSX.TargetedPointerEvent<HTMLDivElement>) => {
		if (!isDragging.value) return;
		isDragging.value = false;
		isAnimating.value = true;
		e.currentTarget.releasePointerCapture(e.pointerId);

		if (velocity.current > 0.8) {
			heightPx.value = 0;
			if (onClose) setTimeout(onClose, 300);
			return;
		}

		const currentHeight = heightPx.value;
		const targetHeights = snapPoints.map((p) => window.innerHeight * p);

		const closest = targetHeights.reduce((prev, curr) =>
			Math.abs(curr - currentHeight) < Math.abs(prev - currentHeight) ? curr : prev
		);

		if (currentHeight < targetHeights[0] * 0.5 && onClose) {
			heightPx.value = 0;
			setTimeout(onClose, 300);
			return;
		}

		heightPx.value = closest;
		setTimeout(() => {
			isAnimating.value = false;
		}, 300);
	};
	// #endregion

	return (
		<OverlayPortal isOpen={isOpen} onClose={onClose} isSticky={isSticky}>
			<div
				ref={containerRef}
				className={`overlay-mobile ${isAnimating.value ? 'overlay-mobile--animating' : ''} ${
					className || ''
				}`}
				style={{
					height: `${heightPx.value}px`,
					...style,
				}}
				role='dialog'
				aria-modal='true'
				aria-labelledby={title ? 'mobile-title' : undefined}
				tabIndex={-1}
			>
				<div
					className='overlay-mobile__handle-area'
					onPointerDown={handlePointerDown}
					onPointerMove={handlePointerMove}
					onPointerUp={handlePointerUp}
					onPointerCancel={handlePointerUp}
				>
					<div className='overlay-mobile__handle' />
				</div>

				{title && (
					<div className='overlay-mobile__header'>
						<h2 id='mobile-title' className='overlay-mobile__title'>{title}</h2>
					</div>
				)}

				<div className='overlay-mobile__body'>
					{children}
				</div>
			</div>
		</OverlayPortal>
	);
}
