// #region Imports
import '../styles/islands/profile-island.css';
import { useEffect, useRef } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { IconButton } from '@projective/ui';
import { IconArrowLeft } from '@tabler/icons-preact';
import { useProfileContext } from '../contexts/ProfileContext.tsx';
import ProfileBanner from '../components/profile-banner.tsx';
import ProfileHeader from '../components/profile-header.tsx';
import ProfileMeta from '../components/profile-meta.tsx';
import ProfileBody from '../components/body/body.tsx';
import ProfileTabs from '../components/tabs/tabs.tsx';
// #endregion

export default function ProfileIsland() {
	const { isLoading } = useProfileContext();
	const bannerRef = useRef<HTMLDivElement>(null);
	const isBannerPast = useSignal(false);

	useEffect(() => {
		const el = bannerRef.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				isBannerPast.value = !entry.isIntersecting;
			},
			{ rootMargin: '-80px 0px 0px 0px', threshold: 0 },
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, [isLoading.value]);

	const showAvatarInHeader = !isLoading.value && isBannerPast.value;

	return (
		<div class='profile-island'>
			<div class='profile-island__left'>
				<IconButton
					aria-label='Go back'
					className='profile-island__left__back'
					onClick={() => globalThis.history.back()}
				>
					<IconArrowLeft />
				</IconButton>
			</div>

			{/* Main Content Column */}
			<div class='profile-island__content'>
				<div class='profile-island__banner' ref={bannerRef}>
					<ProfileBanner />
				</div>

				<div class='profile-island__header'>
					<ProfileHeader showAvatar={showAvatarInHeader} />
				</div>

				<div class='profile-island__body'>
					<div class='profile-island__center'>
						<ProfileBody />
					</div>
					<div class='profile-island__sidebar'>
						<ProfileMeta />
					</div>
				</div>
				<div class='profile-island__tab-body'>
					<ProfileTabs />
				</div>
			</div>
		</div>
	);
}
