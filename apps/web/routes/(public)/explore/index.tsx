import { PageProps } from 'fresh';
import ExploreHomeWrapper from './(_islands)/Home.island.tsx';
import ExploreSearchWrapper from './(_islands)/Search.island.tsx';

/**
 * @function Explore
 * @description Server-side route controller. Reads URL parameters and delegates to the appropriate Island.
 * Passes serializable data (query strings) down as props rather than wrapping with Context on the server.
 */
export default function Explore(req: PageProps) {
	const query = req.url.searchParams.get('q');

	if (query !== null) {
		return <ExploreSearchWrapper query={query} />;
	}

	return <ExploreHomeWrapper />;
}
