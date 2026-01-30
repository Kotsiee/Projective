import { VNode } from 'preact';

export interface CardProps {
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
		action?: () => void;
		label: string;
	}[];
	bannerUrl?: string;
	meta?: {
		icon?: VNode;
		label: string;
		value: string | number;
	}[];
	children?: React.ReactNode;
}

export function Card(props: CardProps) {
	return (
		<div class={`card ${props.type}`}>
			<div>
				<a class='card__owner' href={props.owner?.url}>
					<img
						class='card__owner-avatar'
						src={props.owner?.profilePictureUrl}
						alt={props.owner?.name}
					/>
					<div class='card__owner-info'>
						<span class='card__owner-name'>{props.owner?.name}</span>
						<span class='card__owner-handle'>@{props.owner?.handle}</span>
					</div>
				</a>
				<div class='card__banner' style={`background-image: url(${props.bannerUrl})`}>
					<img
						class='card__banner-image'
						src={props.bannerUrl}
						alt={props.title}
					/>
				</div>
			</div>
			<div class='card__content'>
				<div>
					<h3 class='card__title'>{props.title}</h3>
					<p class='card__description'>{props.description}</p>
				</div>
				<div></div>
			</div>
		</div>
	);
}
