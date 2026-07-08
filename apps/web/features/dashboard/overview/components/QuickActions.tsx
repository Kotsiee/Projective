/**
 * @file QuickActions.tsx
 * @description Quick administrative action shortcuts for the admin dashboard (US-008 AC1) — the
 * high-frequency jobs a business owner reaches for: start a project, review the wallet ledger,
 * manage members and open profile settings.
 */

import { Button } from '@projective/ui';
import { IconFileInvoice, IconPlus, IconSettings, IconUsersGroup } from '@tabler/icons-preact';

export interface QuickActionsProps {
	settingsHref: string;
}

export function QuickActions({ settingsHref }: QuickActionsProps) {
	return (
		<div class='overview-actions'>
			<Button variant='primary' href='/projects' startIcon={<IconPlus size={16} stroke={2.2} />}>
				New project
			</Button>
			<Button
				variant='secondary'
				outlined
				href='/wallet/ledger'
				startIcon={<IconFileInvoice size={16} stroke={2} />}
			>
				View ledger
			</Button>
			<Button
				variant='secondary'
				outlined
				href={settingsHref}
				startIcon={<IconUsersGroup size={16} stroke={2} />}
			>
				Members
			</Button>
			<Button
				variant='secondary'
				outlined
				href={settingsHref}
				startIcon={<IconSettings size={16} stroke={2} />}
			>
				Settings
			</Button>
		</div>
	);
}
