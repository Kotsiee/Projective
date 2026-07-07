import { PageProps } from 'fresh';
import ExploreHomeWrapper from './(_islands)/Home.island.tsx';
import ExploreSearchWrapper from './(_islands)/Search.island.tsx';

/**
 * @function Explore
 * @description Server-side route controller. A search term (`q`) or an isolated entity type (`type`)
 * routes to the discovery matrix; otherwise the vibrant multi-entity home hub renders.
 */
export default function Explore(req: PageProps) {
	const params = req.url.searchParams;
	const query = params.get('q');
	const type = params.get('type');

	if (query !== null || type !== null) {
		// deno-lint-ignore no-explicit-any
		const authenticated = !!(req.state as any)?.isAuthenticated;
		return <ExploreSearchWrapper query={query ?? ''} authenticated={authenticated} />;
	}

	return <ExploreHomeWrapper />;
}
