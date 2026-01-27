import { IconTrash, IconUserPlus } from '@tabler/icons-preact';
import { SelectField, TextField } from '@projective/fields';
import { useNewTeamContext } from '@contexts/NewTeamContext.tsx';

export default function TeamMembers() {
	const state = useNewTeamContext();

	const addInvite = () => {
		state.invites.value = [...state.invites.value, { email: '', role: 'member' }];
	};

	const removeInvite = (index: number) => {
		state.invites.value = state.invites.value.filter((_, i) => i !== index);
	};

	const updateInvite = (index: number, field: 'email' | 'role', value: string) => {
		const newInvites = [...state.invites.value];
		newInvites[index] = { ...newInvites[index], [field]: value };
		state.invites.value = newInvites;
	};

	const roleOptions = [
		{ label: 'Admin (Full Access)', value: 'admin' },
		{ label: 'Member (Standard)', value: 'member' },
		{ label: 'Observer (Read Only)', value: 'observer' },
	];

	return (
		<div className='new-project__details'>
			<h2>Initial Members</h2>
			<p className='text-gray-500 mb-6'>
				Invite your core team members now. You can always add more later.
			</p>

			<div className='screening-questions__list'>
				{/* Reusing list style */}
				{state.invites.value.map((invite, index) => (
					<div
						key={index}
						className='screening-questions__item'
						style={{ alignItems: 'flex-start' }}
					>
						<div style={{ flex: 2 }}>
							<TextField
								label='Email Address'
								value={invite.email}
								onChange={(v) => updateInvite(index, 'email', v)}
								floating
								placeholder='colleague@example.com'
							/>
						</div>
						<div style={{ flex: 1 }}>
							<SelectField
								name={`role-${index}`}
								label='Role'
								options={roleOptions}
								value={invite.role}
								onChange={(v) => updateInvite(index, 'role', v as string)}
								floating
								searchable={false}
								multiple={false}
							/>
						</div>

						{state.invites.value.length > 1 && (
							<button
								type='button'
								className='btn-remove'
								onClick={() => removeInvite(index)}
								style={{ marginTop: '0.5rem' }}
							>
								<IconTrash size={18} />
							</button>
						)}
					</div>
				))}
			</div>

			<button type='button' className='btn-add' onClick={addInvite}>
				<IconUserPlus size={16} /> Add Another Member
			</button>
		</div>
	);
}
