import '../styles/islands/navigation.css';
import NavigationGuestHeader from '../components/header/header.guest.tsx';
import NavigationMobileHeader from '../components/header/header.mobile.tsx';
import NavigationHeader from '../components/header/header.tsx';
import NavigationSide from '../components/side/side.tsx';
import NavigationMobileFooter from '../components/footer/footer.mobile.tsx';
import { NavigationProvider, useNavigationContext } from '../contexts/NavigationContext.tsx';
import { ComponentChildren, CSSProperties } from 'preact';
import { useUserContext } from '../contexts/UserContext.tsx';

// #region 1. Inner Layout Engine
// deno-lint-ignore no-explicit-any
function NavigationInner({ children }: { children?: any }) {
	const { isTopSideNavExpanded, middleNav } = useNavigationContext();
	const { isAuthenticated } = useUserContext();

	const isMiddleActive = middleNav.value.show;
	const isGuest = !isAuthenticated.value;
	const hasFooter = isMiddleActive && middleNav.value.footerHeight !== '0px';

	const dynamicStyles = {
		'--middle-header-height': isMiddleActive ? middleNav.value.headerHeight : '0px',
		'--middle-footer-height': isMiddleActive ? middleNav.value.footerHeight : '0px',
		'--middle-side-width': isMiddleActive ? middleNav.value.sideWidth : '0px',
		'--mask-bg': isMiddleActive ? 'var(--mid)' : 'var(--header)',

		/* Side-Favored Intersection Coordinates */
		'--middle-header-left': 'var(--total-side)',
		'--middle-side-top': 'var(--header-height)',
		'--middle-side-height': 'calc(100vh - var(--header-height))',

		/* Bottom Curve & Border Dynamic States */
		'--overlay-bottom': hasFooter ? 'var(--middle-footer-height)' : '-40px',
		'--footer-radius': hasFooter ? '80px' : '0px',
		'--footer-border': hasFooter ? '1px solid var(--border-color)' : 'none',
	} as CSSProperties;

	return (
		<div
			class='navigation'
			data-sidebar-open={isTopSideNavExpanded.value}
			style={dynamicStyles}
		>
			{/* --- DESKTOP VIEW --- */}
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
									{middleNav.value.sideWidth !== '0px' && (
										<div class='navigation__middle-side'>
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
						<div class='navigation__overlay'></div>
					</>
				)}
			</div>

			<div class='navigation__mobile-components'>
				<NavigationMobileHeader />
				<NavigationMobileFooter />
			</div>

			<div class='navigation__body' data-is-guest={isGuest}>
				{children}
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
