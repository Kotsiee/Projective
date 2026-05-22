import { useEffect, useRef } from 'preact/hooks';
import { useSignal } from '@preact/signals';
import { IconButton } from '@projective/ui';
import { IconArrowLeft } from '@tabler/icons-preact';
import { useViewContext } from '../contexts/ViewContext.tsx';
import ViewHeader from '../components/view/view-header.tsx';
import ViewMeta from '../components/view/view-meta.tsx';
import ViewBanner from '../components/view/view-banner.tsx';
import '../styles/islands/view.css';
import ViewBody from '@features/public/explore/components/view/body/body.tsx';

export default function ViewIsland() {
	const { isLoading, displayData } = useViewContext();
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

	const hasBanner = !!displayData.value.banner;
	const shouldShowBannerArea = isLoading.value || hasBanner;

	const showAvatarInHeader = !isLoading.value && (!hasBanner || isBannerPast.value);

	return (
		<div class='view-island'>
			<div class='view-island__left'>
				<IconButton aria-label='Go back' className='view-island__left__back' href='/explore'>
					<IconArrowLeft />
				</IconButton>
			</div>

			<div class='view-island__content'>
				{shouldShowBannerArea && (
					<div class='view-island__banner' ref={bannerRef}>
						<ViewBanner />
					</div>
				)}

				<div class='view-island__header'>
					<ViewHeader showAvatar={showAvatarInHeader} />
				</div>

				<div class='view-island__body'>
					<div class='view-island__center'>
						<div class='view-island__center__content'>
							<ViewBody />
						</div>
					</div>
					<div class='view-island__right'>
						<ViewMeta />
					</div>
				</div>
			</div>
		</div>
	);
}
