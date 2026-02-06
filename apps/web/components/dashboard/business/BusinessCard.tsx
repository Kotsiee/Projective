import '@styles/components/dashboard/business/business-card.css';
import { IconCheck, IconCurrencyDollar } from '@tabler/icons-preact';
import { DashboardBusiness } from '@contracts/dashboard/business/Business.ts';
import { Card, metaPosition } from '../../card/Card.tsx';
import { VNode } from 'preact';
import { useUserContext } from '@contexts/UserContext.tsx';
import { useSignal } from '@preact/signals';

interface BusinessCardProps {
	business: DashboardBusiness;
}

export function BusinessCard({ business }: BusinessCardProps) {
	const { user, switchProfile } = useUserContext();
	const isLoading = useSignal(false);

	const isActive = user.value?.activeProfileId === business.id;

	const handleSwitch = async () => {
		if (isActive || isLoading.value) return;

		isLoading.value = true;
		try {
			await switchProfile(business.id, 'business');
		} finally {
			isLoading.value = false;
		}
	};

	const meta: Partial<Record<metaPosition, VNode>> = {
		'bottom-left': (
			<div class='business-card__stat'>
				<IconCurrencyDollar size={14} />
				<span>{business.default_currency || 'USD'}</span>
			</div>
		),
	};

	return (
		<div className={`business-card-wrapper ${isActive ? 'is-active' : ''}`}>
			<Card
				owner={{
					name: business.name,
					handle: business.slug,
					profilePictureUrl: business.logo_url ?? undefined,
				}}
				type={isActive ? 'active' : 'default'}
				onClick={handleSwitch}
				title={business.name}
				// description={business.headline || 'No headline provided.'}
				tags={[{ label: 'Owner' }]}
				bannerUrl='https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=60'
				meta={meta}
			/>
		</div>
	);
}
