import { Carousel } from '@projective/data';
import '../../styles/components/home/categories.css';

// #region Interfaces

/**
 * Represents a simplified category link for the home page exploration.
 */
export interface CategoryData {
	name: string;
	href: string;
}

interface ExploreHomeCategoryProps {
	category: CategoryData;
}

// #endregion

// #region Static Data

const MOCK_CATEGORIES: CategoryData[] = [
	{ name: 'Technology', href: '/explore/technology' },
	{ name: 'Design', href: '/explore/design' },
	{ name: 'Business', href: '/explore/business' },
	{ name: 'Marketing', href: '/explore/marketing' },
	{ name: 'Engineering', href: '/explore/engineering' },
	{ name: 'Science', href: '/explore/science' },
	{ name: 'Art', href: '/explore/art' },
	{ name: 'Music', href: '/explore/music' },
];

// #endregion

// #region Components

/**
 * Individual category card rendered within the carousel.
 */
function ExploreHomeCategory({ category }: ExploreHomeCategoryProps) {
	return (
		<a href={category.href} class='explore-home-category' draggable={false}>
			{category.name}
		</a>
	);
}

/**
 * Island component displaying a horizontal, fluid carousel of categories.
 * Encapsulates the interactive Carousel within a hydrated client boundary.
 */
export default function ExploreHomeCategories() {
	return (
		<div class='explore-home-categories' style={{ display: 'flex' }}>
			<Carousel<CategoryData>
				dataSource={MOCK_CATEGORIES}
				renderItem={(item) => <ExploreHomeCategory category={item} />}
				itemMinWidth={200}
				numVisible={4}
				arrowPosition='outside'
				indicatorPosition='bottom'
			/>
		</div>
	);
}

// #endregion
