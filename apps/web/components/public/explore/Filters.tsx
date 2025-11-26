import '@styles/components/public/explore/filters.css';
import SelectField from '../../fields/SelectField.tsx';
import { SelectOption } from '../../../types/fields/select.ts';
import { signal } from '@preact/signals';
import {
	IconBriefcase,
	IconCode,
	IconMail,
	IconPalette,
	IconSearch,
	IconStar,
	IconUser,
} from '@tabler/icons-preact';
import { useState } from 'preact/hooks';
import TextField from '../../fields/TextField.tsx';

const ROLE_OPTIONS: SelectOption[] = [
	{ label: 'Frontend Developer', value: 'fe', icon: <IconCode size={18} />, group: 'Engineering' },
	{ label: 'Backend Developer', value: 'be', icon: <IconCode size={18} />, group: 'Engineering' },
	{ label: 'DevOps Engineer', value: 'ops', icon: <IconCode size={18} />, group: 'Engineering' },
	{ label: 'Product Designer', value: 'pd', icon: <IconPalette size={18} />, group: 'Design' },
	{ label: 'UX Researcher', value: 'ux', icon: <IconUser size={18} />, group: 'Design' },
	{ label: 'Product Manager', value: 'pm', icon: <IconBriefcase size={18} />, group: 'Management' },
];

const USER_OPTIONS: SelectOption[] = [
	{ label: 'Alice Johnson', value: 1, avatarUrl: 'https://i.pravatar.cc/150?u=1', group: 'Active' },
	{ label: 'Bob Smith', value: 2, avatarUrl: 'https://i.pravatar.cc/150?u=2', group: 'Active' },
	{
		label: 'Charlie Brown',
		value: 3,
		avatarUrl: 'https://i.pravatar.cc/150?u=3',
		group: 'Offline',
		disabled: true,
	},
	{
		label: 'David Williams',
		value: 4,
		avatarUrl: 'https://i.pravatar.cc/150?u=4',
		group: 'Active',
	},
];

export default function ExploreFilters() {
	const [role, setRole] = useState<string>('fe');
	const [team, setTeam] = useState<number[]>([1, 2]);
	const [status, setStatus] = useState<string>('');
	const [errorValue, setErrorValue] = useState<string>('');

	const [textVal, setTextVal] = useState('');
	const [passVal, setPassVal] = useState('');
	const [phoneVal, setPhoneVal] = useState('');
	const [dateVal, setDateVal] = useState('');
	const [licVal, setLicVal] = useState('');
	const [price, setPrice] = useState('');
	const [card, setCard] = useState('');

	return (
		<div class='explore-filters'>
			<section
				style={{
					marginBottom: '3rem',
					padding: '1.5rem',
					border: '1px solid #ddd',
					borderRadius: '8px',
				}}
			>
				<h2 style={{ marginBottom: '1.5rem' }}>Text Fields</h2>

				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
					<TextField
						name='price'
						label='Project Budget'
						variant='currency'
						value={price}
						onChange={(v) => setPrice(v.toString())}
						placeholder='0.00'
					/>

					<TextField
						name='cc'
						label='Card Number'
						variant='credit-card'
						value={card}
						onChange={(v) => setCard(v.toString())}
						placeholder='0000 0000 0000 0000'
					/>

					<TextField
						name='phone'
						label='Phone Number'
						mask='(999) 999-9999'
						placeholder='(555) 000-0000'
						inputMode='tel'
						value={phoneVal}
						onChange={(v) => setPhoneVal(v.toString())}
					/>

					<TextField
						name='date'
						label='Date (MM/DD/YYYY)'
						mask='99/99/9999'
						placeholder='MM/DD/YYYY'
						value={dateVal}
						onChange={(v) => setDateVal(v.toString())}
						hint="Try typing letters (they won't work)"
					/>

					<TextField
						name='license'
						label='License Plate (3 Letters - 3 Numbers)'
						mask='aaa-999'
						placeholder='ABC-123'
						value={licVal}
						onChange={(v) => setLicVal(v.toString())}
						// This mask automatically capitalizes due to 'a' logic if we enforced upper in logic,
						// but current hook is case-insensitive for 'a'.
						// You can enhance hook to enforce case if needed.
					/>

					<TextField
						name='bio'
						label='Biography'
						multiline
						rows={3}
						placeholder='Tell us about yourself...'
					/>

					<TextField
						name='notes'
						label='Auto-Growing Notes'
						multiline
						autoGrow
						floatingLabel
						placeholder='Start typing...'
					/>

					<TextField
						name='basic'
						label='Standard Input'
						placeholder='Type something...'
						value={textVal}
						onChange={(v) => setTextVal(v.toString())}
						clearable
					/>

					<TextField
						name='floating'
						label='Floating Label'
						floatingLabel
						value={textVal}
						onChange={(v) => setTextVal(v.toString())}
						hint='Labels float when focused or filled'
					/>

					<TextField
						name='password'
						label='Password'
						type='password'
						showPasswordToggle
						value={passVal}
						onChange={(v) => setPassVal(v.toString())}
						floatingLabel
					/>

					<TextField
						name='email'
						label='Email Address'
						type='email'
						iconLeft={<IconMail size={18} />}
						placeholder='user@example.com'
					/>

					<TextField
						name='search'
						label='Search'
						type='search'
						prefix={<IconSearch size={18} />}
						placeholder='Search query...'
						className='search-field'
					/>

					<TextField
						name='limits'
						label='Character Limit'
						maxLength={20}
						showCount
						value={textVal}
						onChange={(v) => setTextVal(v.toString())}
					/>

					<TextField
						name='prefix'
						label='Price'
						prefix='$'
						suffix='USD'
						placeholder='0.00'
						type='number'
					/>

					<TextField
						name='error'
						label='Validation Error'
						value='Invalid Data'
						error='This field is required'
					/>
				</div>
			</section>
		</div>
	);
}
