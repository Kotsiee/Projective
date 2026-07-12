/**
 * @file PartnerCta.island.tsx
 * @description The scattered high-conversion CTA behind the `/become-partner` funnel. Posts to
 * `/api/v1/profile/enable-freelancer` (CSRF-guarded), which links a freelancer profile to the
 * account, then hard-navigates to the returned target so `getMe` re-runs and the persona flips
 * app-wide (nav gates, profile rail, the new go-live milestone). Only the loading flag is client
 * state. When the viewer is already a partner it degrades to a plain link into their suite.
 */

import { useSignal } from '@preact/signals';
import { Button, toast } from '@projective/ui';
import { getCsrfToken } from '@projective/utils';
import { IconArrowRight, IconSparkles } from '@tabler/icons-preact';

type CtaVariant = 'premium' | 'primary' | 'secondary';
type CtaSize = 'small' | 'medium' | 'large';

interface PartnerCtaProps {
	/** Context-specific phrasing, e.g. "Begin Your Journey", "Apply as Talent". */
	label: string;
	variant?: CtaVariant;
	size?: CtaSize;
	/** When the viewer already has a freelancer profile, become a link into the suite instead. */
	alreadyPartner?: boolean;
}

export default function PartnerCta(
	{ label, variant = 'premium', size = 'large', alreadyPartner = false }: PartnerCtaProps,
) {
	const loading = useSignal(false);

	if (alreadyPartner) {
		return (
			<Button
				href='/home'
				variant={variant}
				size={size}
				rounded
				endIcon={<IconArrowRight size={18} stroke={2} />}
			>
				Open your freelancer suite
			</Button>
		);
	}

	const unlock = () => {
		if (loading.value) return;
		loading.value = true;

		const run = async () => {
			try {
				const csrf = getCsrfToken();
				if (!csrf) throw new Error('Your session expired — please refresh and try again.');

				const res = await fetch('/api/v1/profile/enable-freelancer', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', 'X-CSRF': csrf },
					body: JSON.stringify({}),
				});
				const data = await res.json().catch(() => ({}));
				if (!res.ok) throw new Error(data?.message || 'Could not unlock your freelancer profile.');

				// A full navigation re-runs getMe, so the whole app re-expresses the new persona.
				globalThis.location.href = data.redirectTo || '/home';
				return 'Welcome to the talent network';
			} finally {
				loading.value = false;
			}
		};

		toast.promise(run(), {
			loading: 'Unlocking your freelancer suite…',
			success: (m) => m as string,
			error: (e) => (e instanceof Error ? e.message : 'Something went wrong'),
		});
	};

	return (
		<Button
			variant={variant}
			size={size}
			rounded
			loading={loading}
			onClick={unlock}
			startIcon={<IconSparkles size={18} stroke={2} />}
		>
			{label}
		</Button>
	);
}
