/**
 * @file templates.tsx
 * @description Curated, frontend-seed project blueprints for the Templates Hub. There is no
 * `project_templates` table yet, so these are presentation-only starting points that pre-fill the
 * real {@link NewProjectModal} (title + format) so a workspace can be spun up in one tap.
 */

import {
	IconBrandFigma,
	IconBuildingStore,
	IconCode,
	IconMovie,
	IconSparkles,
	IconSpeakerphone,
} from '@tabler/icons-preact';
import type { ProjectTemplate } from '../../contracts/dashboard.ts';

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
	{
		id: 'brand-identity',
		name: 'Brand Identity System',
		tagline: 'Logo, palette & guidelines',
		description:
			'A complete visual identity pipeline — discovery, concepts, refinement and a delivered brand book.',
		accent: 'amber',
		icon: <IconSparkles size={20} />,
		format: 'pipeline',
		stages: ['Discovery', 'Concepts', 'Refinement', 'Brand Book'],
		badge: 'Most used',
	},
	{
		id: 'product-design-sprint',
		name: 'Product Design Sprint',
		tagline: 'Research to prototype',
		description:
			'Move from research and wireframes to a high-fidelity, clickable prototype ready for testing.',
		accent: 'violet',
		icon: <IconBrandFigma size={20} />,
		format: 'pipeline',
		stages: ['Research', 'Wireframes', 'Hi-Fi UI', 'Prototype'],
	},
	{
		id: 'web-build',
		name: 'Website Build',
		tagline: 'Design → develop → launch',
		description:
			'A full marketing-site build with staged handoffs from design to development to launch QA.',
		accent: 'primary',
		icon: <IconCode size={20} />,
		format: 'pipeline',
		stages: ['UX', 'Design', 'Development', 'Launch QA'],
	},
	{
		id: 'content-engine',
		name: 'Content Engine',
		tagline: 'Always-on production',
		description:
			'A rolling content pipeline — scripting, production and edit — running as parallel streams.',
		accent: 'mint',
		icon: <IconMovie size={20} />,
		format: 'pipeline',
		stages: ['Scripting', 'Production', 'Editing', 'Publish'],
	},
	{
		id: 'campaign-launch',
		name: 'Campaign Launch',
		tagline: 'Go-to-market in one sprint',
		description:
			'A single-objective launch: creative, assets and rollout wrapped into one tight deliverable.',
		accent: 'amber',
		icon: <IconSpeakerphone size={20} />,
		format: 'one_off',
		stages: ['Creative', 'Assets', 'Rollout'],
	},
	{
		id: 'storefront',
		name: 'Storefront Setup',
		tagline: 'Launch a shop, fast',
		description:
			'Stand up a commerce storefront — catalogue, theme and payments — as a focused one-off.',
		accent: 'primary',
		icon: <IconBuildingStore size={20} />,
		format: 'one_off',
		stages: ['Catalogue', 'Theme', 'Payments'],
	},
];
