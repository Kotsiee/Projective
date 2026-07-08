/**
 * @file MemberVisibilityList.tsx
 * @description The organization member visibility list (US-008 AC5): every active/invited member of
 * the business with their avatar, role and seat/status — read live from `org.get_business_members`.
 */

import { Avatar, StatusBadge } from '@projective/ui';
import type { BadgeTone } from '@projective/ui';
import { IconCrown, IconUsersGroup } from '@tabler/icons-preact';
import type { BusinessMember } from '../contracts/Overview.ts';

const ROLE_TONE: Record<string, BadgeTone> = {
	owner: 'primary',
	admin: 'violet',
	member: 'neutral',
};

const STATUS_TONE: Record<string, BadgeTone> = {
	active: 'success',
	invited: 'warning',
	left: 'neutral',
};

const JOINED_FMT = new Intl.DateTimeFormat('en-GB', {
	day: 'numeric',
	month: 'short',
	year: 'numeric',
	timeZone: 'UTC',
});

function cap(s: string): string {
	return s ? s[0].toUpperCase() + s.slice(1) : s;
}

export interface MemberVisibilityListProps {
	members: BusinessMember[];
}

export function MemberVisibilityList({ members }: MemberVisibilityListProps) {
	return (
		<section class='overview-card overview-members'>
			<header class='overview-card__header'>
				<div class='overview-card__heading'>
					<span class='overview-card__icon' aria-hidden='true'>
						<IconUsersGroup size={17} stroke={2} />
					</span>
					<div>
						<h2 class='overview-card__title'>Organization members</h2>
						<p class='overview-card__subtitle'>{members.length} on the roster</p>
					</div>
				</div>
			</header>

			{members.length === 0
				? <p class='overview-empty'>No members yet.</p>
				: (
					<ul class='overview-members__list'>
						{members.map((m) => {
							const joined = new Date(m.joined_at);
							return (
								<li key={m.user_id} class='overview-members__item'>
									<Avatar name={m.name} src={m.avatarUrl ?? undefined} size={38} />
									<div class='overview-members__body'>
										<span class='overview-members__name'>
											{m.name}
											{m.is_owner && (
												<span class='overview-members__owner' title='Owner'>
													<IconCrown size={13} stroke={2} />
												</span>
											)}
										</span>
										{m.username && <span class='overview-members__handle'>@{m.username}</span>}
									</div>
									<div class='overview-members__meta'>
										<StatusBadge tone={ROLE_TONE[m.role] ?? 'neutral'} size='sm'>
											{cap(m.role)}
										</StatusBadge>
										<StatusBadge tone={STATUS_TONE[m.status] ?? 'neutral'} size='sm' dot>
											{cap(m.status)}
										</StatusBadge>
										<span class='overview-members__seat'>
											{isNaN(joined.getTime()) ? '—' : `Joined ${JOINED_FMT.format(joined)}`}
										</span>
									</div>
								</li>
							);
						})}
					</ul>
				)}
		</section>
	);
}
