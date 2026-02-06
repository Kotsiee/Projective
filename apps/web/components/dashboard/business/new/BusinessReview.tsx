import { IconBuildingBank, IconMapPin, IconWorld } from '@tabler/icons-preact';
import { useNewBusinessContext } from '@contexts/NewBusinessContext.tsx';
import '@styles/components/dashboard/teams/new/team-review.css'; // Reuse styles

export default function BusinessReview() {
	const state = useNewBusinessContext();

	return (
		<div className='team-review'>
			<div className='team-review__header'>
				<h3>Review Business</h3>
				<p>Confirm details before establishing this entity.</p>
			</div>

			<div className='team-review__grid'>
				{/* Identity */}
				<div className='team-review__card'>
					<h4 className='team-review__card-title'>Identity</h4>
					<div className='team-review__row'>
						<span className='team-review__label'>Name</span>
						<span className='team-review__value'>{state.name.value}</span>
					</div>
					<div className='team-review__row'>
						<span className='team-review__label'>Handle</span>
						<span className='team-review__value'>@{state.slug.value}</span>
					</div>
					<div className='team-review__row'>
						<span className='team-review__label'>Headline</span>
						<span className='team-review__value'>{state.headline.value || '-'}</span>
					</div>
				</div>

				{/* Financial */}
				<div className='team-review__card'>
					<h4 className='team-review__card-title'>Legal & Finance</h4>
					<div className='team-review__row'>
						<span className='team-review__label'>Entity</span>
						<span className='team-review__value'>{state.legalName.value}</span>
					</div>
					<div className='team-review__row'>
						<span className='team-review__label'>Currency</span>
						<span className='team-review__value'>
							<IconBuildingBank size={14} className='team-review__icon' />
							{state.currency.value}
						</span>
					</div>
					<div className='team-review__row'>
						<span className='team-review__label'>Location</span>
						<span className='team-review__value'>
							<IconMapPin size={14} className='team-review__icon' />
							{state.addressCity.value}, {state.country.value}
						</span>
					</div>
					<div className='team-review__row'>
						<span className='team-review__label'>Billing Email</span>
						<span className='team-review__value'>
							<IconWorld size={14} className='team-review__icon' />
							{state.billingEmail.value}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
