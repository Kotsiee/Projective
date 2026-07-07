import { ExploreProvider } from '@features/public/explore/contexts/ExploreContext.tsx';
import ExploreSearchIsland from '@features/public/explore/islands/ExploreSearchIsland.tsx';

interface ExploreSearchWrapperProps {
	query: string;
	authenticated?: boolean;
}

/**
 * @function ExploreSearchWrapper
 * @description Client-side Island entry for the discovery matrix. Hosts the ExploreProvider so all
 * nested components share one reactive state tree (query, entity facet, sort, filters, inspector).
 */
export default function ExploreSearchWrapper(props: ExploreSearchWrapperProps) {
	return (
		<ExploreProvider query={props.query}>
			<ExploreSearchIsland authenticated={props.authenticated} />
		</ExploreProvider>
	);
}
