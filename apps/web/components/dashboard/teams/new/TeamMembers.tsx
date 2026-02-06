import '@styles/components/dashboard/teams/new/team-members.css';

import { IconTrash, IconUserPlus } from '@tabler/icons-preact';
import { SelectField, TextField } from '@projective/fields';
import { Button, IconButton } from '@projective/ui';
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
		<div className='team-members'>
			<div className='team-members__header'>
				<h2>Initial Members</h2>
				<p className='team-members__subtitle'>
					Invite your core team members now. You can always add more later.
				</p>
			</div>

			<div className='team-members__list'>
				{state.invites.value.map((invite, index) => (
					<div key={index} className='team-members__item'>
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
							<div className='team-members__action'>
								<IconButton
									variant='primary'
									size='medium'
									onClick={() => removeInvite(index)}
									aria-label='Remove invite'
									outlined
									ghost
									className='team-members__remove-btn'
								>
									<IconTrash size={18} />
								</IconButton>
							</div>
						)}
					</div>
				))}
			</div>

			<div className='team-members__add'>
				<Button
					variant='primary'
					startIcon={<IconUserPlus size={16} />}
					onClick={addInvite}
					style={{ borderStyle: 'dashed' }}
					outlined
					ghost
				>
					Add Another Member
				</Button>
			</div>
		</div>
	);
}
