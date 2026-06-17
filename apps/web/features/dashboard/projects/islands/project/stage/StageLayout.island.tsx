// #region Imports
import { ComponentChildren } from 'preact';
import { useEffect } from 'preact/hooks';
import { StageContext, StageProvider, useStageContext } from '../../../contexts/StageContext.tsx';
import { ProjectContext, useProjectContext } from '../../../contexts/ProjectContext.tsx'; // NEW: Import Project Context
import { useNavigationContext } from '@features/navigation/contexts/NavigationContext.tsx';
import StageHeader from '../../../components/project/stage/StageHeader.tsx';
// #endregion

// #region Interfaces
export interface StageLayoutIslandProps {
	projectId: string;
	stageId: string;
	children: ComponentChildren;
}
// #endregion

// #region 1. Inner Layout (The Multi-Tunnel)
/**
 * Consumes the local StageContext AND ProjectContext, and tunnels BOTH
 * up to the Navigation Header so the header has full data access.
 */
function StageLayoutInner({ children }: { children: ComponentChildren }) {
	const { setMiddleNav } = useNavigationContext();

	// Grab both local states
	const stageState = useStageContext();
	const projectState = useProjectContext();

	useEffect(() => {
		setMiddleNav({
			headerHeight: '64px',
			headerContent: (
				<ProjectContext.Provider value={projectState}>
					<StageContext.Provider value={stageState}>
						<StageHeader />
					</StageContext.Provider>
				</ProjectContext.Provider>
			),
		});

		// Cleanup when unmounting
		return () => {
			setMiddleNav({
				headerHeight: '0px',
				headerContent: null,
			});
		};
	}, [stageState, projectState]);

	return (
		<div
			style={{
				flex: 1,
				minHeight: 0,
				display: 'flex',
				flexDirection: 'column',
				position: 'relative',
			}}
		>
			{children}
		</div>
	);
}
// #endregion

// #region 2. Public Export
export default function StageLayoutIsland({
	projectId,
	stageId,
	children,
}: StageLayoutIslandProps) {
	return (
		<StageProvider projectId={projectId} stageId={stageId}>
			<StageLayoutInner>
				{children}
			</StageLayoutInner>
		</StageProvider>
	);
}
// #endregion
