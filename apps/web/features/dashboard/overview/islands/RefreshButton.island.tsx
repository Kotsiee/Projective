/**
 * @file RefreshButton.island.tsx
 * @description Atomic island (US-008 AC3). Re-pulls the live finance snapshot as escrow is held or
 * released. Data still loads on the server: the button triggers a Fresh Partial navigation
 * (`f-partial`) that re-runs the `/dashboard` route controller and swaps only the
 * `dashboard-overview` Partial — no client-side data fetching. The island owns nothing but the
 * transient loading affordance; it re-mounts fresh when the Partial swaps in, so the spinner clears
 * itself.
 */

import { useSignal } from '@preact/signals';
import { Button } from '@projective/ui';
import { IconRefresh } from '@tabler/icons-preact';

export interface RefreshButtonProps {
	/** The route to re-request as a Partial. Defaults to the dashboard home. */
	target?: string;
}

export default function RefreshButton({ target = '/dashboard' }: RefreshButtonProps) {
	const loading = useSignal(false);

	return (
		<Button
			variant='secondary'
			outlined
			size='small'
			href={target}
			loading={loading.value}
			onClick={() => {
				loading.value = true;
			}}
			startIcon={<IconRefresh size={15} stroke={2} />}
			{...{ 'f-partial': target }}
		>
			Refresh
		</Button>
	);
}
