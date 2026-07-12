import '../styles/islands/navigation.css';
import NavigationGuestHeader from '../components/header/header.guest.tsx';
import NavigationMobileHeader from '../components/header/header.mobile.tsx';
import NavigationHeader from '../components/header/header.tsx';
import NavigationSide from '../components/side/side.tsx';
import NavigationSplitter from '../islands/navigation-splitter.island.tsx';
import NavigationMobileFooter from '../components/footer/footer.mobile.tsx';
import { NavigationProvider, useNavigationContext } from '../contexts/NavigationContext.tsx';
import { ComponentChildren, CSSProperties } from 'preact';
import { useUserContext } from '../contexts/UserContext.tsx';
import { useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';

// #region 1. Inner Layout Engine
// deno-lint-ignore no-explicit-any
function NavigationInner({ children }: { children?: any }) {
	const {
		isTopSideNavExpanded,
		middleNav,
		isCustomScrollEnabled,
		middleSideWidth,
		middleDensity,
		isSplitterResizing,
	} = useNavigationContext();
	const { isAuthenticated } = useUserContext();

	const isMiddleActive = middleNav.value.show;
	const isGuest = !isAuthenticated.value;
	const hasFooter = isMiddleActive && middleNav.value.footerHeight !== '0px';
	// The rail is present only when the active domain actually declares a side width.
	const hasMiddleSide = isMiddleActive && middleSideWidth.value > 0;

	const bodyRef = useRef<HTMLDivElement>(null);
	const thumbRef = useRef<HTMLDivElement>(null);
	const showScrollbar = useSignal(false);

	// Custom Scrollbar Logic
	useEffect(() => {
		if (!isCustomScrollEnabled.value) {
			showScrollbar.value = false;
			return;
		}

		const bodyEl = bodyRef.current;
		const thumbEl = thumbRef.current;
		if (!bodyEl || !thumbEl) return;

		const syncScrollbar = () => {
			const { clientWidth, scrollWidth, scrollLeft } = bodyEl;

			// Only show if content overflows horizontally
			if (scrollWidth > clientWidth) {
				showScrollbar.value = true;
				const ratio = clientWidth / scrollWidth;
				const thumbWidth = Math.max(ratio * clientWidth, 40); // 40px min width
				thumbEl.style.width = `${thumbWidth}px`;

				const maxScroll = scrollWidth - clientWidth;
				const maxThumbMove = clientWidth - thumbWidth;
				const thumbLeft = (scrollLeft / maxScroll) * maxThumbMove;
				thumbEl.style.transform = `translateX(${thumbLeft}px)`;
			} else {
				showScrollbar.value = false;
			}
		};

		// Observe container resizes and DOM mutations (like adding new Kanban columns)
		const ro = new ResizeObserver(syncScrollbar);
		ro.observe(bodyEl);
		const mo = new MutationObserver(syncScrollbar);
		mo.observe(bodyEl, { childList: true, subtree: true });

		bodyEl.addEventListener('scroll', syncScrollbar, { passive: true });
		syncScrollbar(); // Init

		return () => {
			ro.disconnect();
			mo.disconnect();
			bodyEl.removeEventListener('scroll', syncScrollbar);
		};
	}, [isCustomScrollEnabled.value, children]);

	// Dragging logic for the custom thumb
	const handleThumbPointerDown = (e: PointerEvent) => {
		if (!bodyRef.current || !thumbRef.current) return;

		const startX = e.clientX;
		const scrollLeftStart = bodyRef.current.scrollLeft;

		// Prevent text selection while dragging
		document.body.style.userSelect = 'none';
		thumbRef.current.dataset.dragging = 'true';

		const onPointerMove = (ev: PointerEvent) => {
			const { clientWidth, scrollWidth } = bodyRef.current!;
			const thumbWidth = parseFloat(thumbRef.current!.style.width);

			const maxScroll = scrollWidth - clientWidth;
			const maxThumbMove = clientWidth - thumbWidth;
			const deltaX = ev.clientX - startX;

			const scrollDelta = (deltaX / maxThumbMove) * maxScroll;
			bodyRef.current!.scrollLeft = scrollLeftStart + scrollDelta;
		};

		const onPointerUp = () => {
			document.body.style.userSelect = '';
			if (thumbRef.current) thumbRef.current.dataset.dragging = 'false';
			document.removeEventListener('pointermove', onPointerMove);
			document.removeEventListener('pointerup', onPointerUp);
		};

		document.addEventListener('pointermove', onPointerMove);
		document.addEventListener('pointerup', onPointerUp);
	};

	const dynamicStyles = {
		'--middle-header-height': isMiddleActive ? middleNav.value.headerHeight : '0px',
		'--middle-footer-height': isMiddleActive ? middleNav.value.footerHeight : '0px',
		/* Effective (drag-adjusted) rail width, resolved by the context from the domain's
		   declared width + any live Splitter override. */
		'--middle-side-width': hasMiddleSide ? `${middleSideWidth.value}px` : '0px',
		'--mask-bg': isMiddleActive ? 'var(--mid)' : 'var(--header)',

		/* Side-Favored Intersection Coordinates */
		'--middle-header-left': 'var(--total-side)',
		'--middle-side-top': 'var(--header-height)',
		'--middle-side-height': 'calc(100vh - var(--header-height))',

		/* Bottom Curve & Border Dynamic States */
		'--overlay-bottom': hasFooter ? 'var(--middle-footer-height)' : '-40px',
		'--footer-radius': hasFooter ? 'var(--nav-shell-radius)' : '0px',
		'--footer-border': hasFooter ? '1px solid var(--border-color)' : 'none',
	} as CSSProperties;

	return (
		<div
			class='navigation'
			data-sidebar-open={isTopSideNavExpanded.value}
			data-splitter-resizing={isSplitterResizing.value}
			style={dynamicStyles}
		>
			<div class='navigation__desktop-components'>
				{isGuest ? <NavigationGuestHeader /> : (
					<>
						<NavigationHeader />
						<NavigationSide />

						{isMiddleActive && (
							<>
								<div class='navigation__middle-overlay'></div>
								<div class='navigation__middle'>
									{middleNav.value.headerHeight !== '0px' && (
										<div class='navigation__middle-header'>
											{middleNav.value.headerContent}
										</div>
									)}
									{hasMiddleSide && (
										<div
											class='navigation__middle-side'
											data-density={middleDensity.value}
										>
											{middleNav.value.sideContent}
										</div>
									)}
									{middleNav.value.footerHeight !== '0px' && (
										<div class='navigation__middle-footer'>
											{middleNav.value.footerContent}
										</div>
									)}
								</div>
							</>
						)}
						{hasMiddleSide && <NavigationSplitter />}
						<div class='navigation__overlay'></div>
					</>
				)}
			</div>

			<div class='navigation__mobile-components'>
				<NavigationMobileHeader />
				<NavigationMobileFooter />
			</div>

			<div
				class='navigation__body'
				data-is-guest={isGuest}
				data-custom-scroll={isCustomScrollEnabled.value}
				ref={bodyRef}
			>
				{children}
			</div>

			{/* FIXED CUSTOM SCROLLBAR */}
			<div
				class='navigation__scrollbar-track'
				data-visible={showScrollbar.value}
			>
				<div
					class='navigation__scrollbar-thumb'
					ref={thumbRef}
					onPointerDown={handleThumbPointerDown}
				/>
			</div>
		</div>
	);
}
// #endregion

// #region 2. The Dynamic Composer
/**
 * Reads from the NavigationContext and wraps the UI in any dynamically added providers.
 */
function DynamicProviderWrapper({ children }: { children: ComponentChildren }) {
	const { dynamicProviders } = useNavigationContext();

	// reduceRight ensures the first item in the array becomes the outermost wrapper
	return dynamicProviders.value.reduceRight((kids, providerDef) => {
		const ProviderComponent = providerDef.component;
		return <ProviderComponent {...(providerDef.props || {})}>{kids}</ProviderComponent>;
		// deno-lint-ignore no-explicit-any
	}, children as any);
}
// #endregion

// #region 3. Public Export
export default function Navigation({ children }: { children?: ComponentChildren }) {
	return (
		<NavigationProvider>
			<DynamicProviderWrapper>
				<NavigationInner>
					{children}
				</NavigationInner>
			</DynamicProviderWrapper>
		</NavigationProvider>
	);
}
// #endregion
