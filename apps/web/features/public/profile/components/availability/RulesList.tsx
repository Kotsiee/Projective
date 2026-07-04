/**
 * @file RulesList.tsx
 * @description The freelancer's recurring availability rules, listed under the
 * mini-month. Each rule shows its colour swatch, label, the ISO weekdays it
 * covers and every time-slot (including the breaks between multiple windows).
 */

import '../../styles/components/availability.css';
import { IconClock } from '@tabler/icons-preact';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import type { AvailabilityRule } from '../../contracts/Profile.ts';
import { minutesToTime, WEEKDAY_LABELS } from '../../utils.ts';

/** "Mon, Tue, Wed" from ISO weekday numbers. */
function daysLabel(days: number[]): string {
	return [...days].sort((a, b) => a - b).map((d) => WEEKDAY_LABELS[d - 1]).join(', ');
}

function RuleCard({ rule }: { rule: AvailabilityRule }) {
	return (
		<li class='avail-rule'>
			<span class='avail-rule__swatch' style={{ background: rule.colour }} />
			<div class='avail-rule__body'>
				<div class='avail-rule__top'>
					<span class='avail-rule__label'>{rule.label}</span>
					<span class='avail-rule__days'>{daysLabel(rule.days)}</span>
				</div>
				<ul class='avail-rule__slots'>
					{rule.slots.map((slot, i) => (
						<li key={i} class='avail-rule__slot'>
							<IconClock size={12} />
							<span class='avail-rule__slot-time'>
								{minutesToTime(slot.start, true)} – {minutesToTime(slot.end, true)}
							</span>
							{slot.label && <span class='avail-rule__slot-name'>{slot.label}</span>}
						</li>
					))}
				</ul>
			</div>
		</li>
	);
}

export default function RulesList() {
	const { profile } = useProfileContext();
	const rules = profile.value.availability.rules;

	return (
		<div class='avail-rules'>
			<h4 class='avail-rules__title'>Weekly availability</h4>
			{rules.length === 0
				? <p class='avail-rules__empty'>No recurring availability set.</p>
				: (
					<ul class='avail-rules__list'>
						{rules.map((r) => <RuleCard key={r.id} rule={r} />)}
					</ul>
				)}
		</div>
	);
}
