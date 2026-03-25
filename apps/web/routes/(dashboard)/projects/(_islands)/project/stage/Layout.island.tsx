import StageLayoutIsland from '@features/dashboard/projects/islands/project/stage/StageLayout.tsx';
import { ComponentChildren } from 'preact';

type StageLayoutProps = {
	projectId: string;
	stageId: string;
	children: ComponentChildren;
};

export default function StageLayoutIslandWrapper(props: StageLayoutProps) {
	return <StageLayoutIsland {...props} />;
}
