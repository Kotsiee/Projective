import '../styles/components/projects-sidebar.css';
import { useProjectContext } from '@features/dashboard/projects/contexts/ProjectContext.tsx';
import { useNavigationContext } from '@features/navigation/contexts/NavigationContext.tsx';
import ProjectSidebarDetails from './project/ProjectSidebarDetails.tsx';
import ProjectSidebarList from './ProjectSidebarList.tsx';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-preact';
import { IconButton } from '@projective/ui';

export default function ProjectsSidebar() {
	const { project_id } = useProjectContext();
	const { middleNav, setMiddleNav } = useNavigationContext();

	const collapsedWidth = '30px';

	const isCollapsed = middleNav.value.sideWidth === collapsedWidth;

	const toggleCollapse = () => {
		setMiddleNav({ sideWidth: isCollapsed ? '280px' : collapsedWidth });
	};

	return (
		<div class='layout-projects__sidebar'>
			{!isCollapsed && (
				project_id.value ? <ProjectSidebarDetails /> : <ProjectSidebarList />
			)}

			<IconButton
				className='layout-projects__sidebar__close-btn'
				aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
				variant='secondary'
				rounded
				size='small'
				ghost={false}
				onClick={toggleCollapse}
			>
				{isCollapsed ? <IconChevronRight size={18} /> : <IconChevronLeft size={18} />}
			</IconButton>
		</div>
	);
}
