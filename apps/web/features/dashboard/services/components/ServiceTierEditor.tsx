/**
 * @file ServiceTierEditor.tsx
 * @description Create-or-edit modal for a service listing and its pricing ladder. Mounts fresh each
 * open (the island renders it conditionally), so the draft seeds straight from the `listing` prop
 * (or blank for a new listing). On save it emits a fully-assembled `ServiceListing` back to the
 * island, which owns persistence (frontend-seed today).
 */

import { useSignal } from '@preact/signals';
import { Button, Modal } from '@projective/ui';
import { IconPlus, IconTrash } from '@tabler/icons-preact';
import type { ServiceListing, ServiceStatus, ServiceTier } from '../contracts/services.ts';

interface ServiceTierEditorProps {
	open: boolean;
	/** Null → create a new listing. */
	listing: ServiceListing | null;
	currency: string;
	onClose: () => void;
	onSave: (listing: ServiceListing) => void;
}

interface DraftTier {
	id: string;
	name: string;
	priceCents: number;
	deliveryDays: number;
	revisions: number;
	blurb: string;
	featured: boolean;
	/** Preserved from the source listing; not edited in this modal. */
	features: string[];
}

interface DraftListing {
	id: string;
	title: string;
	summary: string;
	category: string;
	status: ServiceStatus;
	tiers: DraftTier[];
}

const CATEGORIES = ['branding', 'motion', 'web', 'strategy', 'content', 'other'];
const STATUSES: ServiceStatus[] = ['active', 'draft', 'paused', 'archived'];

/** A cheap unique-ish id for new drafts (client-side only). */
function draftId(prefix: string): string {
	return `${prefix}-${Math.round(performance.now())}-${Math.floor(Math.random() * 1e4)}`;
}

function blankTier(): DraftTier {
	return {
		id: draftId('tier'),
		name: '',
		priceCents: 0,
		deliveryDays: 7,
		revisions: 2,
		blurb: '',
		featured: false,
		features: [],
	};
}

function toDraft(listing: ServiceListing | null): DraftListing {
	if (!listing) {
		return {
			id: draftId('svc'),
			title: '',
			summary: '',
			category: 'branding',
			status: 'draft',
			tiers: [blankTier()],
		};
	}
	return {
		id: listing.id,
		title: listing.title,
		summary: listing.summary,
		category: listing.category,
		status: listing.status,
		tiers: listing.tiers.map((t) => ({
			id: t.id,
			name: t.name,
			priceCents: t.priceCents,
			deliveryDays: t.deliveryDays,
			revisions: t.revisions,
			blurb: t.blurb,
			featured: !!t.featured,
			features: [...t.features],
		})),
	};
}

export default function ServiceTierEditor(
	{ open, listing, currency, onClose, onSave }: ServiceTierEditorProps,
) {
	const draft = useSignal<DraftListing>(toDraft(listing));
	const isEdit = !!listing;

	const patch = (p: Partial<DraftListing>) => {
		draft.value = { ...draft.value, ...p };
	};
	const patchTier = (i: number, p: Partial<DraftTier>) => {
		const tiers = draft.value.tiers.map((t, idx) => (idx === i ? { ...t, ...p } : t));
		draft.value = { ...draft.value, tiers };
	};
	const addTier = () => patch({ tiers: [...draft.value.tiers, blankTier()] });
	const removeTier = (i: number) =>
		patch({ tiers: draft.value.tiers.filter((_, idx) => idx !== i) });

	const d = draft.value;
	const valid = d.title.trim().length > 1 &&
		d.tiers.length > 0 &&
		d.tiers.every((t) => t.name.trim().length > 0 && t.priceCents > 0);

	const save = () => {
		if (!valid) return;
		const assembled: ServiceListing = {
			id: d.id,
			title: d.title.trim(),
			summary: d.summary.trim(),
			category: d.category,
			thumbnailUrl: listing?.thumbnailUrl ?? null,
			status: d.status,
			updatedAt: new Date().toISOString(),
			// Preserve live stats on edit; new listings start empty.
			stats: listing?.stats ??
				{ views30d: 0, inquiries30d: 0, conversionPct: 0, activeClients: 0, pipelineValueCents: 0 },
			tiers: d.tiers.map<ServiceTier>((t) => ({
				id: t.id,
				name: t.name.trim(),
				priceCents: t.priceCents,
				deliveryDays: t.deliveryDays,
				revisions: t.revisions,
				blurb: t.blurb.trim(),
				featured: t.featured,
				features: t.features,
			})),
		};
		onSave(assembled);
	};

	return (
		<Modal
			isOpen={open}
			onClose={onClose}
			title={isEdit ? 'Edit service & pricing' : 'New service listing'}
			width={640}
		>
			<div class='svc-editor'>
				<div class='svc-field'>
					<label class='svc-field__label'>Service title</label>
					<input
						class='svc-input'
						value={d.title}
						placeholder='e.g. Signature Brand System'
						onInput={(e) => patch({ title: (e.target as HTMLInputElement).value })}
					/>
				</div>

				<div class='svc-field'>
					<label class='svc-field__label'>Summary</label>
					<textarea
						class='svc-input svc-input--area'
						value={d.summary}
						rows={2}
						placeholder='One crisp line on what the client gets.'
						onInput={(e) => patch({ summary: (e.target as HTMLTextAreaElement).value })}
					/>
				</div>

				<div class='svc-field-row'>
					<div class='svc-field'>
						<label class='svc-field__label'>Category</label>
						<select
							class='svc-input'
							value={d.category}
							onChange={(e) => patch({ category: (e.target as HTMLSelectElement).value })}
						>
							{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
						</select>
					</div>
					<div class='svc-field'>
						<label class='svc-field__label'>Status</label>
						<select
							class='svc-input'
							value={d.status}
							onChange={(e) =>
								patch({ status: (e.target as HTMLSelectElement).value as ServiceStatus })}
						>
							{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
						</select>
					</div>
				</div>

				<div class='svc-editor__tiers-head'>
					<h4>Pricing tiers</h4>
					<Button variant='secondary' ghost size='small' onClick={addTier}>
						<IconPlus size={15} /> Add tier
					</Button>
				</div>

				<div class='svc-editor__tiers'>
					{d.tiers.map((t, i) => (
						<div key={t.id} class={`svc-tier-edit ${t.featured ? 'is-featured' : ''}`}>
							<div class='svc-tier-edit__top'>
								<input
									class='svc-input svc-input--tier-name'
									value={t.name}
									placeholder='Tier name'
									onInput={(e) =>
										patchTier(i, { name: (e.target as HTMLInputElement).value })}
								/>
								<label class='svc-tier-edit__feature'>
									<input
										type='checkbox'
										checked={t.featured}
										onChange={(e) =>
											patchTier(i, { featured: (e.target as HTMLInputElement).checked })}
									/>
									Featured
								</label>
								{d.tiers.length > 1 && (
									<button
										type='button'
										class='svc-tier-edit__remove'
										aria-label='Remove tier'
										onClick={() => removeTier(i)}
									>
										<IconTrash size={15} />
									</button>
								)}
							</div>

							<div class='svc-tier-edit__grid'>
								<label class='svc-mini-field'>
									<span>Price ({currency})</span>
									<input
										class='svc-input'
										type='number'
										min={0}
										step={50}
										value={t.priceCents ? t.priceCents / 100 : ''}
										onInput={(e) =>
											patchTier(i, {
												priceCents: Math.max(
													0,
													Math.round(Number((e.target as HTMLInputElement).value || '0') * 100),
												),
											})}
									/>
								</label>
								<label class='svc-mini-field'>
									<span>Delivery (days)</span>
									<input
										class='svc-input'
										type='number'
										min={1}
										value={t.deliveryDays}
										onInput={(e) =>
											patchTier(i, {
												deliveryDays: Math.max(
													1,
													Number((e.target as HTMLInputElement).value || '1'),
												),
											})}
									/>
								</label>
								<label class='svc-mini-field'>
									<span>Revisions (−1 = ∞)</span>
									<input
										class='svc-input'
										type='number'
										min={-1}
										value={t.revisions}
										onInput={(e) =>
											patchTier(i, {
												revisions: Number((e.target as HTMLInputElement).value || '0'),
											})}
									/>
								</label>
							</div>

							<input
								class='svc-input svc-input--blurb'
								value={t.blurb}
								placeholder='What this tier includes…'
								onInput={(e) =>
									patchTier(i, { blurb: (e.target as HTMLInputElement).value })}
							/>
						</div>
					))}
				</div>

				<div class='svc-editor__footer'>
					<Button variant='secondary' ghost onClick={onClose}>Cancel</Button>
					<Button variant='primary' disabled={!valid} onClick={save}>
						{isEdit ? 'Save changes' : 'Create service'}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
