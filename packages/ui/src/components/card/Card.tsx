import '../../styles/components/card.css';
import { VNode } from 'preact';

export type metaPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/**
 * @interface CardProps
 */
export interface CardProps {
	/** Controls the layout flow. Defaults to 'grid' */
	layout?: 'grid' | 'list' | 'masonry';
	owner?: {
		url?: string;
		profilePictureUrl?: string;
		name: string;
		handle?: string;
	};
	type?: string;
	title?: string;
	description?: string;
	tags?: {
		label: string;
		action?: () => void;
	}[];
	bannerUrl?: string;
	meta?: Partial<Record<metaPosition, VNode>>;
	onClick?: (() => void) | (() => Promise<void>);
	actions?: {
		icon: VNode;
		label: string;
		action: () => void;
	}[];
	menuActions?: {
		icon?: VNode;
		label: string;
		action: () => void;
	}[];
}

/**
 * @function Card
 * @description A multi-use card component for displaying entities like Teams, Products, and Services.
 */
export function Card(props: CardProps) {
	const { layout = 'grid' } = props;

	const classes = [
		'card',
		props.type,
		layout === 'list' && 'card--list',
	].filter(Boolean).join(' ');

	return (
		<div class={classes} onClick={props.onClick}>
			<div class='card__header'>
				<div class='card__header__actions'>
					<a class='card__owner' href={props.owner?.url} onClick={(e) => e.stopPropagation()}>
						<img
							class='card__owner__avatar'
							src={props.owner?.profilePictureUrl}
							alt={props.owner?.name}
						/>
						<div class='card__owner__info'>
							<span class='card__owner-name'>{props.owner?.name}</span>
							<span class='card__owner-handle'>@{props.owner?.handle}</span>
						</div>
					</a>
					<div class='card__actions'>
						{props.actions?.map((action) => (
							<button
								type='button'
								key={action.label}
								class='card__action'
								onClick={(e) => {
									e.stopPropagation();
									action.action();
								}}
							>
								{action.icon}
							</button>
						))}
						{props.menuActions && (
							<div class='card__menu' onClick={(e) => e.stopPropagation()}>
								<button type='button' class='card__menu-button'>
									⋮
								</button>
								<div class='card__menu-content'>
									{props.menuActions.map((menuAction) => (
										<button
											type='button'
											key={menuAction.label}
											class='card__menu-action'
											onClick={menuAction.action}
										>
											{menuAction.icon}
											{menuAction.label}
										</button>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
				<div class='card__banner'>
					<img
						class='card__banner-image card__banner-image__backdrop'
						src={props.bannerUrl}
						alt={props.title}
					/>
					<img
						class='card__banner-image card__banner-image__foreground'
						src={props.bannerUrl}
						alt={props.title}
					/>
				</div>
			</div>
			<div class='card__content'>
				<div>
					<h5 class='card__type'>{props.type}</h5>
					<h3 class='card__title'>{props.title}</h3>
					<p class='card__description'>{props.description}</p>
				</div>
				<div class='card__footer'>
					<div class='card__footer__top'>
						<div class='card__meta card__meta__top-left'>
							{props.meta?.['top-left'] ? props.meta?.['top-left'] : (
								<div class='card__tags'>
									{props.tags?.map((tag) => (
										<button
											type='button'
											key={tag.label}
											class='card__tag'
											onClick={(e) => {
												e.stopPropagation();
												tag.action?.();
											}}
										>
											{tag.label}
										</button>
									))}
								</div>
							)}
						</div>
						<div class='card__meta card__meta__top-right'>
							{props.meta?.['top-right'] && props.meta?.['top-right']}
						</div>
					</div>
					<hr />
					<div class='card__footer__bottom'>
						<div class='card__meta card__meta__bottom-left'>
							{props.meta?.['bottom-left'] && props.meta?.['bottom-left']}
						</div>
						<div class='card__meta card__meta__bottom-right'>
							{props.meta?.['bottom-right'] && props.meta?.['bottom-right']}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
