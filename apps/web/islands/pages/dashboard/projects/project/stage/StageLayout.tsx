import '@styles/layouts/stage.css';
import { type ComponentChildren } from 'preact';
import { StageProvider } from '@contexts/StageContext.tsx';
import StageHeader from '@components/dashboard/projects/project/stage/StageHeader.tsx';

type StageLayoutProps = {
	projectId: string;
	stageId: string;
	children: ComponentChildren;
};

export default function StageLayout(props: StageLayoutProps) {
	return (
		<StageProvider projectId={props.projectId} stageId={props.stageId}>
			<div class='layout-stage'>
				<StageHeader />
				<div>
					{props.children}
				</div>
			</div>
		</StageProvider>
	);
}
