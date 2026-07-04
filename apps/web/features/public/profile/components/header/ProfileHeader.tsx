/**
 * @file ProfileHeader.tsx
 * @description Lightweight profile canvas header: the overlapping avatar,
 * name / handle / role subtitle, a single primary CTA (public viewers only),
 * and a clean inline stat row (ratings, services, products). Secondary
 * engagement actions live in the side-nav action core; duplicated meta
 * (location, time, rate) lives only in the right-hand details pane.
 */

import { Avatar } from '@projective/ui';
import {
	IconBox,
	IconBriefcase,
	IconRosetteDiscountCheckFilled,
	IconStarFilled,
	IconUserStar,
} from '@tabler/icons-preact';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import { ProfilePrimaryCTA } from './ProfileCTAs.tsx';

export default function ProfileHeader() {
	const { profile, isEditing, isOwn } = useProfileContext();
	const p = profile.value;
	const own = isOwn.value;
	const editing = isEditing.value && own;

	return (
		<>
			<div class='profile__head'>
				<div class='profile__identity'>
					<div class='profile__avatar'>
						<Avatar name={p.displayName} src={p.avatarUrl} size={132} />
					</div>
					<div class='profile__namecol'>
						<div class='profile__name-row'>
							<h1 class='profile__name'>{p.displayName}</h1>
							{p.verified && (
								<span class='profile__verified' title='Verified'>
									<IconRosetteDiscountCheckFilled size={20} />
								</span>
							)}
						</div>
						<span class='profile__handle'>@{p.handle}</span>
						<span class='profile__subtitle'>{p.subtitle}</span>
					</div>
				</div>

				{!editing && !own && (
					<div class='profile__actions'>
						<ProfilePrimaryCTA />
					</div>
				)}
			</div>

			{!editing && (
				<div class='profile__stats'>
					<span class='profile-stat'>
						<IconStarFilled size={15} class='profile-stat__star' />
						<b>{p.meta.ratings.asFreelancer.score.toFixed(1)}</b>
						<span class='profile-stat__muted'>({p.meta.ratings.asFreelancer.count})</span>
					</span>
					<span class='profile-stat'>
						<IconUserStar size={15} />
						<b>{p.meta.ratings.asClient.score.toFixed(1)}</b>
						<span class='profile-stat__muted'>({p.meta.ratings.asClient.count})</span>
					</span>
					<span class='profile-stat'>
						<IconBriefcase size={15} />
						<b>{p.services.length}</b> Services
					</span>
					<span class='profile-stat'>
						<IconBox size={15} />
						<b>{p.productCount}</b> Products
					</span>
				</div>
			)}
		</>
	);
}
