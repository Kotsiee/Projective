import '@styles/components/dashboard/teams/team-card.css';
import {
	IconArrowRight,
	IconCurrencyDollar,
	IconDotsVertical,
	IconShield,
	IconUsers,
} from '@tabler/icons-preact';
import { DashboardTeam } from '@contracts/dashboard/teams/Teams.ts';
import { useUserContext } from '@contexts/UserContext.tsx';

interface TeamCardProps {
	team: DashboardTeam;
}

// Helper to extract plain text from Quill Delta JSON or return string as-is
function getShortDescription(desc: string): string {
	if (!desc) return 'No description provided.';
	try {
		// Detect if it looks like the Delta JSON string from your logs
		if (desc.startsWith('{') && desc.includes('"ops"')) {
			const parsed = JSON.parse(desc);
			if (Array.isArray(parsed.ops)) {
				return parsed.ops
					// deno-lint-ignore no-explicit-any
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
	const description = getShortDescription(team.description);

	const isActive = user.value?.activeTeamId === team.team_id;

	const handleSwitch = async (e: Event) => {
		e.stopPropagation();
		if (isActive) return;
		await switchTeam(team.team_id);
	};

	return (
		<div className={`team-card ${isActive ? 'team-card--active' : ''}`}>
		</div>
	);
}

// <div className={`team-card ${isActive ? 'team-card--active' : ''}`}>
// 	{/* Header / Avatar */}
// 	<div className='team-card__header'>
// 		<div className='team-card__identity'>
// 			<div className='team-card__avatar'>
// 				{team.avatar_url
// 					? (
// 						<img
// 							src={team.avatar_url}
// 							alt={team.name}
// 						/>
// 					)
// 					: <IconUsers size={20} />}
// 			</div>
// 			<div className='team-card__info'>
// 				<h3 className='team-card__name' title={team.name}>
// 					{team.name}
// 				</h3>
// 				<p className='team-card__slug'>@{team.slug}</p>
// 			</div>
// 		</div>

// 		{isActive && <span className='team-card__active-badge'>Active</span>}

// 		<button className='team-card__menu-btn'>
// 			<IconDotsVertical size={16} />
// 		</button>
// 	</div>

// 	{/* Body / Description */}
// 	<div className='team-card__content'>
// 		<p className='team-card__description' title={description}>
// 			{description}
// 		</p>
// 	</div>

// 	{/* Tags / Info */}
// 	<div className='team-card__tags'>
// 		<span
// 			className={`team-card__tag ${
// 				isOwner ? 'team-card__tag--owner' : 'team-card__tag--member'
// 			}`}
// 		>
// 			<IconShield size={10} />
// 			{team.user_role.toUpperCase()}
// 		</span>

// 		{team.payout_model === 'smart_split' && (
// 			<span className='team-card__tag team-card__tag--smart-split'>
// 				<IconCurrencyDollar size={10} />
// 				Smart Split
// 			</span>
// 		)}
// 	</div>

// 	{/* Footer / Meta */}
// 	<div className='team-card__footer'>
// 		<div className='team-card__stat'>
// 			<IconUsers size={14} />
// 			<span>{team.member_count} Members</span>
// 		</div>

// 		<button
// 			className={`team-card__switch-btn ${isActive ? 'team-card__switch-btn--disabled' : ''}`}
// 			onClick={handleSwitch}
// 			disabled={isActive}
// 		>
// 			{isActive ? 'Current' : 'Switch'}
// 			{!isActive && <IconArrowRight size={14} />}
// 		</button>
// 	</div>
// </div>
