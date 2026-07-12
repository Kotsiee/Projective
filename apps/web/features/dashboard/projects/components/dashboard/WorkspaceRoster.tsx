/**
 * @file WorkspaceRoster.tsx
 * @description Renders the filtered CRM roster — the body shown for the Services Pipeline view and
 * for the Projects view whenever a CRM filter is engaged. Each row is a luxurious client micro-card:
 * client avatar, project/engagement title, the service tier chip, value, and a stage badge. A header
 * summarises the filtered count + total value.
 */

import { Avatar, StatusBadge } from '@projective/ui';
import { IconClipboardList } from '@tabler/icons-preact';
import type { WorkspaceEntry, WorkspaceMode } from '../../contracts/crm.ts';
import { workspaceStatusTone } from '../../contracts/crm.ts';

interface WorkspaceRosterProps {
	entries: WorkspaceEntry[];
	mode: WorkspaceMode;
	/** Caption clarifying this is a filtered client view (e.g. when projects mode is filtered). */
	note?: string;
}

function money(cents: number): string {
	try {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			notation: 'compact',
			maximumFractionDigits: 1,
		}).format(cents / 100);
	} catch {
		return `$${Math.round(cents / 100).toLocaleString()}`;
	}
}

export default function WorkspaceRoster({ entries, mode, note }: WorkspaceRosterProps) {
	const total = entries.reduce((sum, e) => sum + e.valueCents, 0);
	const title = mode === 'services' ? 'Services pipeline' : 'Client roster';

	return (
		<section class='pw-roster'>
			<header class='pw-roster__head'>
				<div>
					<h2 class='pw-roster__title'>{title}</h2>
					<span class='pw-roster__meta'>
						{entries.length} {entries.length === 1 ? 'engagement' : 'engagements'} · {money(total)}
						{' '}
						value
					</span>
				</div>
				{note && <span class='pw-roster__note'>{note}</span>}
			</header>

			{entries.length === 0
				? (
					<div class='pw-roster__empty'>
						<IconClipboardList size={26} />
						<p>No matching clients. Adjust or clear your filters.</p>
					</div>
				)
				: (
					<ul class='pw-roster__list'>
						{entries.map((e) => (
							<li key={e.id} class='pw-roster__row'>
								<Avatar name={e.clientName} src={e.clientAvatarUrl ?? undefined} size={40} />
								<div class='pw-roster__body'>
									<div class='pw-roster__line'>
										<span class='pw-roster__client'>{e.clientName}</span>
										<StatusBadge tone={workspaceStatusTone(e.status)} size='sm' dot>
											{e.stage}
										</StatusBadge>
									</div>
									<div class='pw-roster__sub'>
										<span class='pw-roster__project'>{e.projectTitle}</span>
										{e.serviceName && (
											<span class='pw-roster__service'>
												{e.serviceName}
												{e.tierName ? ` · ${e.tierName}` : ''}
											</span>
										)}
									</div>
								</div>
								<span class='pw-roster__value'>{money(e.valueCents)}</span>
							</li>
						))}
					</ul>
				)}
		</section>
	);
}
