/**
 * @file ProjectTemplatesHub.tsx
 * @description A horizontal drawer of curated project blueprints. Selecting one opens the real
 * New Project modal pre-filled with the template's title + format so a workspace can be spun up
 * instantly. Templates are frontend-seed (no `project_templates` table exists yet).
 */

import { Button, HScroll } from '@projective/ui';
import { IconArrowRight, IconLayoutBoard } from '@tabler/icons-preact';
import type { ProjectTemplate } from '../../contracts/dashboard.ts';
import { PROJECT_TEMPLATES } from './templates.tsx';

function TemplateCard(
	{ template, onUse }: { template: ProjectTemplate; onUse: (t: ProjectTemplate) => void },
) {
	return (
		<article class={`pw-template pw-template--${template.accent}`}>
			<div class='pw-template__head'>
				<span class='pw-template__icon' aria-hidden='true'>{template.icon}</span>
				{template.badge && <span class='pw-template__badge'>{template.badge}</span>}
			</div>
			<h3 class='pw-template__name'>{template.name}</h3>
			<p class='pw-template__tagline'>{template.tagline}</p>

			<ol class='pw-template__stages' aria-label='Stages'>
				{template.stages.map((s, i) => (
					<li key={s} class='pw-template__stage'>
						<span class='pw-template__stage-dot' aria-hidden='true'>{i + 1}</span>
						{s}
					</li>
				))}
			</ol>

			<Button
				variant='secondary'
				size='small'
				outlined
				fullWidth
				className='pw-template__cta'
				endIcon={<IconArrowRight size={15} />}
				onClick={() => onUse(template)}
			>
				Use template
			</Button>
		</article>
	);
}

export function ProjectTemplatesHub({ onUse }: { onUse: (t: ProjectTemplate) => void }) {
	return (
		<section class='pw-panel pw-templates' id='projects-templates' aria-label='Project templates'>
			<header class='pw-panel__head'>
				<div class='pw-panel__heading'>
					<span class='pw-eyebrow'>
						<IconLayoutBoard size={13} /> Blueprints
					</span>
					<h2 class='pw-panel__title'>Premium Project Templates</h2>
					<p class='pw-panel__sub'>Pre-built structures to spin up a workspace in one tap.</p>
				</div>
			</header>

			<HScroll ariaLabel='Project templates' gap={16} class='pw-templates__reel'>
				{PROJECT_TEMPLATES.map((t) => <TemplateCard key={t.id} template={t} onUse={onUse} />)}
			</HScroll>
		</section>
	);
}

export default ProjectTemplatesHub;
