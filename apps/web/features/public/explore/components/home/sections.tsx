import '../../styles/components/home/sections.css';
import { Carousel, DataDisplay } from '@projective/data';
import type { ExploreEntity } from '@projective/types';
import ExploreSection from '../shared/section.tsx';
import ExploreBanner from '../shared/banner.tsx';
import ExploreCard from '../shared/explore-card.tsx';
import { trending } from '../../data/exploreSeed.ts';

/**
 * @function ExploreHomeSections
 * @description The engagement-optimized section hierarchy:
 *   1. Popular Services (horizontal carousel)
 *   2. Dynamic Banner 1 (full-width sponsored spotlight)
 *   3. Trending Products (fluid masonry)
 *   4. Profiles (structured matrix grid)
 *   5. Dynamic Banners 2 & 3 (side-by-side half-width blocks)
 *   6. Projects (wide card grid — max 2 per row)
 */
export default function ExploreHomeSections() {
	const services = trending('service');
	const products = trending('product');
	const profiles = trending('person');
	const projects = trending('project');

	return (
		<div class='home-sections'>
			{/* 1. Popular Services — horizontal carousel */}
			<ExploreSection
				eyebrow='Hire in minutes'
				title='Popular Services'
				viewAllLabel='View all services'
				viewAllHref='/explore?type=service'
			>
				<div class='home-carousel'>
					<Carousel<ExploreEntity>
						dataSource={services}
						renderItem={(item) => <ExploreCard entity={item} variant='standard' />}
						itemMinWidth={300}
						arrowPosition='inside'
						indicatorPosition='hidden'
					/>
				</div>
			</ExploreSection>

			{/* 2. Dynamic Banner 1 — full-width spotlight */}
			<ExploreBanner
				sponsored
				accent='mint'
				title='Ship your MVP in 4 weeks with a vetted squad'
				text='Native-styled sponsored spotlight. Assemble a cross-functional team and go from idea to launch — escrow-protected, milestone by milestone.'
				ctaLabel='Start a project'
				ctaHref='/explore?type=project'
				glyph='🚀'
			/>

			{/* 3. Trending Products — fluid masonry */}
			<ExploreSection
				eyebrow='Buy once, ship faster'
				title='Trending Products'
				viewAllLabel='View all products'
				viewAllHref='/explore?type=product'
			>
				<DataDisplay<ExploreEntity, unknown>
					mode='masonry'
					dataSource={products}
					columnWidth={230}
					gap={18}
					estimateHeight={320}
					scrollMode='window'
					renderItem={(item) => <ExploreCard entity={item} variant='product' />}
					style={{ width: '100%', display: 'block' }}
				/>
			</ExploreSection>

			{/* 4. Profiles — structured matrix grid */}
			<ExploreSection
				eyebrow='People & teams'
				title='Top Talent & Teams'
				subtitle='Freelancers, agencies and studios ready to take on your project.'
				viewAllLabel='View all profiles'
				viewAllHref='/explore?type=person'
			>
				<DataDisplay<ExploreEntity, unknown>
					mode='grid'
					dataSource={profiles}
					columnWidth={272}
					gap={18}
					estimateHeight={342}
					scrollMode='window'
					selectionMode='none'
					renderItem={(item) => <ExploreCard entity={item} variant='profile' />}
					style={{ width: '100%', display: 'block' }}
				/>
			</ExploreSection>

			{/* 5. Dynamic Banners 2 & 3 — side-by-side half-width */}
			<div class='home-banner-pair'>
				<ExploreBanner
					size='split'
					accent='violet'
					eyebrow='For clients'
					title='Post a project, get matched instantly'
					text='Describe your scope and our engine surfaces the right teams within minutes.'
					ctaLabel='Post a project'
					ctaHref='/dashboard/projects/new'
					glyph='🎯'
				/>
				<ExploreBanner
					size='split'
					accent='amber'
					eyebrow='For freelancers'
					title='Grow your practice on Projective'
					text='Publish services, join open projects, and get paid through protected escrow.'
					ctaLabel='Become a freelancer'
					ctaHref='/auth/register'
					glyph='💫'
				/>
			</div>

			{/* 6. Projects — wide card grid, max 2 per row */}
			<ExploreSection
				eyebrow='Open opportunities'
				title='Open Projects'
				subtitle='High-density scope details — apply to the ones that fit.'
				viewAllLabel='View all projects'
				viewAllHref='/explore?type=project'
			>
				<DataDisplay<ExploreEntity, unknown>
					mode='grid'
					dataSource={projects}
					columnWidth={440}
					gap={18}
					estimateHeight={252}
					scrollMode='window'
					selectionMode='none'
					renderItem={(item) => <ExploreCard entity={item} variant='wide' />}
					style={{ width: '100%', display: 'block' }}
				/>
			</ExploreSection>
		</div>
	);
}
