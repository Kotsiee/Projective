/* #region Imports */
import '../../styles/components/list-card.css';
import { Skeleton } from '../skeleton/Skeleton.tsx';
/* #endregion */

/**
 * @function ListCardSkeleton
 * @description A loading skeleton that perfectly mimics the DOM structure and spacing
 * of the ListCard component to prevent cumulative layout shift (CLS).
 */
export function ListCardSkeleton() {
	return (
		<div class='list-card' aria-hidden='true'>
			{/* Left Column: Thumbnail */}
			<div class='list-card__image-container'>
				<Skeleton
					variant='image'
					className='list-card__image'
					style={{ minHeight: 'unset' }} // Override default skeleton image min-height
				/>
			</div>

			{/* Right Column: Content */}
			<div class='list-card__content'>
				<div class='list-card__header'>
					{/* Type Label */}
					<Skeleton
						variant='text'
						width='80px'
						height='0.75rem'
						style={{ marginBottom: '0.125rem' }}
					/>
					{/* Title */}
					<Skeleton
						variant='text'
						width='60%'
						height='1.25rem'
					/>
					{/* Subtitle */}
					<Skeleton
						variant='text'
						width='40%'
						height='0.8rem'
						style={{ marginTop: '0.25rem' }}
					/>
				</div>

				{/* Description */}
				<div class='list-card__description'>
					<Skeleton variant='multiline' lines={2} />
				</div>

				{/* Footer Meta Simulation */}
				<div class='list-card__footer'>
					<div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
						<Skeleton variant='icon' width='1.2rem' height='1.2rem' />
						<Skeleton variant='text' width='120px' height='1rem' />
					</div>
				</div>
			</div>
		</div>
	);
}
