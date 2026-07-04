/**
 * @file ProfileStickyHeader.tsx
 * @description The morphed header that slots into the sticky middle-nav once
 * the banner scrolls away — a compressed avatar thumbnail beside the name +
 * presence, with the single primary CTA trailing (public viewers).
 */

import { Avatar } from '@projective/ui';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import { ProfilePrimaryCTA } from './ProfileCTAs.tsx';
import { StatusDot } from './StatusDot.tsx';

export default function ProfileStickyHeader() {
	const { profile, isOwn } = useProfileContext();
	const p = profile.value;

	return (
		<div class='profile-sticky'>
			<div class='profile-sticky__id'>
				<Avatar name={p.displayName} src={p.avatarUrl} size={34} />
				<div>
					<div class='profile-sticky__name'>{p.displayName}</div>
					<div class='profile-sticky__status'>
						<StatusDot status={p.status} /> {p.statusLabel}
					</div>
				</div>
			</div>
			{!isOwn.value && (
				<div class='profile-sticky__actions'>
					<ProfilePrimaryCTA compact />
				</div>
			)}
		</div>
	);
}
