import { StageLayoutIsland } from 'packages/features/dashboard/projects/client.ts';
import { ComponentChildren } from 'preact';

type StageLayoutProps = {
	projectId: string;
	stageId: string;
	children: ComponentChildren;
};

export default function StageLayoutIslandWrapper(props: StageLayoutProps) {
	return <StageLayoutIsland {...props} />;
}
