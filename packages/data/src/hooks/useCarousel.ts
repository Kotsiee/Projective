import { useComputed, useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import type { CarouselOptions, CarouselState } from '../types/carousel.ts';
import type { JSX } from 'preact';

// #region Extended Interface

export interface CarouselStateWithTouch extends CarouselState {
	/** Pointer down event handler for the track */
	onPointerDown: (e: JSX.TargetedPointerEvent<HTMLDivElement>) => void;
	/** Pointer move event handler for the track */
	onPointerMove: (e: JSX.TargetedPointerEvent<HTMLDivElement>) => void;
	/** Pointer up/cancel event handler for the track */
	onPointerUp: (e: JSX.TargetedPointerEvent<HTMLDivElement>) => void;
}

// #endregion

/**
 * Manages the core state, navigation logic, and responsive widths for a Carousel component.
 * Includes Pointer Event handling for mobile swipe and desktop drag interactions.
 * * @param options Configuration options for the carousel behavior.
 * @returns A state object containing signals and navigation methods.
 */
export function useCarousel(options: CarouselOptions): CarouselStateWithTouch {
	const {
		numVisible = 1,
		numScroll,
		itemMinWidth,
		circular = false,
		autoplay = false,
		autoplayInterval = 3000,
	} = options;

	const containerRef = useRef<HTMLDivElement>(null);
	const resizeObserver = useRef<ResizeObserver | null>(null);

	// Signals for reactive state
	const totalItems = useSignal(options.totalItems);
	const currentIndex = useSignal(0);
	const isDragging = useSignal(false);
	const dragOffset = useSignal(0);
	const isAutoplaying = useSignal(autoplay);

	const containerWidth = useSignal<number | null>(null);
	const startX = useRef(0);

	// #region Computed Properties

	const actualNumVisible = useComputed(() => {
		if (itemMinWidth && containerWidth.value) {
			// Calculate how many items can fit natively, enforcing at least 1
			return Math.max(1, Math.floor(containerWidth.value / itemMinWidth));
		}
		// Fallback to static count for SSR or if itemMinWidth isn't provided
		return numVisible;
	});

	const actualNumScroll = useComputed(() => {
		// If explicit scroll count is provided, use it. Otherwise page fully by visible count.
		return numScroll ?? actualNumVisible.value;
	});

	// #endregion

	// #region Navigation Methods

	const next = () => {
		const step = actualNumScroll.value;
		const maxIndex = Math.max(0, totalItems.value - actualNumVisible.value);

		let nextIndex = currentIndex.value + step;

		if (nextIndex > maxIndex) {
			nextIndex = circular ? 0 : maxIndex;
		}

		currentIndex.value = nextIndex;
	};

	const prev = () => {
		const step = actualNumScroll.value;
		let prevIndex = currentIndex.value - step;

		if (prevIndex < 0) {
			prevIndex = circular ? Math.max(0, totalItems.value - actualNumVisible.value) : 0;
		}

		currentIndex.value = prevIndex;
	};

	const goTo = (index: number) => {
		const maxIndex = Math.max(0, totalItems.value - actualNumVisible.value);
		currentIndex.value = Math.max(0, Math.min(index, maxIndex));
	};

	const pause = () => {
		isAutoplaying.value = false;
	};

	const play = () => {
		if (autoplay) isAutoplaying.value = true;
	};

	// #endregion

	// #region Interaction Methods (Drag/Swipe)

	const onPointerDown = (e: JSX.TargetedPointerEvent<HTMLDivElement>) => {
		isDragging.value = true;
		startX.current = e.clientX;
		pause();

		if (e.currentTarget.setPointerCapture) {
			e.currentTarget.setPointerCapture(e.pointerId);
		}
	};

	const onPointerMove = (e: JSX.TargetedPointerEvent<HTMLDivElement>) => {
		if (!isDragging.value) return;

		const currentX = e.clientX;
		const deltaX = currentX - startX.current;

		dragOffset.value = deltaX;
	};

	const onPointerUp = (e: JSX.TargetedPointerEvent<HTMLDivElement>) => {
		if (!isDragging.value) return;
		isDragging.value = false;

		if (e.currentTarget.releasePointerCapture) {
			e.currentTarget.releasePointerCapture(e.pointerId);
		}

		const threshold = 50;

		if (dragOffset.value <= -threshold) {
			next();
		} else if (dragOffset.value >= threshold) {
			prev();
		}

		dragOffset.value = 0;
		play();
	};

	// #endregion

	// #region Side Effects

	useEffect(() => {
		totalItems.value = options.totalItems;
	}, [options.totalItems]);

	useEffect(() => {
		let timer: number;
		if (isAutoplaying.value && !isDragging.value && totalItems.value > actualNumVisible.value) {
			timer = setInterval(() => {
				next();
			}, autoplayInterval) as unknown as number;
		}
		return () => clearInterval(timer);
	}, [
		isAutoplaying.value,
		isDragging.value,
		totalItems.value,
		actualNumVisible.value,
		autoplayInterval,
	]);

	useEffect(() => {
		if (typeof ResizeObserver === 'undefined') return;

		resizeObserver.current = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const width = entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
				if (containerWidth.value !== width) {
					containerWidth.value = width;
				}
			}
		});

		if (containerRef.current) {
			resizeObserver.current.observe(containerRef.current);
		}

		return () => {
			resizeObserver.current?.disconnect();
		};
	}, []);

	useEffect(() => {
		const maxIndex = Math.max(0, totalItems.value - actualNumVisible.value);
		if (currentIndex.value > maxIndex) {
			currentIndex.value = maxIndex;
		}
	}, [actualNumVisible.value, totalItems.value]);

	// #endregion

	return {
		containerRef,
		currentIndex,
		isDragging,
		dragOffset,
		isAutoplaying,
		actualNumVisible,
		actualNumScroll,
		next,
		prev,
		goTo,
		pause,
		play,
		onPointerDown,
		onPointerMove,
		onPointerUp,
	};
}
