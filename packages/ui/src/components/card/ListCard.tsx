/* apps/web/src/components/cards/ListCard.tsx */
import '../../styles/components/list-card.css';
import { ComponentChildren } from 'preact';

export interface ListCardProps {
	id: string;
	href?: string; // REQUIRED for native link behavior
	typeLabel?: string;
	title: string;
	subtitle?: string;
	description?: string;
	imageUrl?: string;
	imageFallback?: string;
	footer?: ComponentChildren;
	/** Optional callback for the split-pane preview logic */
	onClick?: (e: MouseEvent) => void;
}

export function ListCard(props: ListCardProps) {
	return (
		<a
			href={props.href}
			class='list-card list-card--link-root'
			onClick={props.onClick}
			role='article'
		>
			{
				/* <div class='list-card__image-container'>
				{props.imageUrl
					? <img src={props.imageUrl} alt={props.title} class='list-card__image' />
					: (
						<div class='list-card__image list-card__image--fallback'>
							{props.imageFallback || props.title.charAt(0)}
						</div>
					)}
			</div> */
			}

			<div class='list-card__content'>
				<div class='list-card__header'>
					{props.typeLabel && <span class='list-card__type'>{props.typeLabel}</span>}
					<h3 class='list-card__title'>{props.title}</h3>
					{props.subtitle && <p class='list-card__subtitle'>{props.subtitle}</p>}
				</div>

				{props.description && <p class='list-card__description'>{props.description}</p>}

				{props.footer && (
					<div class='list-card__footer'>
						{props.footer}
					</div>
				)}
			</div>
		</a>
	);
}
