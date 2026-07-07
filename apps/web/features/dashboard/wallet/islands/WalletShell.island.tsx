/**
 * @file WalletShell.island.tsx
 * @description The persistent global wrapper for every wallet page. It owns the `WalletProvider`
 * (persona + currency state) and tunnels the Persona Context Selector / currency dropdown / quick
 * metrics side rail into the navigation's middle-nav side slot via `setMiddleNav`. Because that
 * slot renders inside a *different* island (the nav), the tunnelled rail is re-wrapped in
 * `<WalletStateContext.Provider>` — the same context-tunnelling pattern as `StageLayout`. The page
 * content is passed through as `children` (a nested island via the route `<Partial>`), so it shares
 * this provider too.
 */

import '../styles/wallet.css';
import { ComponentChildren } from 'preact';
import { useEffect } from 'preact/hooks';
import { useNavigationContext } from '@features/navigation/contexts/NavigationContext.tsx';
import {
	useWalletContext,
	WalletProvider,
	WalletStateContext,
} from '../contexts/WalletContext.tsx';
import { WalletPersonaRail } from '../components/WalletPersonaRail.tsx';

function WalletShellInner({ children }: { children: ComponentChildren }) {
	const { setMiddleNav } = useNavigationContext();
	const ws = useWalletContext();

	useEffect(() => {
		setMiddleNav({
			show: true,
			headerHeight: '0px',
			footerHeight: '0px',
			sideWidth: '288px',
			headerContent: null,
			footerContent: null,
			// Re-wrap in the provider: the nav renders this outside our island's tree.
			sideContent: (
				<WalletStateContext.Provider value={ws}>
					<WalletPersonaRail />
				</WalletStateContext.Provider>
			),
		});

		return () => {
			setMiddleNav({ show: false, sideWidth: '0px', sideContent: null });
		};
	}, []);

	return <div class='wallet-shell'>{children}</div>;
}

export default function WalletShellIsland({ children }: { children: ComponentChildren }) {
	return (
		<WalletProvider>
			<WalletShellInner>{children}</WalletShellInner>
		</WalletProvider>
	);
}
