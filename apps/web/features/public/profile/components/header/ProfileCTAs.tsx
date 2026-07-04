/**
 * @file ProfileCTAs.tsx
 * @description The single primary engagement CTA shown in the profile canvas —
 * Hire (person/business) or Join team. All secondary actions (Message, Follow,
 * Connect, Share, Save) now live in the side-nav action core, not the header.
 */

import { Button } from '@projective/ui';
import { IconBriefcase, IconUsersPlus } from '@tabler/icons-preact';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';

export function ProfilePrimaryCTA({ compact = false }: { compact?: boolean }) {
	const { profile, viewer, toggleMember } = useProfileContext();
	const p = profile.value;
	const size = compact ? 'small' : 'medium';
	const firstName = p.displayName.split(' ')[0];

	if (p.kind === 'team') {
		return (
			<Button
				variant={viewer.value.isMember ? 'secondary' : 'primary'}
				size={size}
				outlined={viewer.value.isMember}
				startIcon={<IconUsersPlus size={16} />}
				onClick={toggleMember}
			>
				{viewer.value.isMember ? 'Leave team' : 'Join team'}
			</Button>
		);
	}

	return (
		<Button variant='primary' size={size} startIcon={<IconBriefcase size={16} />}>
			{p.kind === 'business' ? 'Hire' : `Hire ${firstName}`}
		</Button>
	);
}
