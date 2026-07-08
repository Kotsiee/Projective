/**
 * @file EscrowPanel.tsx
 * @description Live escrow allocation panel (US-008 AC3): capital this business has committed to
 * active project stages, read from `finance.escrows` via `org.get_business_finance`. Each row shows
 * the stage, payee, held amount, status and a completion meter — and updates as holds are funded or
 * released.
 */

import { StatusBadge } from '@projective/ui';
import type { BadgeTone } from '@projective/ui';
import { IconLock } from '@tabler/icons-preact';
import type { EscrowAllocation } from '@projective/types';
import { formatMoney } from '../data/format.ts';

const STATUS_TONE: Record<string, BadgeTone> = {
	funded: 'primary',
	held: 'amber',
	disputed: 'danger',
	released: 'success',
	refunded: 'neutral',
};

export interface EscrowPanelProps {
	escrows: EscrowAllocation[];
	currency: string;
}

export function EscrowPanel({ escrows, currency }: EscrowPanelProps) {
	return (
		<section class='overview-card overview-escrow'>
			<header class='overview-card__header'>
				<div class='overview-card__heading'>
					<span class='overview-card__icon' aria-hidden='true'>
						<IconLock size={17} stroke={2} />
					</span>
					<div>
						<h2 class='overview-card__title'>Escrow allocations</h2>
						<p class='overview-card__subtitle'>
							{escrows.length} live commitment{escrows.length === 1 ? '' : 's'}
						</p>
					</div>
				</div>
			</header>

			{escrows.length === 0
				? <p class='overview-empty'>No funds in escrow. Fund a stage to hold capital here.</p>
				: (
					<ul class='overview-escrow__list'>
						{escrows.map((e) => (
							<li key={e.id} class='overview-escrow__item'>
								<div class='overview-escrow__top'>
									<div class='overview-escrow__labels'>
										<span class='overview-escrow__project'>{e.project_label}</span>
										<span class='overview-escrow__stage'>{e.stage_label} · {e.payee_name}</span>
									</div>
									<div class='overview-escrow__amount'>
										{formatMoney(e.amount_cents, e.currency || currency)}
										<StatusBadge tone={STATUS_TONE[e.status] ?? 'neutral'} size='sm' dot>
											{e.status}
										</StatusBadge>
									</div>
								</div>
								<div
									class='overview-escrow__meter'
									role='progressbar'
									aria-valuenow={e.progress_pct}
								>
									<span
										class='overview-escrow__meter-fill'
										style={{ width: `${e.progress_pct}%` }}
									/>
								</div>
							</li>
						))}
					</ul>
				)}
		</section>
	);
}
