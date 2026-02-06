import { IconRocket } from '@tabler/icons-preact';
import { Button, toast } from '@projective/ui';
import { useNewBusinessContext } from '@contexts/NewBusinessContext.tsx';
import { getCsrfToken } from '@projective/shared';
import { useSignal } from '@preact/signals';

export function CreateBusinessButton() {
	const state = useNewBusinessContext();
	const isLoading = useSignal(false);

	const handleCreate = async () => {
		// 1. Prepare Payload
		// Handle RichText state which might be a JSON string or object
		let description = state.description.value;
		try {
			if (typeof description === 'string' && description.trim().startsWith('{')) {
				description = JSON.parse(description);
			} else if (typeof description === 'string') {
				description = { ops: [{ insert: description + '\n' }] };
			}
		} catch {
			description = { ops: [{ insert: '\n' }] };
		}

		const payload = {
			name: state.name.value,
			slug: state.slug.value,
			headline: state.headline.value,
			description,
			legal_name: state.legalName.value,
			billing_email: state.billingEmail.value,
			country: state.country.value,
			address_line_1: state.addressLine1.value,
			address_city: state.addressCity.value,
			address_zip: state.addressZip.value,
			tax_id: state.taxId.value,
			default_currency: state.currency.value,
		};

		// 2. Validate (Strict Check)
		if (
			!payload.name ||
			!payload.slug ||
			!payload.legal_name ||
			!payload.country ||
			!payload.billing_email ||
			!payload.address_line_1 ||
			!payload.address_city ||
			!payload.address_zip
		) {
			toast.error('Please fill in all required Identity and Billing fields.');
			return;
		}

		isLoading.value = true;

		// 3. Submit
		const request = async () => {
			try {
				const csrf = getCsrfToken();
				if (!csrf) throw new Error('Missing CSRF token');

				const formData = new FormData();
				formData.append('payload', JSON.stringify(payload));

				if (state.logo.value) {
					formData.append('logo', state.logo.value.file);
				}

				if (state.banner.value) {
					formData.append('banner', state.banner.value.file);
				}

				const res = await fetch('/api/v1/dashboard/business', {
					method: 'POST',
					headers: {
						'X-CSRF': csrf,
					},
					body: formData,
				});

				const data = await res.json();
				if (!res.ok) {
					// Show specific validation error from Zod if available
					if (data.error?.code === 'validation_error') {
						console.error('Validation Errors:', data.error.details);
						throw new Error('Please check the form for invalid fields.');
					}
					throw new Error(data.error?.message || 'Failed to create business');
				}

				if (data.redirectTo) {
					setTimeout(() => globalThis.location.href = data.redirectTo, 1000);
				}
				return 'Business created successfully!';
			} finally {
				isLoading.value = false;
			}
		};

		toast.promise(request(), {
			loading: 'Establishing business entity...',
			success: (msg) => msg,
			error: (err) => `Failed: ${err.message}`,
		});
	};

	return (
		<Button
			variant='primary'
			startIcon={<IconRocket size={18} />}
			onClick={handleCreate}
			loading={isLoading}
		>
			Create Business
		</Button>
	);
}
