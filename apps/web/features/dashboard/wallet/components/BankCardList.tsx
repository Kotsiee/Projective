/**
 * @file BankCardList.tsx
 * @description Settings surface for connected payout destinations. Lists the persona's cards/banks
 * and provides a functional "connect card" form (frontend mock — pushes into the context's local
 * card list; no PCI data, no network).
 */

import { useSignal } from '@preact/signals';
import { SelectField, type SelectOption, TextField } from '@projective/fields';
import { IconBuildingBank, IconCreditCard, IconPlus, IconStarFilled } from '@tabler/icons-preact';
import type { BankCard } from '../contracts/Wallet.ts';
import { useWalletContext } from '../contexts/WalletContext.tsx';

const BRAND_OPTIONS: SelectOption<string>[] = [
	{ label: 'Visa', value: 'visa' },
	{ label: 'Mastercard', value: 'mastercard' },
	{ label: 'Amex', value: 'amex' },
];

export function BankCardList() {
	const { cards, addCard } = useWalletContext();

	const brand = useSignal<string>('visa');
	const last4 = useSignal('');
	const holder = useSignal('');
	const expiry = useSignal('');
	const adding = useSignal(false);

	const submit = (e: Event) => {
		e.preventDefault();
		const l4 = last4.value.replace(/\D/g, '').slice(-4);
		if (l4.length < 4 || !holder.value.trim()) return;
		const card: BankCard = {
			id: `card-${l4}-${holder.value.length}`,
			brand: brand.value as BankCard['brand'],
			last4: l4,
			holder: holder.value.trim(),
			expiry: expiry.value || '—',
			is_default: false,
			kind: 'card',
		};
		addCard(card);
		last4.value = '';
		holder.value = '';
		expiry.value = '';
		adding.value = false;
	};

	return (
		<section class='bank-cards'>
			<header class='bank-cards__header'>
				<h3 class='bank-cards__title'>Payout destinations</h3>
				<button
					type='button'
					class='bank-cards__add-btn'
					onClick={() => (adding.value = !adding.value)}
				>
					<IconPlus size={16} stroke={2} /> Connect card
				</button>
			</header>

			<ul class='bank-cards__list'>
				{cards.value.map((c) => (
					<li key={c.id} class='bank-cards__card'>
						<span class='bank-cards__brand'>
							{c.kind === 'bank' ? <IconBuildingBank size={20} /> : <IconCreditCard size={20} />}
						</span>
						<div class='bank-cards__meta'>
							<span class='bank-cards__name'>
								{c.kind === 'bank' ? c.holder : `${c.brand.toUpperCase()} ending ${c.last4}`}
							</span>
							<span class='bank-cards__sub'>
								{c.kind === 'bank' ? `Bank ••${c.last4}` : `Expires ${c.expiry}`}
							</span>
						</div>
						{c.is_default && (
							<span class='bank-cards__default'>
								<IconStarFilled size={12} /> Default
							</span>
						)}
					</li>
				))}
			</ul>

			{adding.value && (
				<form class='bank-cards__form' onSubmit={submit}>
					<SelectField
						name='card-brand'
						label='Brand'
						floating={false}
						options={BRAND_OPTIONS}
						value={brand.value}
						onChange={(v) => (brand.value = v as string)}
					/>
					<TextField
						name='card-holder'
						label='Cardholder name'
						floating={false}
						value={holder}
						onInput={(
							e: InputEvent,
						) => (holder.value = (e.currentTarget as HTMLInputElement).value)}
					/>
					<TextField
						name='card-last4'
						label='Card number'
						floating={false}
						placeholder='•••• •••• •••• 4471'
						value={last4}
						onInput={(e: InputEvent) => (last4.value = (e.currentTarget as HTMLInputElement).value)}
					/>
					<TextField
						name='card-expiry'
						label='Expiry (MM/YY)'
						floating={false}
						placeholder='09/28'
						value={expiry}
						onInput={(
							e: InputEvent,
						) => (expiry.value = (e.currentTarget as HTMLInputElement).value)}
					/>
					<button type='submit' class='bank-cards__submit'>Add card</button>
				</form>
			)}
		</section>
	);
}
