/**
 * @file ProfileSkills.tsx
 * @description "Skills & expertise" rendered as soft, rounded-full pill tags,
 * each carrying its competency as a subtle suffix. Collapses to a handful with
 * a "+N more" toggle to keep the header area calm.
 */

import { useSignal } from '@preact/signals';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import { SkillIcon } from './skillIcons.tsx';

const COLLAPSED_COUNT = 6;

export default function ProfileSkills() {
	const { profile } = useProfileContext();
	const skills = profile.value.skills;
	const expanded = useSignal(false);

	const shown = expanded.value ? skills : skills.slice(0, COLLAPSED_COUNT);
	const hidden = skills.length - shown.length;

	return (
		<section class='profile-skills'>
			<h2 class='profile-about__heading'>Skills &amp; expertise</h2>
			<div class='profile-skills__row'>
				{shown.map((s) => (
					<span key={s.id} class='skill-pill' data-competency={s.competency}>
						<span class='skill-pill__icon'>
							<SkillIcon icon={s.icon} size={14} />
						</span>
						<span class='skill-pill__label'>{s.label}</span>
						<span class='skill-pill__comp'>{s.competency}</span>
					</span>
				))}

				{hidden > 0 && (
					<button
						type='button'
						class='skill-pill skill-pill--more'
						onClick={() => (expanded.value = true)}
					>
						+{hidden} more
					</button>
				)}
				{expanded.value && skills.length > COLLAPSED_COUNT && (
					<button
						type='button'
						class='skill-pill skill-pill--more'
						onClick={() => (expanded.value = false)}
					>
						Show less
					</button>
				)}
			</div>
		</section>
	);
}
