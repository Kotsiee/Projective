// deno-lint-ignore-file no-explicit-any
import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { Signal, useSignal } from '@preact/signals';
import { FileWithMeta, Visibility } from '@projective/types';

// Types matching your DB schema needs
export interface TeamFormState {
	name: Signal<string>;
	slug: Signal<string>;
	description: Signal<any>; // Delta format for RichText
	avatar: Signal<FileWithMeta | undefined>;
	visibility: Signal<string>;

	// Financials
	payoutModel: Signal<string>;
	treasuryPercent: Signal<number>; // For 'smart_split' defaults

	// Members (Simple invite list for creation)
	invites: Signal<Array<{ email: string; role: string }>>;
}

export function useTeamFormState(): TeamFormState {
	return {
		name: useSignal(''),
		slug: useSignal(''),
		description: useSignal(JSON.stringify({ ops: [{ insert: '\n' }] })),
		avatar: useSignal<FileWithMeta | undefined>(undefined),
		visibility: useSignal<string>(Visibility.InviteOnly),

		payoutModel: useSignal('manager_discretion'),
		treasuryPercent: useSignal(10), // Default 10% to treasury

		invites: useSignal([{ email: '', role: 'member' }]),
	};
}

const TeamContext = createContext<TeamFormState | null>(null);

export function TeamFormProvider({ children }: { children: any }) {
	const state = useTeamFormState();
	return (
		<TeamContext.Provider value={state}>
			{children}
		</TeamContext.Provider>
	);
}

export function useNewTeamContext() {
	const ctx = useContext(TeamContext);
	if (!ctx) {
		throw new Error('useNewTeamContext must be used within TeamFormProvider');
	}
	return ctx;
}
