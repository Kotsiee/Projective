import { define } from '@utils';
import WalletShellIsland from '@features/dashboard/wallet/islands/WalletShell.island.tsx';
import { Partial } from 'fresh/runtime';

/**
 * Wallet layout. Mounts the persistent WalletShell island (persona + currency state, tunnelled
 * side rail) once and swaps page content through the `wallet-content` Partial — so navigating
 * between the wallet pages keeps the shell (and its rail state) alive. Mirrors the StageLayout
 * pattern. Auth is already enforced by `(dashboard)/_middleware.ts`.
 */
export default define.layout(function WalletLayout(ctx) {
	return (
		<WalletShellIsland>
			<Partial name='wallet-content'>
				<ctx.Component />
			</Partial>
		</WalletShellIsland>
	);
});
