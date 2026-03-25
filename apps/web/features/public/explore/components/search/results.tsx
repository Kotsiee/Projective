import { useMemo } from 'preact/hooks';
import { Carousel, DataDisplay, RestDataSource } from '@projective/data';
import { useExploreContext } from '../../contexts/ExploreContext.tsx';
import { IconArrowRight, IconStar } from '@tabler/icons-preact';
import { Button, Card } from '@projective/ui';
import { SearchTab } from '../../contracts/Explore.ts';

interface CategoryCarouselProps {
	title: string;
	targetTab: SearchTab;
	dataSource: RestDataSource<any, any>;
}

function CategoryCarousel({ title, targetTab, dataSource }: CategoryCarouselProps) {
	const { searchTab } = useExploreContext();

	return (
		<section class='explore-federated-section'>
			<div class='explore-federated-section__header'>
				<h2 class='explore-federated-section__title'>{title}</h2>
				<Button
					variant='link'
					endIcon={<IconArrowRight size={16} />}
					onClick={() => searchTab.value = targetTab}
				>
					View all {title}
				</Button>
			</div>
			<Carousel
				dataSource={dataSource}
				pageSize={10}
				itemMinWidth={300}
				arrowPosition='outside'
				indicatorPosition='hidden'
				renderItem={(item) => (
					<div style={{ maxWidth: '320px', width: '100%' }}>
						<Card
							layout='grid'
							type={item.type}
							title={item.title}
							description={item.description}
							owner={item.owner}
							bannerUrl={item.bannerUrl}
							onClick={() => console.log('Navigating to:', item.id)}
						/>
					</div>
				)}
			/>
		</section>
	);
}

/**
 * @function ExploreSearchResults
 * @description Virtualized data display, now wired up to the live Supabase API.
 */
export default function ExploreSearchResults() {
	const { viewMode, searchTab, exploreQuery } = useExploreContext();

	const teamSource = useMemo(() =>
		new RestDataSource({
			url: '/api/v1/public/search/teams',
			defaultParams: { query: exploreQuery.value || '' },
			keyExtractor: (item: any) => item.id,
		}), [exploreQuery.value]);

	const projectSource = useMemo(() =>
		new RestDataSource({
			url: '/api/v1/public/search/projects',
			defaultParams: { query: exploreQuery.value || '' },
			keyExtractor: (item: any) => item.id,
		}), [exploreQuery.value]);

	if (searchTab.value === 'all') {
		return (
			<div class='explore-federated-view'>
				<CategoryCarousel title='Trending Teams' targetTab='work' dataSource={teamSource} />
				<CategoryCarousel title='Open Projects' targetTab='projects' dataSource={projectSource} />
			</div>
		);
	}

	const activeData = searchTab.value === 'projects' ? projectSource : teamSource;

	return (
		<div class='explore-search-results'>
			<DataDisplay
				dataSource={activeData}
				mode={viewMode.value}
				columnWidth={260}
				gap={16}
				estimateHeight={viewMode.value === 'grid' ? 380 : 220}
				scrollMode='window'
				renderItem={(item: any) => (
					<Card
						layout={viewMode.value}
						type={item.type}
						title={item.title}
						description={item.description}
						owner={item.owner}
						bannerUrl={item.bannerUrl}
						onClick={() => console.log('Navigating to:', item.id)}
					/>
				)}
			/>
		</div>
	);
}
