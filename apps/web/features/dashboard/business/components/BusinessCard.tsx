import { DashboardBusiness } from '../contracts/Business.ts';
import { useUserContext } from '@features/navigation/contexts/UserContext.tsx';
import { useSignal } from '@preact/signals';
import { ProfileCard } from '@projective/ui';
import type { EntityCardMenuItem } from '@projective/ui';
import type { EntityCardModel } from '@projective/types';

interface BusinessCardProps {
	business: DashboardBusiness;
}

/** Adapts a dashboard business into the unified card model. */
function businessToCardModel(business: DashboardBusiness): EntityCardModel {
	return {
		id: business.id,
		entity_type: 'business',
		display_title: business.name,
		display_description: null,
		tags: [],
		rating_average: 0,
		rating_count: 0,
		owner_name: business.name,
		owner_handle: business.slug,
		owner_avatar: business.logo_url ?? null,
		banner: null,
		accent: 'amber',
		price_cents: null,
		price_unit: null,
		availability: null,
		location: null,
		scope: null,
		taxonomy: 'business',
		is_sponsored: false,
		role_label: business.default_currency || 'USD',
	};
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

	const menuItems: EntityCardMenuItem[] = [
		{ label: isActive ? 'Currently active' : 'Set as active', onSelect: handleSwitch },
	];

	return (
		<ProfileCard
			entity={businessToCardModel(business)}
			active={isActive}
			onSelect={handleSwitch}
			menuItems={menuItems}
		/>
	);
}
