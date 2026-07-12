/**
 * @file ProjectsDashboard.island.tsx
 * @description The Projects Workspace landing canvas — a persona-gated, glassmorphic control hub
 * rendered when no specific project is open. Reads the active persona from UserContext, fetches the
 * shared project list once, and composes the matrix, live activity feed, templates hub and the
 * persona-specific strip (freelancer opportunities vs. client talent). It lives inside the layout's
 * swapped `<Partial>`, so it remounts on client nav; every data panel additionally revalidates on
 * navigation so nothing shows a stale snapshot without a refresh (requirement §3).
 *
 * For freelancers/teams it also carries the workspace CRM layer: a premium toggle between the live
 * Projects Workspace and the Services Pipeline, plus a filter tray that segments the client roster by
 * client account, service tier, and project contract. The live matrix is the default projects body;
 * engaging any CRM filter (or the Services tab) swaps in the filtered roster. All CRM state resets on
 * SPA navigation via `useWorkspaceFilters`.
 */

import '../styles/components/dashboard/projects-dashboard.css';
import { useSignal } from '@preact/signals';
import { ProjectFormat } from '@projective/types';
import { useUserContext } from '@features/navigation/contexts/UserContext.tsx';
import type { ProjectTemplate } from '../contracts/dashboard.ts';
import {
	applyCrmFilters,
	crmFilterActive,
	crmFilterCount,
	deriveCrmOptions,
} from '../contracts/crm.ts';
import { useWorkspaceProjects } from '../components/dashboard/useWorkspaceProjects.ts';
import { useWorkspaceCrm } from '../components/dashboard/useWorkspaceCrm.ts';
import { useWorkspaceFilters } from '../components/dashboard/useWorkspaceFilters.ts';
import WorkspaceHero from '../components/dashboard/WorkspaceHero.tsx';
import WorkspaceModeTabs from '../components/dashboard/WorkspaceModeTabs.tsx';
import CrmFilterTray from '../components/dashboard/CrmFilterTray.tsx';
import WorkspaceRoster from '../components/dashboard/WorkspaceRoster.tsx';
import ActiveProjectsMatrix from '../components/dashboard/ActiveProjectsMatrix.tsx';
import ProjectActivityFeed from '../components/dashboard/ProjectActivityFeed.tsx';
import ProjectTemplatesHub from '../components/dashboard/ProjectTemplatesHub.tsx';
import TargetedOpportunities from '../components/dashboard/TargetedOpportunities.tsx';
import TalentRecommendations from '../components/dashboard/TalentRecommendations.tsx';
import NewProjectModal from '../components/modals/NewProjectModal.tsx';

export default function ProjectsDashboard() {
	const { user } = useUserContext();
	const { rows, loading, error } = useWorkspaceProjects(12);
	const { roster } = useWorkspaceCrm();
	const { mode, filters, trayOpen, toggleFilter, clearFilters } = useWorkspaceFilters();

	// Persona gate: Client/Operator mode is the business profile OR the account-level operator flag;
	// everyone else lands on the freelancer view. The CRM/Services layer is freelancer/team-only.
	const u = user.value;
	const isClient = u?.activeProfileType === 'business' || !!u?.isOperator;
	const persona: 'freelancer' | 'client' = isClient ? 'client' : 'freelancer';
	const showServices = persona === 'freelancer';

	// New-project modal, optionally pre-filled from a template blueprint.
	const isModalOpen = useSignal(false);
	const templateData = useSignal<{ title?: string; format?: ProjectFormat } | undefined>(undefined);

	const openBlank = () => {
		templateData.value = undefined;
		isModalOpen.value = true;
	};
	const openTemplate = (t: ProjectTemplate) => {
		templateData.value = {
			title: t.name,
			format: t.format === 'one_off' ? ProjectFormat.OneOff : ProjectFormat.Pipeline,
		};
		isModalOpen.value = true;
	};

	// CRM derivations (recompute on roster/mode/filter signal reads).
	const activeMode = mode.value;
	const options = deriveCrmOptions(roster.value, activeMode);
	const filtered = applyCrmFilters(roster.value, filters.value, activeMode);
	const anyFilter = crmFilterActive(filters.value);
	const activeCount = crmFilterCount(filters.value);

	// The live projects matrix is the default body; the seeded roster takes over for the Services
	// Pipeline or whenever a client filter is engaged in the projects view.
	const showLiveMatrix = activeMode === 'projects' && !anyFilter;

	return (
		<div class='pw'>
			<WorkspaceHero
				persona={persona}
				displayName={u?.displayName ?? null}
				projects={rows}
				loading={loading}
				onCreate={openBlank}
			/>

			{showServices && (
				<div class='pw-controls'>
					<WorkspaceModeTabs
						mode={activeMode}
						onChange={(m) => (mode.value = m)}
						showServices={showServices}
					/>
					<CrmFilterTray
						open={trayOpen.value}
						onToggleOpen={() => (trayOpen.value = !trayOpen.value)}
						options={options}
						filters={filters.value}
						activeCount={activeCount}
						onToggleFilter={toggleFilter}
						onClear={clearFilters}
					/>
				</div>
			)}

			<div class='pw__grid'>
				<div class='pw__main'>
					{showLiveMatrix
						? (
							<ActiveProjectsMatrix
								rows={rows}
								loading={loading}
								error={error}
								onCreate={openBlank}
							/>
						)
						: (
							<WorkspaceRoster
								entries={filtered}
								mode={activeMode}
								note={activeMode === 'projects' ? 'Filtered client view · seeded' : undefined}
							/>
						)}

					{/* Project-oriented strips only make sense on the projects board. */}
					{showLiveMatrix && (
						<>
							{persona === 'freelancer'
								? <TargetedOpportunities />
								: <TalentRecommendations projects={rows} />}
							<ProjectTemplatesHub onUse={openTemplate} />
						</>
					)}
				</div>

				<aside class='pw__rail'>
					<ProjectActivityFeed />
				</aside>
			</div>

			{isModalOpen.value && (
				<NewProjectModal
					isOpen={isModalOpen.value}
					onClose={() => (isModalOpen.value = false)}
					templateData={templateData.value}
				/>
			)}
		</div>
	);
}
