import { SelectField, TextField } from '@projective/fields';
import { useNewBusinessContext } from '@contexts/NewBusinessContext.tsx';
import { SelectOption } from '@projective/types';

export default function BusinessLegal() {
	const state = useNewBusinessContext();

	const currencyOptions: SelectOption<string>[] = [
		{ label: 'USD - United States Dollar', value: 'USD' },
		{ label: 'GBP - British Pound', value: 'GBP' },
		{ label: 'EUR - Euro', value: 'EUR' },
		{ label: 'AUD - Australian Dollar', value: 'AUD' },
		{ label: 'CAD - Canadian Dollar', value: 'CAD' },
	];

	// Mock Country list for MVP
	const countryOptions: SelectOption<string>[] = [
		{ label: 'United States', value: 'US' },
		{ label: 'United Kingdom', value: 'GB' },
		{ label: 'Canada', value: 'CA' },
		{ label: 'Australia', value: 'AU' },
		{ label: 'Germany', value: 'DE' },
		{ label: 'France', value: 'FR' },
	];

	return (
		<div className='team-details'>
			<div className='team-details__header'>
				<h2>Legal & Billing</h2>
				<p className='team-details__subtitle'>Required for generating valid tax invoices.</p>
			</div>

			<div className='team-details__row'>
				<TextField
					label='Legal Entity Name'
					value={state.legalName}
					onChange={(v) => state.legalName.value = v}
					placeholder='e.g. Acme Corporation Ltd.'
					floating
					required
					hint='Must match your bank records.'
				/>
				<TextField
					label='Billing Email'
					value={state.billingEmail}
					onChange={(v) => state.billingEmail.value = v}
					placeholder='accounts@acme.com'
					floating
					required
				/>
			</div>

			<div className='team-details__row'>
				<SelectField
					name='country'
					label='Country of Registration'
					options={countryOptions}
					value={state.country.value}
					onChange={(v) => state.country.value = v as string}
					floating
					required
					searchable
					multiple={false}
				/>
				<SelectField
					name='currency'
					label='Operating Currency'
					options={currencyOptions}
					value={state.currency.value}
					onChange={(v) => state.currency.value = v as string}
					floating
					required
					multiple={false}
					hint='Cannot be changed later.'
				/>
			</div>

			<h4 style={{ margin: '1rem 0 0.5rem 0', color: 'var(--text-main)', fontSize: '0.9rem' }}>
				Address Details
			</h4>

			<TextField
				label='Street Address'
				value={state.addressLine1}
				onChange={(v) => state.addressLine1.value = v}
				placeholder='123 Innovation Drive'
				floating
				required
			/>

			<div className='team-details__row'>
				<TextField
					label='City'
					value={state.addressCity}
					onChange={(v) => state.addressCity.value = v}
					placeholder='San Francisco'
					floating
					required
				/>
				<TextField
					label='Zip / Postal Code'
					value={state.addressZip}
					onChange={(v) => state.addressZip.value = v}
					placeholder='94105'
					floating
					required
				/>
			</div>

			<TextField
				label='Tax ID / VAT Number (Optional)'
				value={state.taxId}
				onChange={(v) => state.taxId.value = v}
				placeholder='e.g. GB123456789'
				floating
			/>
		</div>
	);
}
