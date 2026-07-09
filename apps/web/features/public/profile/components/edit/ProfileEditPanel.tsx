/**
 * @file ProfileEditPanel.tsx
 * @description The Editor-Mode canvas. Instead of one long form, the owner navigates specialised
 * modules from the side rail (`editSection`); this router renders the matching panel:
 *   - details      → visual-identity canvas + the metadata/skills/booking form (ProfileEditForm)
 *   - services     → Services control centre (add / hide-show / tab visibility)
 *   - projects     → Projects control centre
 *   - portfolio    → Portfolio control centre
 *   - teams        → Teams & Businesses control centre
 *   - experience   → Experience control centre
 *   - education    → Education control centre
 *   - members      → Members control centre
 *   - settings     → account/booking settings (ProfileEditForm's settings surface)
 *   - availability → pointer to the dedicated availability planner
 */

import { Button } from '@projective/ui';
import { IconCalendarEvent } from '@tabler/icons-preact';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import ProfileEditForm from './ProfileEditForm.tsx';
import DetailsMedia from './DetailsMedia.tsx';
import EntityControlCenter, { type ControlItem } from './EntityControlCenter.tsx';

export default function ProfileEditPanel() {
	const { profile, editSection } = useProfileContext();
	const p = profile.value;
	const section = editSection.value;

	switch (section) {
		case 'details':
			return (
				<div class='pedit-details'>
					<DetailsMedia />
					<ProfileEditForm />
				</div>
			);

		case 'services':
			return (
				<EntityControlCenter
					tabKey='services'
					title='Services'
					description='The offerings buyers can hire or book from your profile.'
					addLabel='Add service'
					emptyHint='No services yet — add your first offering.'
					items={p.services.map((s): ControlItem => ({
						id: s.id,
						title: s.title,
						subtitle: s.priceLabel,
					}))}
				/>
			);

		case 'projects':
			return (
				<EntityControlCenter
					tabKey='projects'
					title='Projects'
					description='Projects you own or have contributed to.'
					addLabel='Add project'
					emptyHint='No projects yet.'
					items={p.projects.map((pr): ControlItem => ({
						id: pr.id,
						title: pr.name,
						subtitle: pr.role ? `${pr.affiliation} · ${pr.role}` : pr.affiliation,
						group: pr.relationship === 'owned' ? 'Owned' : 'Worked on',
					}))}
				/>
			);

		case 'portfolio':
			return (
				<EntityControlCenter
					tabKey='portfolio'
					title='Portfolio'
					description='Selected pieces of work shown in your portfolio masonry.'
					addLabel='Add piece'
					emptyHint='No portfolio pieces yet.'
					items={p.portfolio.map((it): ControlItem => ({
						id: it.id,
						title: it.title,
						subtitle: it.category,
					}))}
				/>
			);

		case 'teams':
			return (
				<EntityControlCenter
					tabKey='teams'
					title='Teams & businesses'
					description='The teams and businesses affiliated with your profile.'
					addLabel='Add affiliation'
					emptyHint='No teams or businesses yet.'
					items={[
						...p.teams.map((t): ControlItem => ({
							id: t.id,
							title: t.name,
							subtitle: t.role,
							group: 'Teams',
						})),
						...p.businesses.map((b): ControlItem => ({
							id: b.id,
							title: b.name,
							subtitle: b.role,
							group: 'Businesses',
						})),
					]}
				/>
			);

		case 'experience':
			return (
				<EntityControlCenter
					title='Experience'
					description='Your work history timeline.'
					addLabel='Add role'
					emptyHint='No experience entries yet.'
					items={p.experience.map((e): ControlItem => ({
						id: e.id,
						title: e.title,
						subtitle: `${e.organisation} · ${e.period}`,
					}))}
				/>
			);

		case 'education':
			return (
				<EntityControlCenter
					title='Education'
					description='Your education timeline.'
					addLabel='Add education'
					emptyHint='No education entries yet.'
					items={p.education.map((e): ControlItem => ({
						id: e.id,
						title: e.title,
						subtitle: `${e.organisation} · ${e.period}`,
					}))}
				/>
			);

		case 'members':
			return (
				<EntityControlCenter
					title='Members'
					description='People with access to this workspace and the roles they hold.'
					addLabel='Invite member'
					emptyHint='No additional members — invite collaborators to manage this profile.'
					items={[
						...p.teams.map((t): ControlItem => ({
							id: `mem_${t.id}`,
							title: t.name,
							subtitle: `${t.memberCount} members · you are ${t.role}`,
						})),
					]}
				/>
			);

		case 'settings':
			// Reuse the booking/metadata surface; settings live at the tail of the details form.
			return <ProfileEditForm />;

		case 'availability':
			return (
				<div class='pedit'>
					<section class='pedit__card'>
						<h3 class='pedit__card-title pedit__card-title--lg'>Availability</h3>
						<p class='ecc__desc'>
							Your working hours, time-off and bookings are managed in the dedicated availability
							planner.
						</p>
						<Button
							href={`/${p.handle}/availability`}
							variant='primary'
							startIcon={<IconCalendarEvent size={16} />}
						>
							Open availability planner
						</Button>
					</section>
				</div>
			);

		default:
			return null;
	}
}
