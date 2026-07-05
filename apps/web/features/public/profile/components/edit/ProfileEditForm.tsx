/**
 * @file ProfileEditForm.tsx
 * @description The body shown when the owner flips into Editor Mode. Replaces the
 * public typography (headline, about, skills grid, meta sidebar) with a stack of
 * labelled input cards, all bound to the `draft` signal via `updateDraft`. This is
 * where the right-sidebar meta config collapses to (Details & metadata card).
 *
 * There is no backend — writes mutate the local draft only; `saveEditing()` in the
 * context folds the draft back into the profile signal.
 */

import '../../styles/components/edit.css';
import { Button, IconButton } from '@projective/ui';
import { SelectField, type SelectOption, TagInput, TextField } from '@projective/fields';
import { IconMoodSmile, IconPlus, IconSettings, IconUser, IconX } from '@tabler/icons-preact';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';
import type { Competency, LanguageFluency, SkillTag } from '../../contracts/Profile.ts';

// #region Options
const COMPETENCY_OPTIONS: SelectOption<Competency>[] = [
	{ label: 'Beginner', value: 'Beginner' },
	{ label: 'Intermediate', value: 'Intermediate' },
	{ label: 'Advanced', value: 'Advanced' },
	{ label: 'Expert', value: 'Expert' },
];

const FLUENCY_OPTIONS: SelectOption<LanguageFluency>[] = [
	{ label: 'Native', value: 'Native' },
	{ label: 'Fluent', value: 'Fluent' },
	{ label: 'Conversational', value: 'Conversational' },
	{ label: 'Basic', value: 'Basic' },
];

/** Sensible starting ring value when adding a new language. */
const FLUENCY_LEVEL: Record<LanguageFluency, number> = {
	Native: 100,
	Fluent: 80,
	Conversational: 55,
	Basic: 30,
};
// #endregion

export default function ProfileEditForm() {
	const { draft, updateDraft } = useProfileContext();
	const d = draft.value;

	// #region Skills
	const setSkill = (id: string, patch: Partial<SkillTag>) => {
		updateDraft({
			skills: draft.value.skills.map((s) => (s.id === id ? { ...s, ...patch } : s)),
		});
	};
	const removeSkill = (id: string) => {
		updateDraft({ skills: draft.value.skills.filter((s) => s.id !== id) });
	};
	const addSkills = (labels: string[]) => {
		const existing = draft.value.skills;
		const known = new Set(existing.map((s) => s.label.toLowerCase()));
		const additions: SkillTag[] = labels
			.filter((l) => l.trim() && !known.has(l.trim().toLowerCase()))
			.map((l) => ({
				id: `sk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
				label: l.trim(),
				competency: 'Intermediate' as Competency,
			}));
		if (additions.length) updateDraft({ skills: [...existing, ...additions] });
	};
	// #endregion

	// #region Languages
	const setLang = (id: string, patch: Partial<{ name: string; fluency: LanguageFluency }>) => {
		updateDraft({
			languages: draft.value.languages.map((l) => {
				if (l.id !== id) return l;
				const next = { ...l, ...patch };
				if (patch.fluency) next.level = FLUENCY_LEVEL[patch.fluency];
				return next;
			}),
		});
	};
	const removeLang = (id: string) => {
		updateDraft({ languages: draft.value.languages.filter((l) => l.id !== id) });
	};
	const addLang = () => {
		updateDraft({
			languages: [
				...draft.value.languages,
				{
					id: `ln_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
					name: '',
					fluency: 'Conversational',
					level: FLUENCY_LEVEL.Conversational,
				},
			],
		});
	};
	// #endregion

	return (
		<div class='pedit'>
			{/* #region Headline & about */}
			<section class='pedit__card'>
				<h3 class='pedit__card-title'>
					<IconUser size={14} /> Headline & about
				</h3>

				<div class='pedit__grid'>
					<div class='pedit__field'>
						<label class='pedit__label'>Display name</label>
						<TextField
							value={d.displayName}
							onChange={(v) => updateDraft({ displayName: v })}
							placeholder='Your name'
						/>
					</div>
					<div class='pedit__field'>
						<label class='pedit__label'>Handle</label>
						<TextField
							value={d.handle}
							onChange={(v) => updateDraft({ handle: v })}
							prefix={<span>@</span>}
							placeholder='handle'
						/>
					</div>
				</div>

				<div class='pedit__field'>
					<label class='pedit__label'>Subtitle</label>
					<TextField
						value={d.subtitle}
						onChange={(v) => updateDraft({ subtitle: v })}
						placeholder='e.g. Product Designer & Design Systems Lead'
					/>
				</div>

				<div class='pedit__field'>
					<label class='pedit__label'>Headline</label>
					<TextField
						value={d.headline}
						onChange={(v) => updateDraft({ headline: v })}
						placeholder='A one-line pitch shown at the top of your profile'
					/>
				</div>

				<div class='pedit__field'>
					<label class='pedit__label'>About</label>
					<textarea
						class='pedit__textarea'
						value={d.about}
						onInput={(e) => updateDraft({ about: e.currentTarget.value })}
						placeholder='Tell people about your work, experience and how you like to collaborate…'
					/>
					<span class='pedit__hint'>Markdown-style **bold** is supported in the public view.</span>
				</div>
			</section>
			{/* #endregion */}

			{/* #region Skills & expertise */}
			<section class='pedit__card'>
				<h3 class='pedit__card-title'>
					<IconMoodSmile size={14} /> Skills & expertise
				</h3>

				<div class='pedit__skill-list'>
					{d.skills.map((s) => (
						<div key={s.id} class='pedit__skill'>
							<span class='pedit__skill-name'>{s.label}</span>
							<div class='pedit__skill-comp'>
								<SelectField<Competency>
									options={COMPETENCY_OPTIONS}
									value={s.competency}
									onChange={(v) => setSkill(s.id, { competency: v as Competency })}
									multiple={false}
									searchable={false}
								/>
							</div>
							<IconButton
								aria-label={`Remove ${s.label}`}
								variant='secondary'
								size='small'
								onClick={() => removeSkill(s.id)}
							>
								<IconX size={16} />
							</IconButton>
						</div>
					))}
				</div>

				<div class='pedit__field'>
					<label class='pedit__label'>Add skills</label>
					<TagInput
						value={d.skills.map((s) => s.label)}
						onChange={(labels) => {
							// TagInput hands back the full label list; diff against current to
							// add the new ones (removals are handled by the chips above).
							addSkills(labels.filter((l) => !d.skills.some((s) => s.label === l)));
						}}
						placeholder='Type a skill and press Enter…'
					/>
				</div>
			</section>
			{/* #endregion */}

			{/* #region Details & metadata (the collapsed meta sidebar) */}
			<section class='pedit__card'>
				<h3 class='pedit__card-title'>
					<IconSettings size={14} /> Details & metadata
				</h3>

				<div class='pedit__grid'>
					<div class='pedit__field'>
						<label class='pedit__label'>Location</label>
						<TextField
							value={d.location}
							onChange={(v) => updateDraft({ location: v })}
							placeholder='City, Country'
						/>
					</div>
					<div class='pedit__field'>
						<label class='pedit__label'>Timezone</label>
						<TextField
							value={d.timezoneLabel}
							onChange={(v) => updateDraft({ timezoneLabel: v })}
							placeholder='e.g. BST · UTC+1'
						/>
					</div>
					<div class='pedit__field'>
						<label class='pedit__label'>Workplace</label>
						<TextField
							value={d.workplace}
							onChange={(v) => updateDraft({ workplace: v })}
							placeholder='Where you work'
						/>
					</div>
					<div class='pedit__field'>
						<label class='pedit__label'>School / University</label>
						<TextField
							value={d.school}
							onChange={(v) => updateDraft({ school: v })}
							placeholder='Where you studied'
						/>
					</div>
					<div class='pedit__field'>
						<label class='pedit__label'>Job title</label>
						<TextField
							value={d.title}
							onChange={(v) => updateDraft({ title: v })}
							placeholder='e.g. Independent Design Lead'
						/>
					</div>
					<div class='pedit__field'>
						<label class='pedit__label'>Base rate</label>
						<TextField
							value={d.baseRate}
							onChange={(v) => updateDraft({ baseRate: v })}
							placeholder='e.g. £85–£120 / hr'
						/>
					</div>
				</div>

				<div class='pedit__field'>
					<label class='pedit__label'>Languages</label>
					<div class='pedit__lang-list'>
						{d.languages.map((l) => (
							<div key={l.id} class='pedit__lang'>
								<div class='pedit__lang-name'>
									<TextField
										value={l.name}
										onChange={(v) => setLang(l.id, { name: v })}
										placeholder='Language'
									/>
								</div>
								<div class='pedit__lang-fluency'>
									<SelectField<LanguageFluency>
										options={FLUENCY_OPTIONS}
										value={l.fluency}
										onChange={(v) => setLang(l.id, { fluency: v as LanguageFluency })}
										multiple={false}
										searchable={false}
									/>
								</div>
								<IconButton
									aria-label={`Remove ${l.name || 'language'}`}
									variant='secondary'
									size='small'
									onClick={() => removeLang(l.id)}
								>
									<IconX size={16} />
								</IconButton>
							</div>
						))}
					</div>
					<Button
						variant='secondary'
						ghost
						size='small'
						startIcon={<IconPlus size={16} />}
						onClick={addLang}
					>
						Add language
					</Button>
				</div>
			</section>
			{/* #endregion */}

			{/* #region Booking & availability */}
			<section class='pedit__card'>
				<h3 class='pedit__card-title'>
					<IconSettings size={14} /> Booking & availability
				</h3>

				<label class='pedit__toggle'>
					<input
						type='checkbox'
						checked={d.publicBookingEnabled}
						onChange={(e) => updateDraft({ publicBookingEnabled: e.currentTarget.checked })}
					/>
					<span class='pedit__toggle-text'>
						<span class='pedit__toggle-title'>Allow public session bookings</span>
						<span class='pedit__toggle-desc'>
							When on, visitors can book sessions from your availability calendar.
						</span>
					</span>
				</label>
			</section>
			{/* #endregion */}
		</div>
	);
}
