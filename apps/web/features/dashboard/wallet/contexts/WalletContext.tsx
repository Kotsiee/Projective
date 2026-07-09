/**
 * @file WalletContext.tsx
 * @description Client state for the wallet hub. Holds the active persona + display currency as
 * signals and exposes every downstream dataset (balances, ledger, escrow, pipeline, forecast) as
 * `computed` values already converted into the display currency via the mock FX table. Switching
 * persona or currency therefore re-expresses the entire hub reactively. Seed-hydrated (no fetch),
 * mirroring `SubmissionsContext`.
 *
 * Note: the *type* `WalletContext` (the active-persona view-model) lives in `@projective/types`;
 * it is imported here as `WalletView` so it doesn't collide with this Preact context object.
 */

import { ComponentChildren, createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { computed, type ReadonlySignal, type Signal, useSignal } from '@preact/signals';
import type {
	EscrowAllocation,
	ForecastingDataPoint,
	FxRateTable,
	PipelinePoint,
	TransactionLedgerItem,
	WalletContext as WalletView,
	WalletPersona,
} from '@projective/types';
import {
	type BankCard,
	convertBalances,
	convertEscrow,
	convertForecast,
	convertLedgerItem,
	convertPipeline,
	formatMoney,
	formatMoneyCompact,
	WALLET_FX,
	type WalletDataset,
} from '../contracts/Wallet.ts';

const UPDATED_AT = '2026-07-05T12:00:00.000Z';

export interface WalletState {
	personas: WalletPersona[];
	activePersonaId: Signal<string>;
	currency: Signal<string>;
	fx: FxRateTable;

	activePersona: ReadonlySignal<WalletPersona>;
	/** The active-persona wallet view-model, balances in display currency. */
	wallet: ReadonlySignal<WalletView>;
	ledger: ReadonlySignal<TransactionLedgerItem[]>;
	escrow: ReadonlySignal<EscrowAllocation[]>;
	pipeline: ReadonlySignal<PipelinePoint[]>;
	forecast: ReadonlySignal<ForecastingDataPoint[]>;
	cards: ReadonlySignal<BankCard[]>;

	switchPersona: (id: string) => void;
	setCurrency: (code: string) => void;
	addCard: (card: BankCard) => void;
	/** Format minor units in the current display currency. */
	format: (cents: number) => string;
	formatCompact: (cents: number) => string;
}

export const WalletStateContext = createContext<WalletState | null>(null);

export function WalletProvider(
	{ children, dataset }: {
		children: ComponentChildren;
		/**
		 * The wallet seed, owned by the server route/layout and passed down as `initialData` (see
		 * apps/web/CLAUDE.md — data flows Route → props → island). Kept out of the island bundle so
		 * the provider imports no data module directly.
		 */
		dataset: WalletDataset;
	},
) {
	const personas = dataset.personas;
	const fx = WALLET_FX;

	const activePersonaId = useSignal(personas[0].id);
	const currency = useSignal(personas[0].currency);
	const extraCards = useSignal<BankCard[]>([]);

	const activePersona = computed(() =>
		personas.find((p) => p.id === activePersonaId.value) ?? personas[0]
	);
	const seed = computed(() => dataset.byPersona[activePersonaId.value]);

	const wallet = computed<WalletView>(() => ({
		persona: activePersona.value,
		currency: currency.value,
		balances: convertBalances(seed.value.balances, currency.value, fx),
		updatedAt: UPDATED_AT,
	}));

	const ledger = computed(() =>
		seed.value.ledger.map((it) => convertLedgerItem(it, currency.value, fx))
	);
	const escrow = computed(() => seed.value.escrow.map((e) => convertEscrow(e, currency.value, fx)));
	const pipeline = computed(() =>
		seed.value.pipeline.map((p) => convertPipeline(p, currency.value, undefined, fx))
	);
	const forecast = computed(() =>
		seed.value.forecast.map((p) => convertForecast(p, currency.value, undefined, fx))
	);
	const cards = computed(() => [...seed.value.cards, ...extraCards.value]);

	const switchPersona = (id: string) => {
		const p = personas.find((x) => x.id === id);
		if (!p) return;
		activePersonaId.value = id;
		// Snap the display currency to the persona's native settlement currency.
		currency.value = p.currency;
	};

	const setCurrency = (code: string) => {
		currency.value = code;
	};

	const addCard = (card: BankCard) => {
		extraCards.value = [...extraCards.value, card];
	};

	const format = (cents: number) => formatMoney(cents, currency.value);
	const formatCompact = (cents: number) => formatMoneyCompact(cents, currency.value);

	return (
		<WalletStateContext.Provider
			value={{
				personas,
				activePersonaId,
				currency,
				fx,
				activePersona,
				wallet,
				ledger,
				escrow,
				pipeline,
				forecast,
				cards,
				switchPersona,
				setCurrency,
				addCard,
				format,
				formatCompact,
			}}
		>
			{children}
		</WalletStateContext.Provider>
	);
}

export function useWalletContext(): WalletState {
	const ctx = useContext(WalletStateContext);
	if (!ctx) throw new Error('useWalletContext must be used within WalletProvider');
	return ctx;
}
