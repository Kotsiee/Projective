// deno-lint-ignore-file no-explicit-any
import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { Signal, useSignal } from '@preact/signals';
import { FileWithMeta } from '@projective/types';

export interface BusinessFormState {
	// Identity
	name: Signal<string>;
	slug: Signal<string>;
	headline: Signal<string>;
	description: Signal<any>;
	logo: Signal<FileWithMeta | undefined>;
	banner: Signal<FileWithMeta | undefined>; // NEW

	// Legal
	legalName: Signal<string>;
	billingEmail: Signal<string>;
	country: Signal<string>;
	addressLine1: Signal<string>;
	addressCity: Signal<string>;
	addressZip: Signal<string>;
	taxId: Signal<string>;

	// Finance
	currency: Signal<string>;
}

export function useBusinessFormState(): BusinessFormState {
	return {
		name: useSignal(''),
		slug: useSignal(''),
		headline: useSignal(''),
		description: useSignal(JSON.stringify({ ops: [{ insert: '\n' }] })),
		logo: useSignal<FileWithMeta | undefined>(undefined),
		banner: useSignal<FileWithMeta | undefined>(undefined), // NEW

		legalName: useSignal(''),
		billingEmail: useSignal(''),
		country: useSignal(''),
		addressLine1: useSignal(''),
		addressCity: useSignal(''),
		addressZip: useSignal(''),
		taxId: useSignal(''),

		currency: useSignal('USD'),
	};
}

const BusinessContext = createContext<BusinessFormState | null>(null);

export function BusinessFormProvider({ children }: { children: any }) {
	const state = useBusinessFormState();
	return (
		<BusinessContext.Provider value={state}>
			{children}
		</BusinessContext.Provider>
	);
}

export function useNewBusinessContext() {
	const ctx = useContext(BusinessContext);
	if (!ctx) {
		throw new Error('useNewBusinessContext must be used within BusinessFormProvider');
	}
	return ctx;
}
