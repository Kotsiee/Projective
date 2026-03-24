import { ExploreProvider } from '../../../../features/explore/contexts/ExploreContext.tsx';
import ExploreSearchIsland from '../../../../features/explore/islands/ExploreSearchIsland.tsx';
/**
 * @interface ExploreSearchWrapperProps
 */
interface ExploreSearchWrapperProps {
	query: string;
}

/**
 * @function ExploreSearchWrapper
 * @description Client-side Island entry point for the Search flow.
 * Hosts the ExploreProvider so all nested client components share the same state tree.
 */
export default function ExploreSearchWrapper(props: ExploreSearchWrapperProps) {
	const { query } = props;

	return (
		<ExploreProvider query={query}>
			<div className='explore-search-layout'>
				<ExploreSearchIsland />
			</div>
		</ExploreProvider>
	);
}
