import '@styles/components/public/explore/filters.css';
import SelectField from '../../fields/SelectField.tsx';
import { signal } from '@preact/signals';
import {
	IconBriefcase,
	IconCode,
	IconMail,
	IconPalette,
	IconPaperclip,
	IconSearch,
	IconSend,
	IconStar,
	IconUser,
} from '@tabler/icons-preact';
import { useState } from 'preact/hooks';
import TextField from '../../fields/TextField.tsx';
import SliderField from '../../fields/SliderField.tsx';
import Calendar from '../../fields/datetime/Calendar.tsx';
import { DateTime, SelectOption } from '@projective/types';
import DateField from '../../fields/DateField.tsx';
import TimeField from '../../fields/TimeField.tsx';
import DateTimeField from '../../fields/DateTimeField.tsx';
import FileDrop from '../../fields/file/FileDrop.tsx';
import { MockImageOptimizer } from '@projective/utils';
import { WasmImageResizer } from '../../../utils/processors/wasm-resizer.ts';
import GlobalFileDrop from '../../wrappers/GlobalFileDrop.tsx';

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
	const [val, setVal] = useState(0);
	const [rangeVal, setRangeVal] = useState(0);
	const [freqVal, setFreqVal] = useState(0);
	const [multiVal, setMultiVal] = useState(0);
	const [date, setDate] = useState<DateTime>(DateTime.today());
	const [range, setRange] = useState<[DateTime | null, DateTime | null]>([
		DateTime.today(),
		DateTime.today().add(5, 'days'),
	]);
	const [time, setTime] = useState<DateTime>(DateTime.now());
	const [eventDate, setEventDate] = useState<DateTime | undefined>(DateTime.now());
	const [files, setFiles] = useState<File[]>([]);

	const resizer = WasmImageResizer({
		maxWidth: 1920,
		maxHeight: 1080,
		quality: 80,
	});

	const [messages, setMessages] = useState<
		{ id: number; text: string; sender: string; files?: File[] }[]
	>([
		{ id: 1, text: 'Hey! Can you send me that design?', sender: 'them' },
	]);
	const [inputText, setInputText] = useState('');
	const [attachments, setAttachments] = useState<File[]>([]);

	const handleSend = () => {
		if (!inputText && attachments.length === 0) return;

		// In a real app, you'd upload attachments here
		const newMsg = {
			id: Date.now(),
			text: inputText,
			sender: 'me',
			files: attachments,
		};

		setMessages([...messages, newMsg]);
		setInputText('');
		setAttachments([]);
	};

	return (
		<div class='explore-filters'>
			<section>
				<GlobalFileDrop
					name='chat-dropper'
					accept='image/*, .pdf'
					maxSize={10 * 1024 * 1024}
					onChange={(files) => setAttachments([...attachments, ...files])}
					overlayText='Drop to attach to message'
					multiple
				>
					<div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
						{/* Header */}
						<div
							style={{
								padding: '1rem',
								borderBottom: '1px solid #eee',
								background: '#f9fafb',
								fontWeight: 'bold',
							}}
						>
							Chat with Gemini
						</div>

						{/* Messages Area */}
						<div style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: '#fff' }}>
							{messages.map((msg) => (
								<div
									key={msg.id}
									style={{
										marginBottom: '1rem',
										textAlign: msg.sender === 'me' ? 'right' : 'left',
									}}
								>
									<div
										style={{
											display: 'inline-block',
											padding: '0.5rem 1rem',
											borderRadius: '12px',
											background: msg.sender === 'me' ? '#3b82f6' : '#f3f4f6',
											color: msg.sender === 'me' ? 'white' : 'black',
										}}
									>
										{msg.text}
										{/* Render sent images */}
										{msg.files && msg.files.length > 0 && (
											<div style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.9 }}>
												📎 {msg.files.length} file(s) attached
											</div>
										)}
									</div>
								</div>
							))}
						</div>

						{/* Input Area */}
						<div style={{ padding: '1rem', borderTop: '1px solid #eee', background: '#fff' }}>
							{/* Attachment Preview Area (Mini List) */}
							{attachments.length > 0 && (
								<div
									style={{
										display: 'flex',
										gap: '0.5rem',
										marginBottom: '0.5rem',
										overflowX: 'auto',
										paddingBottom: '0.5rem',
									}}
								>
									{attachments.map((file, i) => (
										<div
											key={i}
											style={{
												background: '#f3f4f6',
												padding: '0.25rem 0.5rem',
												borderRadius: '4px',
												fontSize: '0.75rem',
												display: 'flex',
												alignItems: 'center',
												gap: '0.5rem',
												whiteSpace: 'nowrap',
											}}
										>
											{file.name}
											<button
												onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}
												style={{
													border: 'none',
													background: 'none',
													cursor: 'pointer',
													color: '#999',
												}}
											>
												✕
											</button>
										</div>
									))}
								</div>
							)}

							<div style={{ display: 'flex', gap: '0.5rem' }}>
								<button
									style={{
										background: 'none',
										border: 'none',
										color: '#9ca3af',
										cursor: 'pointer',
									}}
								>
									<IconPaperclip />
								</button>
								<input
									type='text'
									value={inputText}
									onChange={(e) => setInputText(e.currentTarget.value)}
									placeholder='Type a message...'
									style={{
										flex: 1,
										border: '1px solid #e5e7eb',
										borderRadius: '20px',
										padding: '0.5rem 1rem',
										outline: 'none',
									}}
									onKeyDown={(e) => e.key === 'Enter' && handleSend()}
								/>
								<button
									onClick={handleSend}
									style={{
										background: '#3b82f6',
										color: 'white',
										border: 'none',
										width: '36px',
										height: '36px',
										borderRadius: '50%',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										cursor: 'pointer',
									}}
								>
									<IconSend size={18} />
								</button>
							</div>
						</div>
					</div>
				</GlobalFileDrop>

				<div style={{ padding: '2rem', maxWidth: '600px' }}>
					<h3>Client-Side Processing (Mock WASM)</h3>
					<p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
						Upload an image. It will fake a 2-second compression, change extension to .webp, and
						then mark itself as "Ready" for upload.
					</p>

					<FileDrop
						name='file-drop-2'
						label='Profile Picture'
						accept='image/*'
						layout='list'
						processors={[resizer]} // <--- Plug in the engine
						onChange={setFiles} // Only receives files AFTER processing
					/>

					<div style={{ marginTop: '1rem', padding: '1rem', background: '#eee' }}>
						<strong>Ready for Server:</strong>
						{files.map((f) => <div key={f.name}>{f.name} ({f.type})</div>)}
					</div>
				</div>

				<h3>Image Gallery (Grid)</h3>
				<FileDrop
					name='file-drop'
					label='Portfolio Images'
					multiple
					layout='grid'
					accept='image/*'
					maxSize={5 * 1024 * 1024} // 5MB
					dropzoneLabel='Drop images here'
					onChange={setFiles}
				/>
			</section>

			{/* 2. List Mode (Documents) */}
			<section>
				<h3>Documents (List)</h3>
				<FileDrop
					name='file-drop-1'
					label='Upload Resume'
					accept='.pdf,.doc,.docx'
					maxSize={2 * 1024 * 1024}
					layout='list'
				/>
			</section>

			<section>
				<h2>Date Range Selection</h2>
				<p style={{ color: '#666', marginBottom: '1rem' }}>
					<strong>How it works:</strong>{' '}
					Click a date to start the selection. Move your mouse to preview the range (Ghost Range).
					Click a second date to lock the end date. If you click "backwards" (before the start), it
					automatically swaps them.
				</p>

				<div style={{ maxWidth: '300px' }}>
					<DateField
						label='Trip Duration'
						range
						value={range}
						onChange={(newRange) => {
							// newRange comes in as [Date | null, Date | null]
							// You can destructure it immediately
							setRange(newRange as [DateTime, DateTime]);
						}}
						placeholder='Start - End'
						clearable
					/>
				</div>

				<pre style={{ marginTop: '1rem', background: '#eee', padding: '1rem' }}>
          Start: {range[0]?.toFormat('dd MMM yyyy') || 'None'} {"\n"}
          End:   {range[1]?.toFormat('dd MMM yyyy') || 'None'}
				</pre>

				<div style={{ maxWidth: '350px', padding: '2rem' }}>
					<DateTimeField
						label='Event Start'
						value={eventDate}
						onChange={setEventDate}
						placeholder='DD/MM/YYYY HH:mm'
						clearable
						hint='Pick a date to auto-advance to time'
					/>

					<pre
						style={{ marginTop: '1rem', fontSize: '0.8rem', background: '#eee', padding: '0.5rem' }}
					>
        Result ISO: {eventDate?.toISO()}
					</pre>
				</div>
			</section>

			{/* 2. Time Field Example */}
			<section>
				<h2>Time Selection (Radial)</h2>
				<div style={{ maxWidth: '300px' }}>
					<TimeField
						label='Appointment Time'
						value={time}
						onChange={setTime}
					/>
				</div>
				<pre style={{ marginTop: '1rem', background: '#eee', padding: '1rem' }}>
          Selected: {time.toFormat('HH:mm:ss')}
				</pre>
			</section>

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
					<div>
						<DateField
							label='Start Date'
							value={date}
							onChange={setDate}
							hint='Select a date or type DD/MM/YYYY'
						/>

						<div style={{ marginTop: '1rem' }}>
							Result: {date?.toISO()}
						</div>
					</div>

					<SliderField
						name='freq'
						label='Frequency (Log Scale)'
						min={20}
						max={20000}
						step={1}
						scale='logarithmic'
						value={freqVal}
						onChange={(v) => setFreqVal(v as number)}
						tooltip
					/>

					<SliderField
						name='multi'
						label='Multi-Range (Pushable)'
						range
						min={0}
						max={100}
						value={multiVal} // [20, 50, 80]
						onChange={(v) => setMultiVal(v as number)}
						tooltip={{
							position: 'bottom',
						}}
					/>

					<SliderField
						name='volume'
						label='Volume'
						min={0}
						max={100}
						value={val}
						onChange={(v) => setVal(v as number)}
					/>

					<SliderField
						name='price'
						label='Price Range'
						range
						min={0}
						max={1000}
						step={1}
						value={rangeVal}
						onChange={(v) => setRangeVal(v as number)}
						marks={[0, 250, 500, 750, 1000]}
					/>

					<SliderField
						name='price'
						label='Price Range'
						range
						min={0}
						max={1000}
						step={1}
						value={rangeVal}
						onChange={(v) => setRangeVal(v as number)}
						vertical
						height='150px'
					/>

					<SliderField
						name='price'
						label='Price Range'
						min={0}
						max={1000}
						step={1}
						value={rangeVal}
						onChange={(v) => setRangeVal(v as number)}
						vertical
						height='150px'
					/>

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
