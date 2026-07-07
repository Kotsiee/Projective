/**
 * @file walletSeed.ts
 * @description Frontend-only seed for the wallet hub (no backend — like `submissionsSeed.ts` /
 * `exploreSeed.ts`). Everything is denominated in the base currency (GBP) and generated with a
 * fixed-seed PRNG + fixed base date, so the SSR pass and the client hydration produce byte-
 * identical data (no `Math.random`, no live clock → no hydration mismatch).
 */

import type {
	EscrowAllocation,
	ForecastingDataPoint,
	PipelinePoint,
	TransactionLedgerItem,
	WalletPersona,
} from '@projective/types';
import type { BankCard, PersonaWalletSeed, WalletDataset } from '../contracts/Wallet.ts';

const BASE = 'GBP';
/** Anchor date (matches the app's "today"); all relative dates derive from this deterministically. */
const ANCHOR = new Date('2026-07-05T12:00:00.000Z').getTime();
const DAY = 86_400_000;

function isoDaysAgo(n: number): string {
	return new Date(ANCHOR - n * DAY).toISOString();
}
function isoDaysAhead(n: number): string {
	return new Date(ANCHOR + n * DAY).toISOString();
}

/** Deterministic PRNG (mulberry32) — stable across server/client for a given seed. */
function rng(seed: number): () => number {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const COUNTERPARTIES = [
	'Northwind Studios',
	'Acme Robotics',
	'Lumen Health',
	'Vellum Press',
	'Orbit Fintech',
	'Meridian Labs',
	'Cobalt Interactive',
	'Fernweh Travel',
	'Sundial Media',
	'Ironclad Legal',
];

const PROJECTS = [
	'Atlas Rebrand',
	'Pulse Mobile App',
	'Q3 Campaign',
	'Ledger UI Kit',
	'Onboarding Flow',
	'Data Platform',
	'Brand System',
	'Growth Audit',
];

const PIPELINE_CATEGORIES = ['Design', 'Development', 'Marketing', 'Consulting', 'Content'];

const FEE_RATE = 0.05; // 5% platform service charge

// #region Ledger generation
/**
 * Build a dense chronological ledger for a persona, then reverse to most-recent-first. Each
 * project payout spawns a paired platform-fee line (the isolated 5% charge) plus the occasional
 * bonus, withdrawal, top-up or refund — computing a running balance across the whole run.
 */
function makeLedger(
	seed: number,
	events: number,
	startBalanceCents: number,
): TransactionLedgerItem[] {
	const rand = rng(seed);
	const rows: TransactionLedgerItem[] = [];
	let balance = startBalanceCents;
	let day = events * 3 + 10;
	let n = 0;

	for (let e = 0; e < events; e++) {
		day -= 1 + Math.floor(rand() * 3);
		const cp = COUNTERPARTIES[Math.floor(rand() * COUNTERPARTIES.length)];
		const project = PROJECTS[Math.floor(rand() * PROJECTS.length)];
		const roll = rand();

		if (roll < 0.66) {
			// Project payout (credit) + its 5% platform fee (debit).
			const gross = (150 + Math.floor(rand() * 480)) * 100;
			const fee = Math.round(gross * FEE_RATE);
			const date = isoDaysAgo(day);

			balance += gross;
			rows.push({
				id: `tx-${seed}-${n++}`,
				date,
				kind: 'payout',
				direction: 'credit',
				description: `Stage payout — ${project}`,
				counterparty: cp,
				reference: `ESC-${(seed % 900 + 100)}${e}`,
				project_label: project,
				gross_cents: gross,
				fee_cents: 0,
				net_cents: gross,
				balance_after_cents: balance,
				currency: BASE,
				status: 'settled',
				is_fee_line: false,
			});

			balance -= fee;
			rows.push({
				id: `tx-${seed}-${n++}`,
				date,
				kind: 'platform_fee',
				direction: 'debit',
				description: 'Platform service charge (5%)',
				counterparty: 'Projective',
				reference: `FEE-${(seed % 900 + 100)}${e}`,
				project_label: project,
				gross_cents: fee,
				fee_cents: fee,
				net_cents: -fee,
				balance_after_cents: balance,
				currency: BASE,
				status: 'settled',
				is_fee_line: true,
			});
		} else if (roll < 0.8) {
			// Deadline bonus (credit)
			const gross = (40 + Math.floor(rand() * 120)) * 100;
			balance += gross;
			rows.push({
				id: `tx-${seed}-${n++}`,
				date: isoDaysAgo(day),
				kind: 'bonus',
				direction: 'credit',
				description: `Deadline bonus — ${project}`,
				counterparty: cp,
				reference: `BON-${(seed % 900 + 100)}${e}`,
				project_label: project,
				gross_cents: gross,
				fee_cents: 0,
				net_cents: gross,
				balance_after_cents: balance,
				currency: BASE,
				status: e < 2 ? 'pending' : 'settled',
				is_fee_line: false,
			});
		} else if (roll < 0.92) {
			// Withdrawal to bank (debit)
			const gross = (200 + Math.floor(rand() * 600)) * 100;
			balance -= gross;
			rows.push({
				id: `tx-${seed}-${n++}`,
				date: isoDaysAgo(day),
				kind: 'withdrawal',
				direction: 'debit',
				description: 'Withdrawal to bank account',
				counterparty: 'Barclays ••4471',
				reference: `WD-${(seed % 900 + 100)}${e}`,
				project_label: null,
				gross_cents: gross,
				fee_cents: 0,
				net_cents: -gross,
				balance_after_cents: balance,
				currency: BASE,
				status: e < 1 ? 'processing' : 'settled',
				is_fee_line: false,
			});
		} else {
			// Refund (debit)
			const gross = (30 + Math.floor(rand() * 90)) * 100;
			balance -= gross;
			rows.push({
				id: `tx-${seed}-${n++}`,
				date: isoDaysAgo(day),
				kind: 'refund',
				direction: 'debit',
				description: `Refund issued — ${project}`,
				counterparty: cp,
				reference: `RF-${(seed % 900 + 100)}${e}`,
				project_label: project,
				gross_cents: gross,
				fee_cents: 0,
				net_cents: -gross,
				balance_after_cents: balance,
				currency: BASE,
				status: 'settled',
				is_fee_line: false,
			});
		}
	}

	return rows.reverse();
}
// #endregion

// #region Pipeline (velocity vs ROI) generation
function makePipeline(seed: number, count: number): PipelinePoint[] {
	const rand = rng(seed);
	const points: PipelinePoint[] = [];
	for (let i = 0; i < count; i++) {
		const cat = PIPELINE_CATEGORIES[Math.floor(rand() * PIPELINE_CATEGORIES.length)];
		// Loose positive correlation between velocity and ROI, with scatter.
		const velocity = 10 + rand() * 90;
		const roi = Math.max(-15, Math.min(95, velocity * 0.6 + (rand() - 0.5) * 55));
		const value = (80 + Math.floor(rand() * 1200)) * 100;
		points.push({
			id: `pp-${seed}-${i}`,
			label: `${PROJECTS[i % PROJECTS.length]} · ${cat}`,
			velocity: Math.round(velocity * 10) / 10,
			roi: Math.round(roi * 10) / 10,
			value_cents: value,
			category: cat,
			date: isoDaysAgo(Math.floor(rand() * 120)),
		});
	}
	return points;
}
// #endregion

// #region Forecast (predictive runway) generation
function makeForecast(
	seed: number,
	count: number,
	start: number,
	growth: number,
): ForecastingDataPoint[] {
	const rand = rng(seed);
	const series: ForecastingDataPoint[] = [];
	let value = start;
	for (let i = 0; i < count; i++) {
		value = value * (1 + growth) + (rand() - 0.45) * start * 0.04;
		const spread = value * (0.05 + i * 0.006); // widening confidence band
		series.push({
			t: isoDaysAhead(i * 14),
			value_cents: Math.round(value),
			lower_cents: Math.round(value - spread),
			upper_cents: Math.round(value + spread),
		});
	}
	return series;
}
// #endregion

function makeEscrow(seed: number): EscrowAllocation[] {
	const rand = rng(seed);
	const statuses = ['held', 'funded', 'held', 'disputed', 'held'] as const;
	return statuses.map((status, i) => {
		const amount = (300 + Math.floor(rand() * 900)) * 100;
		return {
			id: `esc-${seed}-${i}`,
			project_label: PROJECTS[i % PROJECTS.length],
			stage_label: `Stage ${i + 1} — ${['Discovery', 'Design', 'Build', 'QA', 'Launch'][i % 5]}`,
			status,
			amount_cents: amount,
			platform_fee_cents: Math.round(amount * FEE_RATE),
			release_at: isoDaysAhead(4 + i * 6),
			progress_pct: Math.min(100, 15 + Math.floor(rand() * 80)),
			payee_name: COUNTERPARTIES[i % COUNTERPARTIES.length],
			currency: BASE,
		} satisfies EscrowAllocation;
	});
}

const CARDS: BankCard[] = [
	{
		id: 'card-1',
		brand: 'visa',
		last4: '4471',
		holder: 'A. Kotwal',
		expiry: '09/28',
		is_default: true,
		kind: 'card',
	},
	{
		id: 'card-2',
		brand: 'mastercard',
		last4: '2093',
		holder: 'A. Kotwal',
		expiry: '02/27',
		is_default: false,
		kind: 'card',
	},
	{
		id: 'bank-1',
		brand: 'visa',
		last4: '8810',
		holder: 'Barclays Current',
		expiry: '—',
		is_default: false,
		kind: 'bank',
	},
];

function personaSeed(
	seed: number,
	opts: {
		available: number;
		escrowed: number;
		pending: number;
		lifetime: number;
		events: number;
		forecastStart: number;
		growth: number;
	},
): PersonaWalletSeed {
	return {
		balances: {
			available_cents: opts.available,
			in_escrow_cents: opts.escrowed,
			pending_cents: opts.pending,
			lifetime_cents: opts.lifetime,
			currency: BASE,
		},
		ledger: makeLedger(seed, opts.events, Math.round(opts.available * 0.7)),
		escrow: makeEscrow(seed),
		pipeline: makePipeline(seed + 7, 52),
		forecast: makeForecast(seed + 13, 26, opts.forecastStart, opts.growth),
		cards: CARDS,
	};
}

/** The three selectable wallet personas (freelancer / business / team). */
export const WALLET_PERSONAS: WalletPersona[] = [
	{
		id: 'persona-freelancer',
		kind: 'freelancer',
		displayName: 'Ahmed Kotwal',
		handle: 'ahmedk',
		avatarUrl: null,
		accent: 'mint',
		currency: 'GBP',
	},
	{
		id: 'persona-business',
		kind: 'business',
		displayName: 'Projective Studio',
		handle: 'projective-studio',
		avatarUrl: null,
		accent: 'violet',
		currency: 'USD',
	},
	{
		id: 'persona-team',
		kind: 'team',
		displayName: 'Aurora Collective',
		handle: 'aurora',
		avatarUrl: null,
		accent: 'amber',
		currency: 'EUR',
	},
];

/** The full frontend dataset consumed by `WalletContext`. */
export const WALLET_DATASET: WalletDataset = {
	personas: WALLET_PERSONAS,
	byPersona: {
		'persona-freelancer': personaSeed(1001, {
			available: 8_420_00,
			escrowed: 3_150_00,
			pending: 640_00,
			lifetime: 142_800_00,
			events: 26,
			forecastStart: 9_200_00,
			growth: 0.06,
		}),
		'persona-business': personaSeed(2002, {
			available: 52_300_00,
			escrowed: 21_800_00,
			pending: 4_120_00,
			lifetime: 986_400_00,
			events: 30,
			forecastStart: 48_000_00,
			growth: 0.09,
		}),
		'persona-team': personaSeed(3003, {
			available: 17_650_00,
			escrowed: 9_400_00,
			pending: 1_280_00,
			lifetime: 318_200_00,
			events: 24,
			forecastStart: 16_500_00,
			growth: 0.07,
		}),
	},
};
