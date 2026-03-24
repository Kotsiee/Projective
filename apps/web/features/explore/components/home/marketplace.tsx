import { DataDisplay } from '@projective/data';
import '../../styles/components/home/marketplace.css';

// #region Interfaces
/**
 * Represents a single item in the marketplace feed.
 */
export interface MarketplaceItem {
	id: string;
	title: string;
	price: number;
	imageUrl: string;
	/** * CRITICAL for Masonry: Providing an aspect ratio allows the grid to
	 * calculate the exact height before the image finishes downloading,
	 * preventing the layout from jumping around.
	 */
	aspectRatio: number;
}
// #endregion

// #region Mock Data
const MOCK_DATA: MarketplaceItem[] = [
	{
		id: '1',
		title: 'Vintage Leather Jacket',
		price: 120.00,
		imageUrl: 'https://picsum.photos/seed/jacket/400/533',
		aspectRatio: 400 / 533,
	},
	{
		id: '2',
		title: 'Mechanical Keyboard',
		price: 85.50,
		imageUrl: 'https://picsum.photos/seed/keyboard/600/400',
		aspectRatio: 600 / 400,
	},
	{
		id: '3',
		title: 'Minimalist Desk Lamp',
		price: 45.00,
		imageUrl: 'https://picsum.photos/seed/lamp/400/400',
		aspectRatio: 1,
	},
	{
		id: '4',
		title: 'Ceramic Coffee Mug',
		price: 15.00,
		imageUrl: 'https://picsum.photos/seed/mug/400/400',
		aspectRatio: 1,
	},
	{
		id: '5',
		title: 'Noise-Cancelling Headphones',
		price: 299.99,
		imageUrl: 'https://picsum.photos/seed/headphones/400/533',
		aspectRatio: 400 / 533,
	},
	{
		id: '6',
		title: 'Ergonomic Office Chair',
		price: 199.00,
		imageUrl: 'https://picsum.photos/seed/chair/400/600',
		aspectRatio: 400 / 600,
	},
	{
		id: '7',
		title: 'Wooden Monitor Stand',
		price: 35.00,
		imageUrl: 'https://picsum.photos/seed/stand/600/300',
		aspectRatio: 600 / 300,
	},
	{
		id: '8',
		title: 'Wireless Gaming Mouse',
		price: 59.99,
		imageUrl: 'https://picsum.photos/seed/mouse/400/400',
		aspectRatio: 1,
	},
	{
		id: '9',
		title: 'Canvas Backpack',
		price: 65.00,
		imageUrl: 'https://picsum.photos/seed/backpack/400/533',
		aspectRatio: 400 / 533,
	},
	{
		id: '10',
		title: 'Smart Home Speaker',
		price: 89.00,
		imageUrl: 'https://picsum.photos/seed/speaker/400/400',
		aspectRatio: 1,
	},
	{
		id: '11',
		title: 'Abstract Wall Art',
		price: 40.00,
		imageUrl: 'https://picsum.photos/seed/art/400/600',
		aspectRatio: 400 / 600,
	},
	{
		id: '12',
		title: 'Stainless Steel Water Bottle',
		price: 25.00,
		imageUrl: 'https://picsum.photos/seed/bottle/400/533',
		aspectRatio: 400 / 533,
	},
];
// #endregion

// #region Components

/**
 * Individual card component for a marketplace item.
 * Designed to be rendered inside the Masonry Layout Engine.
 * * @param props - The item data to render
 */
export function ExploreHomeMarketplaceItem({ item }: { item: MarketplaceItem }) {
	return (
		<div className='marketplace-item'>
			{
				/* By applying the aspect ratio to a wrapper, the masonry engine can instantly
                measure the final DOM height of this block even if the image takes 2 seconds to load.
            */
			}
			<div
				className='marketplace-item__image-wrapper'
				style={{ aspectRatio: String(item.aspectRatio) }}
			>
				<img
					src={item.imageUrl}
					alt={item.title}
					className='marketplace-item__image'
					loading='lazy'
				/>
			</div>
			<div className='marketplace-item__content'>
				<h3 className='marketplace-item__title'>{item.title}</h3>
				<p className='marketplace-item__price'>${item.price.toFixed(2)}</p>
			</div>
		</div>
	);
}

/**
 * The main masonry grid wrapper for the marketplace.
 * Connects the `@projective/data` virtualizer with the marketplace UI.
 */
export default function ExploreHomeMarketplaceGrid() {
	return (
		<DataDisplay<MarketplaceItem, unknown>
			mode='masonry'
			dataSource={MOCK_DATA}
			// Let the container stretch, and the engine will pack as many 250px columns as possible
			columnWidth={150}
			gap={16}
			estimateHeight={350}
			// Use the window's native scrollbar for infinite scrolling
			scrollMode='window'
			// Render mapping
			renderItem={(item) => <ExploreHomeMarketplaceItem item={item} />}
			// Optional: enable selection or interactivity
			interactive
			// FIX: Enforce 100% width so the DataDisplay doesn't shrink-wrap the 0-width absolute children
			style={{ width: '100%', display: 'block' }}
		/>
	);
}
// #endregion
