import '../../styles/components/cards/roster-card.css';
import { JSX } from 'preact';
import { IconBriefcase, IconUsersGroup } from '@tabler/icons-preact';
import { Avatar } from '../media/Avatar.tsx';
import { RosterApplicant, RosterCardProps } from '../../types/components/roster-card.ts';

/** Human label + tone class for a seat's fill state. */
const STATUS_LABEL: Record<RosterCardProps['status'], string> = {
	open: 'Open',
	filled: 'Filled',
	closed: 'Closed',
};

function ApplicantRow(
	{ applicant, canAssign, busy, onAssign }: {
		applicant: RosterApplicant;
		canAssign?: boolean;
		busy?: boolean;
		onAssign?: (id: string) => void;
	},
): JSX.Element {
	const isTeam = applicant.type === 'team';
	return (
		<li class='roster-card__applicant'>
			{applicant.type === 'team'
				? (
					<span
						class='roster-card__applicant-avatar roster-card__applicant-avatar--team'
						aria-hidden='true'
					>
						<IconUsersGroup size={16} />
					</span>
				)
				: <Avatar name={applicant.name} src={applicant.avatarUrl} size={28} />}
			<span class='roster-card__applicant-body'>
				<span class='roster-card__applicant-name'>
					{applicant.name}
					{isTeam && <span class='roster-card__tag'>Team</span>}
				</span>
				{applicant.message && <span class='roster-card__applicant-msg'>{applicant.message}</span>}
			</span>
			{canAssign && applicant.status === 'pending' && onAssign && (
				<button
					type='button'
					class='roster-card__assign'
					disabled={busy}
					onClick={() => onAssign(applicant.id)}
				>
					Assign
				</button>
			)}
			{applicant.status !== 'pending' && (
				<span
					class={`roster-card__applicant-status roster-card__applicant-status--${applicant.status}`}
				>
					{applicant.status}
				</span>
			)}
		</li>
	);
}

/**
 * @function RosterCard
 * @description Stage-staffing seat card. Shows the seat's need, required skills and budget, then
 * either its applicants (with an owner-only Assign action) or the assigned talent once filled. A
 * freelancer/team surface passes `onApply` to expose the Apply affordance.
 */
export function RosterCard(props: RosterCardProps): JSX.Element {
	const {
		title,
		status,
		requiredSkills = [],
		budgetLabel,
		applicants = [],
		assignee,
		onApply,
		onAssign,
		canAssign = false,
		busy = false,
		className,
	} = props;

	const pending = applicants.filter((a) => a.status === 'pending');

	return (
		<article
			class={[
				'roster-card',
				`roster-card--${status}`,
				className,
			].filter(Boolean).join(' ')}
		>
			<header class='roster-card__header'>
				<span class='roster-card__seat-icon' aria-hidden='true'>
					<IconBriefcase size={16} />
				</span>
				<span class='roster-card__title'>{title}</span>
				<span class={`roster-card__status roster-card__status--${status}`}>
					{STATUS_LABEL[status]}
				</span>
			</header>

			{(requiredSkills.length > 0 || budgetLabel) && (
				<div class='roster-card__meta'>
					{requiredSkills.length > 0 && (
						<ul class='roster-card__skills'>
							{requiredSkills.map((s) => <li key={s.id} class='roster-card__skill'>{s.name}</li>)}
						</ul>
					)}
					{budgetLabel && <span class='roster-card__budget'>{budgetLabel}</span>}
				</div>
			)}

			{status === 'filled' && assignee
				? (
					<div class='roster-card__assignee'>
						{assignee.type === 'team'
							? (
								<span
									class='roster-card__applicant-avatar roster-card__applicant-avatar--team'
									aria-hidden='true'
								>
									<IconUsersGroup size={16} />
								</span>
							)
							: <Avatar name={assignee.name} src={assignee.avatarUrl} size={28} />}
						<span class='roster-card__applicant-name'>{assignee.name}</span>
						<span class='roster-card__assignee-tag'>Assigned</span>
					</div>
				)
				: applicants.length > 0
				? (
					<ul class='roster-card__applicants'>
						{applicants.map((a) => (
							<ApplicantRow
								key={a.id}
								applicant={a}
								canAssign={canAssign}
								busy={busy}
								onAssign={onAssign}
							/>
						))}
					</ul>
				)
				: <p class='roster-card__empty'>No applicants yet.</p>}

			{onApply && status === 'open' && (
				<footer class='roster-card__footer'>
					<button type='button' class='roster-card__apply' disabled={busy} onClick={onApply}>
						Apply
					</button>
					{pending.length > 0 && (
						<span class='roster-card__count'>
							{pending.length} applicant{pending.length === 1 ? '' : 's'}
						</span>
					)}
				</footer>
			)}
		</article>
	);
}
