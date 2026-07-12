import { useRef } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import {
	MIDDLE_SIDE_MAX,
	MIDDLE_SIDE_MIN,
	useNavigationContext,
} from '../contexts/NavigationContext.tsx';

/**
 * @island NavigationSplitter
 * @description The click-and-drag rail dividing the website shell from the workspace
 * canvas. Dragging resizes the contextual middle-navigation panel, which in turn snaps
 * between the three density stages (icon-rail → icon-grid → master-detail).
 *
 * Performance: pointer moves are coalesced through a single `requestAnimationFrame`, so at
 * most one width write (one style/layout recalc) happens per frame no matter how fast the
 * pointer fires. Width transitions are frozen during the drag (via `data-splitter-resizing`
 * on the shell root) so the panel tracks the pointer 1:1; the luxe-curve transition only
 * plays on the discrete density snaps and on release.
 *
 * @returns {preact.JSX.Element} The full-height resize gutter.
 */
export default function NavigationSplitter() {
	const { middleSideWidth, setMiddleSideWidth, setSplitterResizing } = useNavigationContext();

	const dragging = useSignal(false);
	const frame = useRef<number | null>(null);
	const latestX = useRef(0);
	const startX = useRef(0);
	const startWidth = useRef(0);

	// rAF-coalesced apply — reads only the last pointer position observed this frame.
	const applyFrame = () => {
		frame.current = null;
		setMiddleSideWidth(startWidth.current + (latestX.current - startX.current));
	};

	const handlePointerDown = (e: PointerEvent) => {
		if (e.button !== 0) return;
		e.preventDefault();

		startX.current = e.clientX;
		startWidth.current = middleSideWidth.value;
		dragging.value = true;
		setSplitterResizing(true);
		document.body.style.userSelect = 'none';
		document.body.style.cursor = 'col-resize';

		const onMove = (ev: PointerEvent) => {
			latestX.current = ev.clientX;
			if (frame.current == null) frame.current = requestAnimationFrame(applyFrame);
		};

		const onUp = () => {
			if (frame.current != null) {
				cancelAnimationFrame(frame.current);
				frame.current = null;
			}
			dragging.value = false;
			setSplitterResizing(false);
			document.body.style.userSelect = '';
			document.body.style.cursor = '';
			document.removeEventListener('pointermove', onMove);
			document.removeEventListener('pointerup', onUp);
		};

		document.addEventListener('pointermove', onMove);
		document.addEventListener('pointerup', onUp);
	};

	// Keyboard resize — a11y parity with the pointer drag (arrows nudge, Shift jumps, Home/End clamp).
	const handleKeyDown = (e: KeyboardEvent) => {
		const step = e.shiftKey ? 32 : 12;
		switch (e.key) {
			case 'ArrowLeft':
				e.preventDefault();
				setMiddleSideWidth(middleSideWidth.value - step);
				break;
			case 'ArrowRight':
				e.preventDefault();
				setMiddleSideWidth(middleSideWidth.value + step);
				break;
			case 'Home':
				e.preventDefault();
				setMiddleSideWidth(MIDDLE_SIDE_MIN);
				break;
			case 'End':
				e.preventDefault();
				setMiddleSideWidth(MIDDLE_SIDE_MAX);
				break;
		}
	};

	return (
		<div
			class='navigation__splitter'
			data-dragging={dragging.value}
			role='separator'
			aria-orientation='vertical'
			aria-label='Resize navigation panel'
			aria-valuenow={Math.round(middleSideWidth.value)}
			aria-valuemin={MIDDLE_SIDE_MIN}
			aria-valuemax={MIDDLE_SIDE_MAX}
			tabIndex={0}
			onPointerDown={handlePointerDown}
			onKeyDown={handleKeyDown}
		>
			<div class='navigation__splitter__handle' />
		</div>
	);
}
