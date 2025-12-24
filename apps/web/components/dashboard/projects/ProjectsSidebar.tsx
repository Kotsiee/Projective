import '@styles/components/dashboard/projects/projects-sidebar.css';
import { useProjectContext } from '@contexts/ProjectContext.tsx';
import ProjectSidebarDetails from './project/ProjectSidebarDetails.tsx';
import ProjectSidebarList from './ProjectSidebarList.tsx';

export default function ProjectsSidebar() {
	const { project_id } = useProjectContext();
	return (
		<div class='layout-projects__sidebar'>
			{project_id.value ? <ProjectSidebarDetails /> : <ProjectSidebarList />}
		</div>
	);
}
