/**
 * @file WorkspaceModeTabs.tsx
 * @description The premium segment control at the top of the Projects workspace — switches instantly
 * between the live "Projects Workspace" board and the "Services Pipeline" client view. The Services
 * segment only appears for freelancers/teams (clients have no service pipeline); with a single
 * segment there is nothing to toggle, so the control renders nothing.
 */

import type { JSX } from 'preact';
import { IconBriefcase, IconSparkles } from '@tabler/icons-preact';
import type { WorkspaceMode } from '../../contracts/crm.ts';

interface WorkspaceModeTabsProps {
	mode: WorkspaceMode;
	onChange: (mode: WorkspaceMode) => void;
	/** Whether the active persona is a freelancer or team (gates the Services segment). */
	showServices: boolean;
}

export default function WorkspaceModeTabs(
	{ mode, onChange, showServices }: WorkspaceModeTabsProps,
) {
	if (!showServices) return null;

	const segments: { id: WorkspaceMode; label: string; icon: JSX.Element }[] = [
		{ id: 'projects', label: 'Projects Workspace', icon: <IconBriefcase size={16} /> },
		{ id: 'services', label: 'Services Pipeline', icon: <IconSparkles size={16} /> },
	];

	return (
		<div class='pw-modetabs' role='tablist' aria-label='Workspace view'>
			{segments.map((s) => (
				<button
					key={s.id}
					type='button'
					role='tab'
					aria-selected={mode === s.id}
					data-active={mode === s.id}
					class='pw-modetabs__seg'
					onClick={() => onChange(s.id)}
				>
					{s.icon}
					<span>{s.label}</span>
				</button>
			))}
		</div>
	);
}
