/**
 * @file EscrowAllocationList.tsx
 * @description The overview's escrow allocation panel — capital committed to active stages, each
 * row showing project/stage, a finance `StatusBadge`, stage progress via `AllocationMeter`, and
 * the held amount (net of the 5% platform fee) in the display currency.
 */

import { AllocationMeter, StatusBadge } from '@projective/fields';
import type { EscrowStatus } from '@projective/types';
import { useWalletContext } from '../contexts/WalletContext.tsx';

/** Maps finance escrow states → the StatusBadge finance vocabulary (a subset of its statuses). */
const STATUS_MAP: Record<
	EscrowStatus,
	'in-escrow' | 'funded' | 'released' | 'pending' | 'disputed'
> = {
	held: 'in-escrow',
	funded: 'funded',
	released: 'released',
	refunded: 'pending',
	disputed: 'disputed',
};

export function EscrowAllocationList() {
	const { escrow, format } = useWalletContext();
	const rows = escrow.value;

	return (
		<section class='wallet-escrow'>
			<header class='wallet-escrow__header'>
				<h3 class='wallet-escrow__title'>Escrow allocations</h3>
				<span class='wallet-escrow__total'>
					{format(rows.reduce((s, r) => s + r.amount_cents, 0))} committed
				</span>
			</header>

			<ul class='wallet-escrow__list'>
				{rows.map((r) => (
					<li key={r.id} class='wallet-escrow__item'>
						<div class='wallet-escrow__main'>
							<div class='wallet-escrow__labels'>
								<span class='wallet-escrow__project'>{r.project_label}</span>
								<span class='wallet-escrow__stage'>{r.stage_label}</span>
							</div>
							<StatusBadge status={STATUS_MAP[r.status]} size='sm' />
						</div>

						<div class='wallet-escrow__meter'>
							<AllocationMeter
								filled={r.progress_pct}
								total={100}
								variant='bar'
								tone='primary'
								showCaption={false}
								size='sm'
							/>
							<span class='wallet-escrow__pct'>{r.progress_pct}%</span>
						</div>

						<div class='wallet-escrow__amounts'>
							<span class='wallet-escrow__amount'>{format(r.amount_cents)}</span>
							<span class='wallet-escrow__fee'>
								−{format(r.platform_fee_cents)} fee
							</span>
						</div>
					</li>
				))}
			</ul>
		</section>
	);
}
