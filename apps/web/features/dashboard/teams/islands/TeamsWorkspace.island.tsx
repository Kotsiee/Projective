/**
 * @file TeamsWorkspace.island.tsx
 * @description Interactive shell for the Teams space: the glass roster (with active-team
 * switching), the "New team" flow (modal), and the operational overview. Data is loaded
 * server-side by the route and hydrated here as props — this island never queries the DB.
 */

import { useSignal } from '@preact/signals';
import { type ActivityItem, type RosterEntity } from '@projective/ui';
import {
	IconBriefcase,
	IconCashBanknote,
	IconChartBar,
	IconSparkles,
	IconUserPlus,
	IconUsers,
	IconWallet,
} from '@tabler/icons-preact';
import {
	EntityWorkspace,
	type WorkspaceMetric,
	type WorkspaceQuickAction,
} from '@features/dashboard/shared/components/EntityWorkspace.tsx';
import { useUserContext } from '@features/navigation/contexts/UserContext.tsx';
import { DashboardTeam } from '../contracts/Teams.ts';
import CreateTeamModal from './CreateTeamModal.tsx';

interface TeamsWorkspaceProps {
	initialTeams: DashboardTeam[];
	activeTeamId: string | null;
}

function toRoster(t: DashboardTeam): RosterEntity {
	return {
		id: t.team_id,
		name: t.name,
		handle: t.slug,
		avatarUrl: t.avatar_url ?? null,
		tier: t.tier ?? 'free',
		status: t.status ?? 'active',
		accent: 'violet',
	};
}

export default function TeamsWorkspace({ initialTeams, activeTeamId }: TeamsWorkspaceProps) {
	const modalOpen = useSignal(false);
	const { switchTeam } = useUserContext();

	const entities = initialTeams.map(toRoster);
	const active = initialTeams.find((t) => t.team_id === activeTeamId) ?? initialTeams[0];
	const activeSlug = active?.slug;

	const onSelect = async (e: RosterEntity) => {
		if (e.id === activeTeamId) return;
		const ok = await switchTeam(e.id);
		if (ok) globalThis.location.reload();
	};

	const teamHref = activeSlug ? `/teams/${activeSlug}` : undefined;

	const quickActions: WorkspaceQuickAction[] = [
		{
			key: 'new',
			icon: <IconUsers size={20} stroke={1.7} />,
			title: 'New team',
			description: 'Stake your agency handle',
			accent: 'violet',
			onClick: () => (modalOpen.value = true),
		},
		{
			key: 'invite',
			icon: <IconUserPlus size={20} stroke={1.7} />,
			title: 'Invite member',
			description: activeSlug ? 'Grow your roster' : 'Create a team first',
			accent: 'primary',
			href: teamHref,
			disabled: !activeSlug,
		},
		{
			key: 'project',
			icon: <IconBriefcase size={20} stroke={1.7} />,
			title: 'Quick-project draft',
			description: 'Take on new work',
			accent: 'mint',
			href: '/projects',
		},
		{
			key: 'payouts',
			icon: <IconCashBanknote size={20} stroke={1.7} />,
			title: 'Payouts & treasury',
			description: activeSlug ? 'Configure splits' : 'Create a team first',
			accent: 'amber',
			href: teamHref,
			disabled: !activeSlug,
		},
	];

	const activity: ActivityItem[] = [
		...initialTeams.slice(0, 3).map((t, i): ActivityItem => ({
			id: `team-${t.team_id}`,
			icon: t.status === 'draft' ? <IconSparkles size={13} /> : <IconUsers size={13} />,
			tone: t.status === 'draft' ? 'amber' : 'violet',
			title: (
				<>
					{t.status === 'draft' ? 'Drafted ' : 'Team '}
					<b>{t.name}</b>
					{t.status === 'draft'
						? ' — finish setup to go live'
						: ` · ${t.member_count} member${t.member_count === 1 ? '' : 's'}`}
				</>
			),
			meta: `@${t.slug}`,
			timestamp: ['just now', '3h', '2d'][i] ?? '',
		})),
		{
			id: 'treasury',
			icon: <IconWallet size={13} />,
			tone: 'mint',
			title: <>Team treasury initialised</>,
			meta: 'Vault ready',
			timestamp: '2d',
		},
	];

	const metrics: WorkspaceMetric[] = [
		{
			key: 'projects',
			label: 'Active engagements',
			icon: <IconBriefcase size={16} />,
			accent: 'violet',
		},
		{ key: 'treasury', label: 'Treasury balance', icon: <IconWallet size={16} />, accent: 'mint' },
		{
			key: 'capacity',
			label: 'Team capacity',
			icon: <IconChartBar size={16} />,
			accent: 'primary',
		},
		{
			key: 'payouts',
			label: 'Payouts this cycle',
			icon: <IconCashBanknote size={16} />,
			accent: 'amber',
		},
	];

	return (
		<>
			<EntityWorkspace
				title='Teams'
				subtitle='Your agencies and collaborations — assemble talent, take on work and split payouts.'
				newLabel='New team'
				rosterTitle='Your teams'
				entities={entities}
				activeId={active?.team_id ?? null}
				emptyRoster='No teams yet. Start an agency to collaborate.'
				onSelect={onSelect}
				onNew={() => (modalOpen.value = true)}
				quickActions={quickActions}
				activity={activity}
				activitySubtitle='Across all your teams'
				metrics={metrics}
			/>
			<CreateTeamModal isOpen={modalOpen.value} onClose={() => (modalOpen.value = false)} />
		</>
	);
}
