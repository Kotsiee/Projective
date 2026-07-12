import { ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-preact';
import '../../styles/components/hscroll.css';

/* #region Types */
export interface HScrollProps {
	children: ComponentChildren;
	/** Accessible label for the horizontal region. */
	ariaLabel?: string;
	/** Track gap in px. @default 16 */
	gap?: number;
	/** Scroll-snap each child to the start. @default true */
	snap?: boolean;
	/** Show the hover prev/next affordances (desktop). @default true */
	controls?: boolean;
	/** Premium fade at the leading/trailing edges. @default true */
	fade?: boolean;
	class?: string;
	className?: string;
}
/* #endregion */

/** Transient, render-free drag bookkeeping. */
interface DragState {
	dragging: boolean;
	startX: number;
	startScroll: number;
	lastX: number;
	lastT: number;
	velocity: number;
	frame: number;
	moved: boolean;
}

/**
 * @function HScroll
 * @description A responsive, touch-and-drag horizontal scroll wrapper for skimming reels of cards
 * inline. Pointer-drag with momentum (velocity-decay inertia after release), native touch momentum,
 * premium fade edges that reveal/hide with scroll position, and hover prev/next affordances. Pure
 * markup on the server (SSR-safe); all motion wiring attaches after hydration. Feed it any children;
 * it owns only its own scroll behaviour.
 */
export function HScroll(props: HScrollProps) {
	const {
		children,
		ariaLabel,
		gap = 16,
		snap = true,
		controls = true,
		fade = true,
		class: klass,
		className,
	} = props;

	const trackRef = useRef<HTMLDivElement>(null);
	const drag = useRef<DragState>({
		dragging: false,
		startX: 0,
		startScroll: 0,
		lastX: 0,
		lastT: 0,
		velocity: 0,
		frame: 0,
		moved: false,
	});

	const atStart = useSignal(true);
	const atEnd = useSignal(false);
	const dragging = useSignal(false);

	const syncEdges = () => {
		const el = trackRef.current;
		if (!el) return;
		const max = el.scrollWidth - el.clientWidth;
		atStart.value = el.scrollLeft <= 1;
		atEnd.value = el.scrollLeft >= max - 1;
	};

	useEffect(() => {
		const el = trackRef.current;
		if (!el) return;
		syncEdges();

		const onResize = () => syncEdges();
		globalThis.addEventListener('resize', onResize);

		// A ResizeObserver catches late-arriving child media that changes scrollWidth.
		let ro: ResizeObserver | undefined;
		if (typeof ResizeObserver !== 'undefined') {
			ro = new ResizeObserver(() => syncEdges());
			ro.observe(el);
		}

		return () => {
			globalThis.removeEventListener('resize', onResize);
			ro?.disconnect();
			cancelAnimationFrame(drag.current.frame);
		};
	}, []);

	const stopMomentum = () => cancelAnimationFrame(drag.current.frame);

	const runMomentum = () => {
		const el = trackRef.current;
		const d = drag.current;
		if (!el) return;
		const step = () => {
			if (Math.abs(d.velocity) < 0.15) {
				syncEdges();
				return;
			}
			el.scrollLeft -= d.velocity;
			d.velocity *= 0.93;
			syncEdges();
			d.frame = requestAnimationFrame(step);
		};
		d.frame = requestAnimationFrame(step);
	};

	const onPointerDown = (e: PointerEvent) => {
		// Only hijack primary-button / touch drags; let wheels + right-click through.
		if (e.button !== 0) return;
		const el = trackRef.current;
		if (!el) return;
		stopMomentum();
		const d = drag.current;
		d.dragging = true;
		d.moved = false;
		d.startX = e.clientX;
		d.startScroll = el.scrollLeft;
		d.lastX = e.clientX;
		d.lastT = e.timeStamp;
		d.velocity = 0;
	};

	const onPointerMove = (e: PointerEvent) => {
		const d = drag.current;
		const el = trackRef.current;
		if (!d.dragging || !el) return;
		const dx = e.clientX - d.startX;
		if (!d.moved && Math.abs(dx) < 4) return; // tolerance so taps still click through
		if (!d.moved) {
			d.moved = true;
			dragging.value = true;
			el.setPointerCapture?.(e.pointerId);
		}
		e.preventDefault();
		el.scrollLeft = d.startScroll - dx;
		const dt = e.timeStamp - d.lastT || 16;
		d.velocity = (e.clientX - d.lastX) / dt * 16;
		d.lastX = e.clientX;
		d.lastT = e.timeStamp;
		syncEdges();
	};

	const endDrag = (e: PointerEvent) => {
		const d = drag.current;
		if (!d.dragging) return;
		d.dragging = false;
		const el = trackRef.current;
		el?.releasePointerCapture?.(e.pointerId);
		if (d.moved) {
			dragging.value = false;
			runMomentum();
		}
	};

	// Swallow the click that follows a drag so cards don't navigate mid-swipe.
	const onClickCapture = (e: MouseEvent) => {
		if (drag.current.moved) {
			e.preventDefault();
			e.stopPropagation();
			drag.current.moved = false;
		}
	};

	const nudge = (dir: 1 | -1) => {
		const el = trackRef.current;
		if (!el) return;
		stopMomentum();
		el.scrollBy({ left: dir * el.clientWidth * 0.82, behavior: 'smooth' });
	};

	const classes = ['hscroll', klass, className].filter(Boolean).join(' ');

	return (
		<div
			class={classes}
			data-fade={fade ? 'true' : 'false'}
			data-at-start={atStart.value ? 'true' : 'false'}
			data-at-end={atEnd.value ? 'true' : 'false'}
			data-dragging={dragging.value ? 'true' : 'false'}
		>
			{controls && (
				<button
					type='button'
					class='hscroll__nav hscroll__nav--prev'
					aria-label='Scroll left'
					tabIndex={-1}
					onClick={() => nudge(-1)}
				>
					<IconChevronLeft size={18} stroke={2} />
				</button>
			)}

			<div
				ref={trackRef}
				class='hscroll__track'
				role='group'
				aria-label={ariaLabel}
				style={{ gap: `${gap}px`, scrollSnapType: snap ? 'x proximity' : 'none' }}
				onScroll={syncEdges}
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={endDrag}
				onPointerCancel={endDrag}
				onClickCapture={onClickCapture}
			>
				{children}
			</div>

			{controls && (
				<button
					type='button'
					class='hscroll__nav hscroll__nav--next'
					aria-label='Scroll right'
					tabIndex={-1}
					onClick={() => nudge(1)}
				>
					<IconChevronRight size={18} stroke={2} />
				</button>
			)}
		</div>
	);
}

export default HScroll;
