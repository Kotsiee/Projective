// #region Interfaces

import { ReadonlySignal, Signal } from '@preact/signals';

/**
 * Core configuration options for initializing the carousel state.
 */
export interface CarouselOptions {
	/** The total number of items in the dataset. */
	totalItems: number;
	/** Number of items visible in the viewport. Used as a fallback or initial SSR state. Defaults to 1. */
	numVisible?: number;
	/** Number of items to move per navigation action. Defaults to actual visible count if omitted. */
	numScroll?: number;
	/** Minimum width in pixels for an item. If provided, overrides numVisible dynamically based on container width. */
	itemMinWidth?: number;
	/** Whether the carousel should loop back to the beginning continuously. Defaults to false. */
	circular?: boolean;
	/** Whether the carousel should automatically scroll. Defaults to false. */
	autoplay?: boolean;
	/** Time in milliseconds between automatic transitions. Defaults to 3000. */
	autoplayInterval?: number;
}

/**
 * The public API returned by the useCarousel hook.
 */
export interface CarouselState {
	/** Reference to attach to the carousel's outermost DOM container for ResizeObserver. */
	containerRef: preact.RefObject<HTMLDivElement>;
	/** The index of the currently active/first-visible item. */
	currentIndex: Signal<number>;
	/** Flag indicating if the user is currently dragging/swiping. */
	isDragging: Signal<boolean>;
	/** The current pixel offset of the active drag interaction. */
	dragOffset: Signal<number>;
	/** Flag indicating if the autoplay engine is currently active. */
	isAutoplaying: Signal<boolean>;
	/** The computed number of visible items, adjusted for current container width. */
	actualNumVisible: ReadonlySignal<number>;
	/** The computed number of items to scroll, adjusted for current container width. */
	actualNumScroll: ReadonlySignal<number>;
	/** Navigates to the next set of items. */
	next: () => void;
	/** Navigates to the previous set of items. */
	prev: () => void;
	/** Navigates to a specific item index. */
	goTo: (index: number) => void;
	/** Pauses the autoplay engine. */
	pause: () => void;
	/** Resumes the autoplay engine. */
	play: () => void;
}

// #endregion
