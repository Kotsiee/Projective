/**
 * @file ProfileCTAs.tsx
 * @description The single primary engagement CTA shown in the profile canvas —
 * Hire (person/business) or Join team. All secondary actions (Message, Follow,
 * Connect, Share, Save) now live in the side-nav action core, not the header.
 *
 * When arrived at with hire context from the Projects Workspace talent recommendations
 * (`?hire_for=<projectId>&hire_project=<name>`), the Hire label becomes project-specific —
 * "Hire {name} for {project}" — so the client's intent carries straight into the profile.
 */

import { Button } from '@projective/ui';
import { IconBriefcase, IconUsersPlus } from '@tabler/icons-preact';
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { useProfileContext } from '../../contexts/ProfileContext.tsx';

export function ProfilePrimaryCTA({ compact = false }: { compact?: boolean }) {
	const { profile, viewer, toggleMember } = useProfileContext();
	const p = profile.value;
	const size = compact ? 'small' : 'medium';
	const firstName = p.displayName.split(' ')[0];

	// Hire context threaded in from the projects workspace ("Hire X for Project Y"). Read client-side
	// so it works on both the header and sticky-header instances without new route plumbing.
	const hireProject = useSignal<string | null>(null);
	useEffect(() => {
		if (typeof globalThis === 'undefined' || !globalThis.location) return;
		const params = new URLSearchParams(globalThis.location.search);
		const name = params.get('hire_project');
		if (name && params.get('hire_for')) hireProject.value = name;
	}, []);

	if (p.kind === 'team') {
		return (
			<Button
				variant={viewer.value.isMember ? 'secondary' : 'primary'}
				size={size}
				outlined={viewer.value.isMember}
				startIcon={<IconUsersPlus size={16} />}
				onClick={toggleMember}
			>
				{viewer.value.isMember ? 'Leave team' : 'Join team'}
			</Button>
		);
	}

	const project = hireProject.value;
	const label = p.kind === 'business'
		? (project ? `Hire for ${project}` : 'Hire')
		: (project ? `Hire ${firstName} for ${project}` : `Hire ${firstName}`);

	return (
		<Button variant='primary' size={size} startIcon={<IconBriefcase size={16} />}>
			{label}
		</Button>
	);
}
