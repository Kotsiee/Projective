import { ExploreProvider } from '@features/public/explore/contexts/ExploreContext.tsx';
import ExploreHomeIsland from '@features/public/explore/islands/ExploreHomeIsland.tsx';

/**
 * @function ExploreHomeWrapper
 * @description Client-side Island entry for the discovery home hub. Hosts the ExploreProvider so the
 * hero's contextual CTA can react to session-role state.
 */
export default function ExploreHomeWrapper() {
	return (
		<ExploreProvider>
			<ExploreHomeIsland />
		</ExploreProvider>
	);
}
