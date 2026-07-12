import '../styles/components/projects-sidebar.css';
import { useProjectContext } from '@features/dashboard/projects/contexts/ProjectContext.tsx';
import { useNavigationContext } from '@features/navigation/contexts/NavigationContext.tsx';
import ProjectSidebarDetails from './project/ProjectSidebarDetails.tsx';
import ProjectSidebarList from './ProjectSidebarList.tsx';
import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand } from '@tabler/icons-preact';
import { IconButton } from '@projective/ui';
import { useEffect } from 'preact/hooks';

/** Widths for the two collapse states. Expanded is the full rail; collapsed is an icon-only rail
 *  (76px) that mirrors the primary site navigation instead of hiding the sidebar behind a stub. */
const EXPANDED_WIDTH = '300px';
const COLLAPSED_WIDTH = '76px';
const STORAGE_KEY = 'projective_projects_sidebar_collapsed';

export default function ProjectsSidebar() {
	const { project_id } = useProjectContext();
	const { middleNav, setMiddleNav } = useNavigationContext();

	const isCollapsed = middleNav.value.sideWidth === COLLAPSED_WIDTH;

	// Restore the persisted collapse preference once on mount (mirrors the primary nav, which stores
	// its own open/closed flag in localStorage).
	useEffect(() => {
		if (typeof localStorage === 'undefined') return;
		if (localStorage.getItem(STORAGE_KEY) === 'true') {
			setMiddleNav({ sideWidth: COLLAPSED_WIDTH });
		}
	}, []);

	const toggleCollapse = () => {
		const next = !isCollapsed;
		setMiddleNav({ sideWidth: next ? COLLAPSED_WIDTH : EXPANDED_WIDTH });
		if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, String(next));
	};

	return (
		<div class='layout-projects__sidebar' data-collapsed={isCollapsed ? 'true' : 'false'}>
			{project_id.value
				? (!isCollapsed && <ProjectSidebarDetails />)
				: <ProjectSidebarList collapsed={isCollapsed} />}

			<IconButton
				className='layout-projects__sidebar__close-btn'
				aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
				variant='secondary'
				rounded
				size='small'
				ghost={false}
				onClick={toggleCollapse}
			>
				{isCollapsed
					? <IconLayoutSidebarLeftExpand size={18} />
					: <IconLayoutSidebarLeftCollapse size={18} />}
			</IconButton>
		</div>
	);
}
