import NewBusinessIsland from '@features/dashboard/business/islands/NewBusiness.tsx';

/**
 * `/business/new` — the multi-step business creation wizard. The wizard owns its own form state
 * provider, so the route renders the island directly.
 */
export default function NewBusinessRoute() {
	return <NewBusinessIsland />;
}
