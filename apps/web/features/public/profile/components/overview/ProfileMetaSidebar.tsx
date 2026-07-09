/**
 * @file ProfileMetaSidebar.tsx
 * @description The right-hand details pane. No structural "Details" heading.
 * The current availability status + local time anchor the very top; the
 * remaining meta (location, response time, rate, member since, ratings) and
 * languages (plain text + fluency) stack below.
 */

import {
	IconBolt,
	IconCalendarStats,
	IconClock,
	IconCurrencyPound,
	IconMapPin,
	IconStarFilled,
	IconUserStar,
} from '@tabler/icons-preact';
import { WorkloadCapacityGauge } from '@projective/charts';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import { localTimeAtOffset } from '../../utils.ts';
import { StatusDot } from '../header/StatusDot.tsx';

function Row(
	{ icon, label, value }: { icon: preact.ComponentChildren; label: string; value: string },
) {
	return (
		<div class='pmeta-row'>
			<span class='pmeta-row__icon'>{icon}</span>
			<span class='pmeta-row__label'>{label}</span>
			<span class='pmeta-row__value'>{value}</span>
		</div>
	);
}

export default function ProfileMetaSidebar() {
	const { profile } = useProfileContext();
	const m = profile.value.meta;
	const p = profile.value;

	return (
		<aside class='pmeta'>
			{/* Top-prioritised: presence + local time */}
			<div class='pmeta-top'>
				<div class='pmeta-top__status'>
					<StatusDot status={p.status} />
					<span class='pmeta-top__status-label'>{p.statusLabel}</span>
				</div>
				<div class='pmeta-top__time'>
					<span class='pmeta-top__clock'>
						<IconClock size={14} /> {localTimeAtOffset(m.utcOffsetMinutes)}
					</span>
					<span class='pmeta-top__tz'>{m.timezoneLabel}</span>
				</div>
			</div>

			<div class='pmeta-divider' />

			<div class='pmeta-rows'>
				<Row icon={<IconMapPin size={15} />} label='Location' value={m.location} />
				<Row icon={<IconBolt size={15} />} label='Responds' value={m.responseTime} />
				<Row icon={<IconCurrencyPound size={15} />} label='Base rate' value={m.baseRate} />
				<Row icon={<IconCalendarStats size={15} />} label='Member since' value={m.memberSince} />
			</div>

			<div class='pmeta-divider' />

			<div class='pmeta-rows'>
				<div class='pmeta-rating'>
					<span class='pmeta-rating__icon'>
						<IconStarFilled size={15} />
					</span>
					<span class='pmeta-rating__label'>As freelancer</span>
					<span class='pmeta-rating__value'>
						{m.ratings.asFreelancer.score.toFixed(1)}{' '}
						<span class='pmeta-muted'>({m.ratings.asFreelancer.count})</span>
					</span>
				</div>
				<div class='pmeta-rating'>
					<span class='pmeta-rating__icon'>
						<IconUserStar size={15} />
					</span>
					<span class='pmeta-rating__label'>As client</span>
					<span class='pmeta-rating__value'>
						{m.ratings.asClient.score.toFixed(1)}{' '}
						<span class='pmeta-muted'>({m.ratings.asClient.count})</span>
					</span>
				</div>
			</div>

			{m.workload && (
				<>
					<div class='pmeta-divider' />
					<div class='pmeta-workload'>
						<span class='pmeta-workload__label'>Current capacity</span>
						<WorkloadCapacityGauge
							variant='bar'
							current={m.workload.current}
							max={m.workload.cap}
							label='Workload'
							caption='Live intensity across active projects'
						/>
					</div>
				</>
			)}

			<div class='pmeta-divider' />

			<div class='pmeta-langs'>
				{m.languages.map((l) => (
					<div key={l.id} class='pmeta-lang'>
						<span class='pmeta-lang__name'>{l.name}</span>
						<span class='pmeta-lang__fluency'>{l.fluency}</span>
					</div>
				))}
			</div>
		</aside>
	);
}
