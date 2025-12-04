import '@styles/components/dashboard/messages/messages-sidebar.css';
import SelectField from '../../fields/SelectField.tsx';
import { signal } from '@preact/signals';
import { IconMessages, IconMessagesOff, IconSearch, IconStar } from '@tabler/icons-preact';
import { SelectOption } from '@projective/types';

const messageTypes: SelectOption[] = [
	{ value: 'all', label: 'All Messages', icon: <IconMessages /> },
	{ value: 'unread', label: 'Unread', icon: <IconMessagesOff /> },
	{ value: 'starred', label: 'Starred', icon: <IconStar /> },
	// { value: 'jfdg7yt4783gyuwefv7t67234g', label: 'Projective Team', group: 'Teams' },
	// { value: 'fghjfert7843e4fg67uifer8ye', label: 'Second Scent', group: 'Teams' },
	// { value: 'dsfvgjhdsfgyufgdhjkdfsmghk', label: 'UI/UX Design', group: 'Services' },
	// { value: 'gy4r3ur744rfyutf6fegyyfduj', label: 'Art', group: 'Services' },
];

const selectedMessageType = signal('all');

export default function MessagesSidebar() {
	return (
		<div class='layout-messages__sidebar'>
			<div class='layout-messages__sidebar__header'>
				<SelectField
					name='message-type'
					value={selectedMessageType}
					options={messageTypes}
					multiple={false}
					searchable={false}
					onChange={(value) => selectedMessageType.value = value as string}
				/>
				<button type='button'>
					<IconSearch />
				</button>
			</div>
			<div>
				{messageTypes.filter((e) => !!e.icon).map((type) => (
					<label key={type.value}>
						<input
							type='radio'
							value={type.value}
							hidden
							checked={selectedMessageType.value === type.value}
						/>
						{type.icon}
					</label>
				))}
			</div>
		</div>
	);
}
