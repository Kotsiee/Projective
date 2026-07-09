/**
 * @file BusinessWorkspace.island.tsx
 * @description Interactive shell for the Businesses space: the glass roster (with active-context
 * switching), the "New business" flow (modal), and the operational overview. Data is loaded
 * server-side by the route and hydrated here as props — this island never queries the DB.
 */

import { useSignal } from '@preact/signals';
import { type ActivityItem, type RosterEntity } from '@projective/ui';
import {
	IconBriefcase,
	IconBuilding,
	IconChartBar,
	IconHeartHandshake,
	IconReceipt2,
	IconSparkles,
	IconUserPlus,
	IconWallet,
} from '@tabler/icons-preact';
import {
	EntityWorkspace,
	type WorkspaceMetric,
	type WorkspaceQuickAction,
} from '@features/dashboard/shared/components/EntityWorkspace.tsx';
import { useUserContext } from '@features/navigation/contexts/UserContext.tsx';
import { DashboardBusiness } from '../contracts/Business.ts';
import CreateBusinessModal from './CreateBusinessModal.tsx';

interface BusinessWorkspaceProps {
	initialBusinesses: DashboardBusiness[];
	activeId: string | null;
}

function toRoster(b: DashboardBusiness): RosterEntity {
	return {
		id: b.id,
		name: b.name,
		handle: b.slug,
		avatarUrl: b.logo_url ?? null,
		tier: b.tier ?? 'free',
		status: b.status ?? 'active',
		accent: 'primary',
	};
}

export default function BusinessWorkspace({ initialBusinesses, activeId }: BusinessWorkspaceProps) {
	const modalOpen = useSignal(false);
	const { switchProfile } = useUserContext();

	const entities = initialBusinesses.map(toRoster);
	const active = initialBusinesses.find((b) => b.id === activeId) ?? initialBusinesses[0];
	const activeSlug = active?.slug;

	const onSelect = async (e: RosterEntity) => {
		if (e.id === activeId) return;
		const ok = await switchProfile(e.id, 'business');
		if (ok) globalThis.location.reload();
	};

	const settingsHref = activeSlug ? `/business/${activeSlug}/settings` : undefined;

	const quickActions: WorkspaceQuickAction[] = [
		{
			key: 'new',
			icon: <IconBuilding size={20} stroke={1.7} />,
			title: 'New business',
			description: 'Reserve a handle in seconds',
			accent: 'primary',
			onClick: () => (modalOpen.value = true),
		},
		{
			key: 'invite',
			icon: <IconUserPlus size={20} stroke={1.7} />,
			title: 'Invite member',
			description: activeSlug ? 'Add teammates & roles' : 'Create a business first',
			accent: 'violet',
			href: settingsHref,
			disabled: !activeSlug,
		},
		{
			key: 'project',
			icon: <IconBriefcase size={20} stroke={1.7} />,
			title: 'Quick-project draft',
			description: 'Spin up a new brief',
			accent: 'mint',
			href: '/projects',
		},
		{
			key: 'billing',
			icon: <IconReceipt2 size={20} stroke={1.7} />,
			title: 'Billing & settings',
			description: activeSlug ? 'Finish verification' : 'Create a business first',
			accent: 'amber',
			href: settingsHref,
			disabled: !activeSlug,
		},
	];

	// Static, non-hydration-sensitive activity seed derived from the roster.
	const activity: ActivityItem[] = [
		...initialBusinesses.slice(0, 3).map((b, i): ActivityItem => ({
			id: `biz-${b.id}`,
			icon: b.status === 'draft' ? <IconSparkles size={13} /> : <IconBuilding size={13} />,
			tone: b.status === 'draft' ? 'amber' : 'primary',
			title: (
				<>
					{b.status === 'draft' ? 'Drafted ' : 'Workspace '}
					<b>{b.name}</b>
					{b.status === 'draft' ? ' — finish setup to go live' : ' is live'}
				</>
			),
			meta: `@${b.slug}`,
			timestamp: ['just now', '2h', '1d'][i] ?? '',
		})),
		{
			id: 'wallet',
			icon: <IconWallet size={13} />,
			tone: 'mint',
			title: <>Business wallet initialised</>,
			meta: 'Escrow ready',
			timestamp: '1d',
		},
	];

	const metrics: WorkspaceMetric[] = [
		{
			key: 'projects',
			label: 'Active projects',
			icon: <IconBriefcase size={16} />,
			accent: 'primary',
		},
		{ key: 'escrow', label: 'Escrow balance', icon: <IconWallet size={16} />, accent: 'mint' },
		{
			key: 'members',
			label: 'Team utilisation',
			icon: <IconChartBar size={16} />,
			accent: 'violet',
		},
		{
			key: 'csat',
			label: 'Client satisfaction',
			icon: <IconHeartHandshake size={16} />,
			accent: 'amber',
		},
	];

	return (
		<>
			<EntityWorkspace
				title='Businesses'
				subtitle='Your legal entities, billing profiles and client relationships — one operational cockpit.'
				newLabel='New business'
				rosterTitle='Your businesses'
				entities={entities}
				activeId={active?.id ?? null}
				emptyRoster='No businesses yet. Create your first to get started.'
				onSelect={onSelect}
				onNew={() => (modalOpen.value = true)}
				quickActions={quickActions}
				activity={activity}
				activitySubtitle='Across all your businesses'
				metrics={metrics}
			/>
			<CreateBusinessModal isOpen={modalOpen.value} onClose={() => (modalOpen.value = false)} />
		</>
	);
}
