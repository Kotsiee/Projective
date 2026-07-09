/**
 * @file DetailsMedia.tsx
 * @description The visual-identity canvas at the top of the Details editing module: the premium
 * header banner graphic and the overlapping avatar / profile-picture canvas, each with an in-place
 * "change" affordance. No asset pipeline yet — the change buttons are stubs — but the layout mirrors
 * the public banner + avatar so the owner edits what they see.
 */

import { Avatar, Button, toast } from '@projective/ui';
import { IconCamera, IconPhoto } from '@tabler/icons-preact';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import { mediaBackground } from '../../utils.ts';

export default function DetailsMedia() {
	const { profile } = useProfileContext();
	const p = profile.value;

	const bannerStyle = p.bannerUrl
		? mediaBackground(p.bannerUrl)
		: { background: p.bannerGradient ?? 'var(--card-dark)' };

	return (
		<section class='pedit__card pedit-media'>
			<div class='pedit-media__banner' style={bannerStyle}>
				<Button
					variant='secondary'
					size='small'
					startIcon={<IconPhoto size={16} />}
					className='pedit-media__banner-btn'
					onClick={() => toast.success('Choose a new banner graphic')}
				>
					Change banner
				</Button>

				<div class='pedit-media__avatar'>
					<Avatar name={p.displayName} src={p.avatarUrl} size={84} />
					<button
						type='button'
						class='pedit-media__avatar-btn'
						aria-label='Change profile picture'
						onClick={() => toast.success('Choose a new profile picture')}
					>
						<IconCamera size={16} />
					</button>
				</div>
			</div>
			<p class='pedit-media__hint'>
				Your banner and profile picture anchor the top of your public profile. Use a 3:1 banner for
				the cleanest crop.
			</p>
		</section>
	);
}
