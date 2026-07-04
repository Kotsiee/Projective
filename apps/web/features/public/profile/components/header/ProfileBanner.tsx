/**
 * @file ProfileBanner.tsx
 * @description Full-width canopy banner. Paints either a banner image or the
 * profile's gradient fallback, and exposes a "Change banner" affordance in
 * Editor Mode.
 */

import { IconButton } from '@projective/ui';
import { IconPhotoEdit } from '@tabler/icons-preact';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import { mediaBackground } from '../../utils.ts';

export default function ProfileBanner() {
	const { profile, isEditing, isOwn } = useProfileContext();
	const p = profile.value;

	const style = p.bannerUrl ? mediaBackground(p.bannerUrl) : {
		backgroundImage: p.bannerGradient ?? 'linear-gradient(120deg, var(--card-dark), var(--card))',
	};

	return (
		<div class='profile__banner' style={style} role='img' aria-label={`${p.displayName} banner`}>
			{isEditing.value && isOwn.value && (
				<div class='profile__banner-edit'>
					<IconButton variant='secondary' rounded aria-label='Change banner'>
						<IconPhotoEdit size={18} />
					</IconButton>
				</div>
			)}
		</div>
	);
}
