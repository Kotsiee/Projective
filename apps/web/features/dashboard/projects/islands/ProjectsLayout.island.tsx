// #region Imports
import '../styles/layouts/projects.css';
import { useEffect } from 'preact/hooks';
import { useNavigationContext } from '@features/navigation/contexts/NavigationContext.tsx';
import { ProjectContext, ProjectProvider, useProjectContext } from '../contexts/ProjectContext.tsx';
import ProjectsSidebar from '../components/ProjectsSidebar.tsx';
// #endregion

// #region Interfaces
export interface ProjectsLayoutProps {
	projectId?: string;
	// deno-lint-ignore no-explicit-any
	children?: any;
}
// #endregion

// #region 1. Inner Layout (The Tunnel)
/**
 * This component sits inside the ProjectProvider, so it has access to the project state.
 * It grabs that state and explicitly passes it up to the Sidebar via NavigationContext.
 */
function ProjectsLayoutInner({ children }: { children: any }) {
	const { setMiddleNav } = useNavigationContext();
	const projectState = useProjectContext(); // Grab the local context state

	useEffect(() => {
		setMiddleNav({
			show: true,
			sideWidth: '300px',
			sideContent: (
				<ProjectContext.Provider value={projectState}>
					<ProjectsSidebar />
				</ProjectContext.Provider>
			),
		});

		return () => {
			setMiddleNav({
				show: false,
				sideContent: null,
			});
		};
	}, [projectState]);

	return (
		<div class='projects-layout'>
			{children}
		</div>
	);
}
// #endregion

// #region 2. Public Export
/**
 * The Island root creates the Provider locally.
 * This ensures the main body gets the context natively without mutating the global App tree.
 */
export default function ProjectsLayoutIsland({ projectId, children }: ProjectsLayoutProps) {
	return (
		<ProjectProvider id={projectId}>
			<ProjectsLayoutInner>
				{children}
			</ProjectsLayoutInner>
		</ProjectProvider>
	);
}
// #endregion
