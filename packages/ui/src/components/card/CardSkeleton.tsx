/* #region Imports */
import '../../styles/components/card.css';
import { Skeleton } from '../skeleton/Skeleton.tsx';
/* #endregion */

export interface CardSkeletonProps {
	/** Controls the layout flow to match the original Card. Defaults to 'grid' */
	layout?: 'grid' | 'list' | 'masonry';
}

/**
 * @function CardSkeleton
 * @description A loading skeleton that flawlessly mirrors the primary Card component's DOM structure.
 * Supports different layout variants to prevent layout shifts.
 */
export function CardSkeleton({ layout = 'grid' }: CardSkeletonProps) {
	const classes = [
		'card',
		layout === 'list' && 'card--list',
	].filter(Boolean).join(' ');

	return (
		<div class={classes} aria-hidden='true'>
			{/* Header Section */}
			<div class='card__header'>
				<div class='card__header__actions'>
					<div class='card__owner' style={{ pointerEvents: 'none', gap: '12px' }}>
						<Skeleton variant='avatar' width='40px' height='40px' />
						<div class='card__owner__info'>
							<Skeleton
								variant='text'
								width='100px'
								height='1rem'
								style={{ marginBottom: '4px' }}
							/>
							<Skeleton variant='text' width='70px' height='0.75rem' />
						</div>
					</div>
					<div class='card__actions' style={{ gap: '8px' }}>
						<Skeleton variant='icon' width='32px' height='32px' style={{ borderRadius: '50%' }} />
						<Skeleton variant='icon' width='32px' height='32px' style={{ borderRadius: '50%' }} />
					</div>
				</div>
				<div class='card__banner' style={{ display: 'block' }}>
					{/* Overriding min-height so it naturally spans the banner area */}
					<Skeleton
						variant='image'
						className='card__banner-image'
						style={{ minHeight: '180px', height: '100%', width: '100%' }}
					/>
				</div>
			</div>

			{/* Content Section */}
			<div class='card__content'>
				<div>
					<Skeleton
						variant='text'
						width='60px'
						height='0.75rem'
						style={{ marginBottom: '0.5rem' }}
					/>
					<Skeleton variant='text' width='75%' height='1.5rem' style={{ marginBottom: '0.5rem' }} />
					<Skeleton variant='multiline' lines={3} />
				</div>

				{/* Footer Section */}
				<div class='card__footer'>
					<div class='card__footer__top'>
						<div class='card__meta card__meta__top-left' style={{ display: 'flex', gap: '8px' }}>
							<Skeleton variant='badge' width='50px' />
							<Skeleton variant='badge' width='70px' />
						</div>
						<div class='card__meta card__meta__top-right'>
							<Skeleton variant='text' width='40px' />
						</div>
					</div>
					<hr />
					<div class='card__footer__bottom'>
						<div class='card__meta card__meta__bottom-left'>
							<Skeleton variant='text' width='80px' />
						</div>
						<div class='card__meta card__meta__bottom-right'>
							<div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
								<Skeleton variant='icon' width='1rem' height='1rem' />
								<Skeleton variant='text' width='60px' />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
