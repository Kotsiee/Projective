import '../styles/components/team-card.css';
import { IconUsers } from '@tabler/icons-preact';
import { DashboardTeam } from '../contracts/Teams.ts';
import { useUserContext } from '../../../shared/contexts/UserContext.tsx';
import { VNode } from 'preact';
import { deltaToPlainText } from '@projective/utils';
import { Card, metaPosition } from '@projective/ui';

interface TeamCardProps {
	team: DashboardTeam;
}

function getShortDescription(desc: string): string {
	if (!desc) return 'No description provided.';
	try {
		if (desc.startsWith('{') && desc.includes('"ops"')) {
			const parsed = JSON.parse(desc);
			if (Array.isArray(parsed.ops)) {
				return parsed.ops
					.map((op: any) => (typeof op.insert === 'string' ? op.insert : ''))
					.join('')
					.trim() || 'No description provided.';
			}
		}
		return desc;
	} catch {
		return desc;
	}
}

export function TeamCard({ team }: TeamCardProps) {
	const { user, switchTeam } = useUserContext();
	const isOwner = team.user_role === 'owner';
	const description = deltaToPlainText(JSON.parse(getShortDescription(team.description)));

	const isActive = user.value?.activeTeamId === team.team_id;

	const handleSwitch = async () => {
		if (isActive) return;
		await switchTeam(team.team_id);
	};

	const meta: Partial<Record<metaPosition, VNode>> = {
		'bottom-left': (
			<div class='team-card__stat'>
				<IconUsers size={14} />
				<span>{team.member_count} Members</span>
			</div>
		),
	};

	return (
		<div className={`team-card ${isActive ? 'team-card--active' : ''}`}>
			<Card
				owner={{
					profilePictureUrl: team.avatar_url ??
						'https://images.unsplash.com/photo-1574169208507-84376144848b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGFic3RyYWN0fGVufDB8fDB8fHww',
					name: team.name,
					handle: team.slug,
				}}
				type='active'
				onClick={handleSwitch}
				title={team.name}
				description={description}
				tags={[{ label: 'Owner' }]}
				bannerUrl={team.banner_url ??
					'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGFic3RyYWN0fGVufDB8fDB8fHww'}
				meta={meta}
			/>
		</div>
	);
}
