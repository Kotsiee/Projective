import { useEffect } from 'preact/hooks';
import '../../styles/components/carousel.css';
import '../../styles/skeleton.css';

import { useCarousel } from '../../hooks/useCarousel.ts';
import { useDataManager } from '../../hooks/useDataManager.ts';
import type { CarouselOptions } from '../../types/carousel.ts';
import type { DataSource } from '../../core/datasource.ts';
import type { VNode } from 'preact';

// #region Interfaces

export interface CarouselProps<TOut, TIn = unknown> extends Omit<CarouselOptions, 'totalItems'> {
	/** The source of data. Can be a remote DataSource or a local array. */
	dataSource: DataSource<TOut, TIn> | TOut[];
	/** Render function for each individual item */
	renderItem: (item: TOut, index: number) => VNode;
	/** Render function for loading skeletons */
	renderSkeleton?: (index: number) => VNode;
	/** Number of items to fetch per remote batch. Defaults to 20. */
	pageSize?: number;
	/** Layout position of the arrow controls */
	arrowPosition?: 'inside' | 'outside' | 'hidden';
	/** Layout position of the dot indicators */
	indicatorPosition?: 'bottom' | 'hidden';
	/** Additional CSS classes */
	className?: string;
}

// #endregion

/**
 * A responsive, accessible, high-performance Carousel component.
 * Fully integrated with the DataManager for infinite scrolling and lazy-loaded items.
 */
export function Carousel<TOut, TIn = unknown>({
	dataSource,
	renderItem,
	renderSkeleton,
	pageSize = 20,
	arrowPosition = 'inside',
	indicatorPosition = 'bottom',
	className = '',
	...carouselOptions
}: CarouselProps<TOut, TIn>) {
	const isLocal = Array.isArray(dataSource);

	// Integrate with the core data manager for caching and lazy fetching
	const manager = useDataManager(
		isLocal ? null : dataSource as DataSource<TOut, TIn>,
		isLocal ? dataSource as TOut[] : undefined,
		pageSize,
	);

	const dataset = manager.dataset.value;

	// Determine the total bounds of the carousel.
	// Fall back to the known loaded length if the server hasn't provided a totalCount yet.
	const totalItems = dataset.totalCount ?? dataset.order.length;

	// Initialize the state engine
	const state = useCarousel({
		totalItems,
		...carouselOptions,
	});

	// #region Derived State & Computations

	const isAtStart = state.currentIndex.value === 0;
	const isAtEnd = state.currentIndex.value >= totalItems - state.actualNumVisible.value;

	const trackTransform =
		`translate3d(calc((-100% * ${state.currentIndex.value} / ${state.actualNumVisible.value}) + ${state.dragOffset.value}px), 0, 0)`;

	const totalPages = totalItems === 0
		? 0
		: Math.ceil((totalItems - state.actualNumVisible.value) / state.actualNumScroll.value) + 1;
	const activePage = totalItems === 0
		? 0
		: Math.ceil(state.currentIndex.value / state.actualNumScroll.value);

	// #endregion

	// #region Side Effects

	// Inform the DataManager of our viewport so it can fetch missing gaps
	useEffect(() => {
		const start = state.currentIndex.value;
		// Pre-fetch one extra "page" ahead to prevent visual popping during fast interaction
		const end = start + state.actualNumVisible.value * 2;
		manager.setVisibleRange(start, end);
	}, [state.currentIndex.value, state.actualNumVisible.value, manager]);

	// #endregion

	// #region Event Handlers

	const handleMouseEnter = () => state.pause();
	const handleMouseLeave = () => state.play();

	// #endregion

	if (totalItems === 0 && !manager.isFetching.value) return null;

	return (
		<div
			className={`data-carousel data-carousel--nav-${arrowPosition} ${className}`}
			style={{
				'--carousel-visible-count': state.actualNumVisible.value,
			} as preact.JSX.CSSProperties}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			role='region'
			aria-roledescription='carousel'
		>
			<div className='data-carousel__viewport' ref={state.containerRef}>
				<div
					className={`data-carousel__track ${
						state.isDragging.value ? 'data-carousel__track--dragging' : ''
					}`}
					style={{ transform: trackTransform }}
					aria-live={state.isAutoplaying.value ? 'off' : 'polite'}
					onPointerDown={state.onPointerDown}
					onPointerMove={state.onPointerMove}
					onPointerUp={state.onPointerUp}
					onPointerCancel={state.onPointerUp}
				>
					{Array.from({ length: totalItems }).map((_, index) => {
						const isVisible = index >= state.currentIndex.value &&
							index < state.currentIndex.value + state.actualNumVisible.value;

						// DOM Virtualization: Only fully render nodes near the viewport.
						// We keep a buffer zone of +/- 1 full page width to ensure smooth dragging transitions.
						const buffer = state.actualNumVisible.value;
						const isNearViewport = index >= state.currentIndex.value - buffer &&
							index <= state.currentIndex.value + state.actualNumVisible.value + buffer;

						if (!isNearViewport) {
							// Return an empty structural placeholder to maintain the flex layout sizing
							return (
								<div
									key={`placeholder-${index}`}
									className='data-carousel__item'
									aria-hidden='true'
								/>
							);
						}

						// Data Retrieval
						const key = dataset.order[index];
						const item = key ? dataset.items.get(key) : undefined;

						let content: preact.ComponentChildren = null;

						if (item && !item.isSkeleton) {
							content = renderItem(item.data, index);
						} else if (renderSkeleton) {
							content = renderSkeleton(index);
						} else {
							// Default skeleton fallback using the standard theme variables
							content = (
								<div
									className='data-skeleton'
									style={{ width: '100%', height: '100%', minHeight: '150px' }}
								/>
							);
						}

						return (
							<div
								key={key || `loading-${index}`}
								className='data-carousel__item'
								aria-hidden={!isVisible}
								tabIndex={isVisible ? 0 : -1}
								style={{ pointerEvents: state.isDragging.value ? 'none' : 'auto' }}
							>
								{content}
							</div>
						);
					})}
				</div>
			</div>

			{/* Arrows */}
			{arrowPosition !== 'hidden' && totalItems > state.actualNumVisible.value && (
				<>
					<button
						type='button'
						className='data-carousel__nav-button data-carousel__nav-button--prev'
						onClick={state.prev}
						disabled={!carouselOptions.circular && isAtStart}
						aria-label='Previous slide'
					>
						<svg
							width='24'
							height='24'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
						>
							<path d='M15 18l-6-6 6-6' />
						</svg>
					</button>
					<button
						type='button'
						className='data-carousel__nav-button data-carousel__nav-button--next'
						onClick={state.next}
						disabled={!carouselOptions.circular && isAtEnd}
						aria-label='Next slide'
					>
						<svg
							width='24'
							height='24'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
						>
							<path d='M9 18l6-6-6-6' />
						</svg>
					</button>
				</>
			)}

			{/* Indicators (Pagination Dots) */}
			{indicatorPosition !== 'hidden' && totalPages > 1 && (
				<div className='data-carousel__indicators' role='tablist'>
					{Array.from({ length: totalPages }).map((_, i) => (
						<button
							type='button'
							key={i}
							role='tab'
							aria-selected={activePage === i}
							aria-label={`Go to slide page ${i + 1}`}
							className={`data-carousel__indicator ${
								activePage === i ? 'data-carousel__indicator--active' : ''
							}`}
							onClick={() => state.goTo(i * state.actualNumScroll.value)}
						/>
					))}
				</div>
			)}
		</div>
	);
}
