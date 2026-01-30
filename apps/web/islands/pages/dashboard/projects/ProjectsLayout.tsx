import '@styles/layouts/projects.css';
import { type ComponentChildren } from 'preact';
import { ProjectProvider } from '@contexts/ProjectContext.tsx';
import ProjectsSidebar from '@components/dashboard/projects/ProjectsSidebar.tsx';
import { Splitter, SplitterPane } from '@projective/ui';

type ProjectsLayoutProps = {
	url: URL;
	projectId: string | undefined;
	children: ComponentChildren;
};

export default function ProjectsLayout(props: ProjectsLayoutProps) {
	return (
		<ProjectProvider id={props.projectId}>
			{
				/* Main Wrapper: Fixed position app shell.
				f-client-nav enables Fresh's client-side navigation handling.
			*/
			}
			<div class='layout-projects' f-client-nav>
				<Splitter
					className='layout-projects__splitter'
					direction='horizontal'
					initialSizes={[20, 80]} /* Start with ~20% sidebar */
					minPaneSize={15}
					breakpoint={980} /* Collapse to stack on mobile */
				>
					{
						/* Pane 1: Sidebar
						Constraints: Min 260px approx (depending on screen)
						Visual: The padding in CSS makes the child look like a floating card.
					*/
					}
					<SplitterPane
						minSize={15}
						maxSize={50}
						className='layout-projects__pane-sidebar'
					>
						<div class='layout-projects__sidebar__container'>
							<ProjectsSidebar />
						</div>
					</SplitterPane>

					{
						/* Pane 2: Main Content
						Scrolls independently of the sidebar.
					*/
					}
					<SplitterPane className='layout-projects__pane-content'>
						<div class='layout-projects__content__container'>
							{props.children}
						</div>
					</SplitterPane>
				</Splitter>
			</div>
		</ProjectProvider>
	);
}
