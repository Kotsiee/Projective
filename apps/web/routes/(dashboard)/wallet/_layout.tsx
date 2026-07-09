import { define } from '@utils';
import WalletShellIsland from '@features/dashboard/wallet/islands/WalletShell.island.tsx';
import { WALLET_DATASET } from '@features/dashboard/wallet/data/walletSeed.ts';
import { Partial } from 'fresh/runtime';

/**
 * Wallet layout. Mounts the persistent WalletShell island (persona + currency state, tunnelled
 * side rail) once and swaps page content through the `wallet-content` Partial — so navigating
 * between the wallet pages keeps the shell (and its rail state) alive. Mirrors the StageLayout
 * pattern. Auth is already enforced by `(dashboard)/_middleware.ts`.
 *
 * The wallet seed is owned here (a server component) and handed to the island as `initialData`
 * props — data flows Route → props → island (apps/web/CLAUDE.md), and the seed module stays out of
 * the client island bundles. When a real wallet backend lands, swap this constant for a Service
 * call; nothing downstream changes.
 */
export default define.layout(function WalletLayout(ctx) {
	return (
		<WalletShellIsland dataset={WALLET_DATASET}>
			<Partial name='wallet-content'>
				<ctx.Component />
			</Partial>
		</WalletShellIsland>
	);
});
