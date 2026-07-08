import '../../styles/components/home/cinematic.css';
import { Carousel } from '@projective/data';
import { Button } from '@projective/ui';
import { IconArrowRight, IconSparkles, IconStarFilled, IconTrendingUp } from '@tabler/icons-preact';
import type { ExploreEntity } from '@projective/types';
import { isProfileType, recommended } from '../../data/exploreSeed.ts';

function slideHref(e: ExploreEntity): string {
	return isProfileType(e.entity_type) ? `/${e.owner_handle}` : `/view/${e.id}`;
}

function CinematicSlide({ entity }: { entity: ExploreEntity }) {
	return (
		<a
			class={`cinematic-slide accent-${entity.accent}`}
			href={slideHref(entity)}
			style={{ background: entity.banner ?? undefined }}
			draggable={false}
		>
			<div class='cinematic-slide__scrim' />
			<div class='cinematic-slide__content'>
				<span class='cinematic-slide__eyebrow'>
					{entity.is_sponsored
						? (
							<>
								<IconSparkles size={14} /> Sponsored
							</>
						)
						: (
							<>
								<IconTrendingUp size={14} /> Trending now
							</>
						)}
				</span>
				<h2 class='cinematic-slide__title'>{entity.display_title}</h2>
				<p class='cinematic-slide__desc'>{entity.display_description}</p>
				<div class='cinematic-slide__foot'>
					<span class='cinematic-slide__rating'>
						<IconStarFilled size={15} />
						{entity.rating_average.toFixed(1)}
						<i>· {entity.owner_name}</i>
					</span>
					<Button variant='primary' rounded endIcon={<IconArrowRight size={16} />}>
						Explore
					</Button>
				</div>
			</div>
		</a>
	);
}

/**
 * @function ExploreHomeCinematic
 * @description Full-width, auto-scrolling cinematic banner showcasing trending, top-rated, and
 * natively-styled sponsored entries.
 */
export default function ExploreHomeCinematic() {
	const slides = recommended();
	return (
		<div class='cinematic'>
			<Carousel<ExploreEntity>
				dataSource={slides}
				renderItem={(item) => <CinematicSlide entity={item} />}
				numVisible={1}
				circular
				autoplay
				autoplayInterval={5000}
				arrowPosition='inside'
				indicatorPosition='bottom'
			/>
		</div>
	);
}
