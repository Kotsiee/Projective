/**
 * @file WithdrawalForm.tsx
 * @description The Dynamic Withdrawal wrapper. Built on `@projective/fields` `MoneyField` +
 * `SelectField`, with instantaneous client-side validation enforcing the strict £5 structural
 * minimum (converted into the active display currency) on every change/blur via
 * `useMinAmountValidation`. Frontend-only: submit shows a confirmation summary, no network call.
 */

import { computed, useSignal } from '@preact/signals';
import {
	MoneyField,
	SelectField,
	type SelectOption,
	useMinAmountValidation,
} from '@projective/fields';
import { IconCircleCheck } from '@tabler/icons-preact';
import { convertCents } from '../contracts/Wallet.ts';
import { useWalletContext } from '../contexts/WalletContext.tsx';

/** The structural minimum: £5.00 in GBP minor units. */
const MIN_GBP_CENTS = 500;

export function WithdrawalForm() {
	const { wallet, currency, cards, format, fx } = useWalletContext();

	const amount = useSignal<number>(0);
	const error = useSignal<string | undefined>(undefined);
	const destination = useSignal<string>(
		cards.value.find((c) => c.is_default)?.id ?? cards.value[0]?.id ?? '',
	);
	const done = useSignal(false);

	// The £5 floor, re-expressed in the current display currency.
	const minCents = convertCents(MIN_GBP_CENTS, 'GBP', currency.value, fx);
	const { validate, minLabel } = useMinAmountValidation({
		min_cents: minCents,
		currency: currency.value,
	});

	const available = wallet.value.balances.available_cents;

	const cardOptions: SelectOption<string>[] = cards.value.map((c) => ({
		label: c.kind === 'bank' ? `${c.holder} ••${c.last4}` : `${c.brand.toUpperCase()} ••${c.last4}`,
		value: c.id,
	}));

	const enteredCents = computed(() => Math.round(amount.value * 100));
	const overBalance = computed(() => enteredCents.value > available);

	const handleChange = (v: number) => {
		amount.value = v;
		done.value = false;
		const belowMin = validate(v);
		if (belowMin) error.value = belowMin;
		else if (Math.round((v ?? 0) * 100) > available) error.value = 'Exceeds available balance';
		else error.value = undefined;
	};

	const canSubmit = computed(() =>
		amount.value > 0 && !error.value && !overBalance.value && !!destination.value
	);

	const submit = (e: Event) => {
		e.preventDefault();
		if (!canSubmit.value) {
			// Force-surface the minimum error if the field is empty.
			error.value = validate(amount.value) ?? error.value ?? 'Enter a valid amount';
			return;
		}
		done.value = true;
	};

	const destCard = cards.value.find((c) => c.id === destination.value);

	return (
		<form class='withdrawal-form' onSubmit={submit}>
			<div class='withdrawal-form__available'>
				<span>Available to withdraw</span>
				<strong>{format(available)}</strong>
			</div>

			<MoneyField
				label='Amount'
				floating={false}
				currency={currency.value}
				value={amount}
				error={error}
				hint={`Minimum withdrawal is ${minLabel}`}
				onChange={handleChange}
			/>

			<SelectField
				name='withdrawal-destination'
				label='Destination'
				floating={false}
				options={cardOptions}
				value={destination.value}
				onChange={(v) => (destination.value = v as string)}
			/>

			<div class='withdrawal-form__summary'>
				<div class='withdrawal-form__summary-row'>
					<span>Amount</span>
					<span>{amount.value ? format(enteredCents.value) : '—'}</span>
				</div>
				<div class='withdrawal-form__summary-row'>
					<span>Destination</span>
					<span>{destCard ? `••${destCard.last4}` : '—'}</span>
				</div>
				<div class='withdrawal-form__summary-row withdrawal-form__summary-row--total'>
					<span>You'll receive</span>
					<span>{amount.value && !error.value ? format(enteredCents.value) : '—'}</span>
				</div>
			</div>

			<button
				type='submit'
				class='withdrawal-form__submit'
				disabled={!canSubmit.value}
			>
				Withdraw {amount.value && !error.value ? format(enteredCents.value) : ''}
			</button>

			{done.value && (
				<div class='withdrawal-form__done' role='status'>
					<IconCircleCheck size={18} stroke={2} />
					<span>
						Withdrawal of {format(enteredCents.value)} to ••{destCard?.last4} initiated.
					</span>
				</div>
			)}
		</form>
	);
}
