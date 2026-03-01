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
			<div class='layout-projects' f-client-nav>
				<Splitter
					className='layout-projects__splitter'
					direction='horizontal'
					initialSizes={[20, 80]}
					minPaneSize={15}
					breakpoint={980}
				>
					<SplitterPane
						minSize={15}
						maxSize={50}
						className='layout-projects__pane-sidebar'
					>
						<div class='layout-projects__sidebar__container'>
							<ProjectsSidebar />
						</div>
					</SplitterPane>
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
