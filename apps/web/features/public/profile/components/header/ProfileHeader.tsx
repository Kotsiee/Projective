/**
 * @file ProfileHeader.tsx
 * @description Minimal profile canvas header: the avatar overlaps the banner
 * while the name/handle/subtitle sit cleanly below it. The subtitle is the
 * headline. A single primary CTA shows for public viewers, and a clean counter
 * string (Services · Products · Active projects) replaces the old rating chips.
 */

import { Avatar } from '@projective/ui';
import { IconRosetteDiscountCheckFilled } from '@tabler/icons-preact';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import { ProfilePrimaryCTA } from './ProfileCTAs.tsx';

export default function ProfileHeader() {
	const { profile, isEditing, isOwn } = useProfileContext();
	const p = profile.value;
	const own = isOwn.value;
	const editing = isEditing.value && own;

	const activeProjects = p.projects.filter((pr) => pr.status === 'active').length;

	return (
		<>
			<div class='profile__head'>
				<div class='profile__avatar'>
					<Avatar name={p.displayName} src={p.avatarUrl} size={132} />
				</div>

				<div class='profile__headrow'>
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

					{!editing && !own && (
						<div class='profile__actions'>
							<ProfilePrimaryCTA />
						</div>
					)}
				</div>
			</div>

			{!editing && (
				<div class='profile__stats'>
					<span class='profile-stat'>
						<b>{p.services.length}</b> Services
					</span>
					<span class='profile-stat__sep'>·</span>
					<span class='profile-stat'>
						<b>{p.productCount}</b> Products
					</span>
					<span class='profile-stat__sep'>·</span>
					<span class='profile-stat'>
						<b>{activeProjects}</b> Active {activeProjects === 1 ? 'project' : 'projects'}
					</span>
				</div>
			)}
		</>
	);
}
